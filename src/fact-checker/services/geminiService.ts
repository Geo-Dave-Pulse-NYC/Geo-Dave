import { GoogleGenAI, Type } from "@google/genai";

// Initialize the client
// API Key is loaded from import.meta.env.VITE_API_KEY
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const NAIVE_MODEL = "gemini-3-flash-preview";
const RESEARCH_MODEL = "gemini-3-pro-preview"; // Better for search/tools
const VERIFICATION_MODEL = "gemini-3-flash-preview";

/**
 * Step 1: Generate 5 common questions about the brand.
 */
export const generateBrandQuestions = async (
  brandName: string,
): Promise<string[]> => {
  const prompt = `Generate 5 common, specific questions that a potential customer might ask about the brand "${brandName}". 
  Return only the questions as a JSON array of strings. Do not include markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: NAIVE_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const text = response.text;
    if (!text) return [];

    // Parse JSON
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions. Please try again.");
  }
};

/**
 * Step 2: Get a "Naive" answer from the AI without context.
 */
export const getNaiveAnswer = async (
  question: string,
  brandName: string,
): Promise<string> => {
  const prompt = `Answer the following question about "${brandName}" based ONLY on your internal knowledge. Do not search the web. Keep it concise (max 2-3 sentences).
  
  Question: ${question}`;

  try {
    const response = await ai.models.generateContent({
      model: NAIVE_MODEL,
      contents: prompt,
    });
    return response.text || "No answer generated.";
  } catch (error) {
    console.error("Error getting naive answer:", error);
    return "Error generating answer.";
  }
};

/**
 * Step 3: Get the "Ground Truth" using Google Search targeted at the official URL.
 */
export const getGroundTruth = async (
  question: string,
  officialUrl: string,
): Promise<{ answer: string; sources: string[] }> => {
  // We explicitly ask it to use the tool and search the specific site
  const prompt = `Find the answer to the question: "${question}" by searching the official website: ${officialUrl}. 
  Use the query format "site:${officialUrl} ${question}".
  Summarize the answer found on the official website. If the information is not found on the website, state that clearly.`;

  try {
    const response = await ai.models.generateContent({
      model: RESEARCH_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Could not find information.";

    // Extract sources from grounding metadata
    const chunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: string[] = [];

    chunks.forEach((chunk) => {
      if (chunk.web?.uri) {
        sources.push(chunk.web.uri);
      }
    });

    return { answer: text, sources: Array.from(new Set(sources)) }; // Dedup sources
  } catch (error) {
    console.error("Error getting ground truth:", error);
    return { answer: "Error retrieving ground truth.", sources: [] };
  }
};

/**
 * Step 4: Verify the Naive Answer against the Ground Truth.
 */
export const verifyAnswer = async (
  question: string,
  naiveAnswer: string,
  groundTruth: string,
): Promise<{
  isAccurate: boolean;
  reasoning: string;
  patch?: string;
  remediation?: {
    summary: string;
    steps: string[];
    preventionTips: string[];
    suggestedFaqQuestion?: string;
    suggestedFaqAnswer?: string;
  };
}> => {
  const prompt = `
  You are a strict Fact-Checker AND a GEO (Generative Engine Optimization) consultant. 
  Compare the AI Answer with the Official Ground Truth.
  
  Question: ${question}
  
  AI Answer (The Lie/Hallucination Candidate): "${naiveAnswer}"
  
  Official Ground Truth (From Website): "${groundTruth}"
  
  Task:
  1. Determine if the AI Answer contradicts the Official Ground Truth. 
  2. If the Ground Truth says "information not found", and the AI Answer makes a specific claim, mark it as HALLUCINATION (unsafe claim).
  3. If the AI answer is generally correct but misses minor details, mark ACCURATE.
  4. If the AI answer is factually wrong based on the Ground Truth, mark HALLUCINATION.

  If HALLUCINATION is detected, provide detailed remediation:
  - A summary of what went wrong
  - Specific action steps the brand should take to fix this
  - Tips to prevent this type of hallucination in the future
  - A suggested FAQ question and answer to add to the website

  Output JSON format:
  {
    "status": "ACCURATE" | "HALLUCINATION",
    "reasoning": "Short explanation of why.",
    "patch": "A markdown formatted text block correcting the error. Only provide if HALLUCINATION.",
    "remediation": {
      "summary": "One sentence summary of the issue.",
      "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
      "preventionTips": ["Tip 1: ...", "Tip 2: ..."],
      "suggestedFaqQuestion": "The exact question to add to FAQ",
      "suggestedFaqAnswer": "The official answer to add"
    }
  }
  
  Only include remediation if status is HALLUCINATION.
  `;

  try {
    const response = await ai.models.generateContent({
      model: VERIFICATION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ["ACCURATE", "HALLUCINATION"] },
            reasoning: { type: Type.STRING },
            patch: { type: Type.STRING },
            remediation: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                preventionTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                suggestedFaqQuestion: { type: Type.STRING },
                suggestedFaqAnswer: { type: Type.STRING },
              },
            },
          },
          required: ["status", "reasoning"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      isAccurate: result.status === "ACCURATE",
      reasoning: result.reasoning,
      patch: result.patch,
      remediation: result.remediation,
    };
  } catch (error) {
    console.error("Error verifying answer:", error);
    return { isAccurate: true, reasoning: "Verification failed due to error." };
  }
};

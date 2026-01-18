import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeminiAnalysis } from "../types";

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    mentioned: {
      type: Type.BOOLEAN,
      description:
        "True if the specific target brand is explicitly mentioned in the text.",
    },
    sentiment: {
      type: Type.STRING,
      enum: ["positive", "neutral", "negative", "mixed"],
      description:
        "The overall sentiment towards the brand if mentioned. If not mentioned, use neutral.",
    },
    summary: {
      type: Type.STRING,
      description:
        "A very brief, one-sentence summary of how the brand is portrayed. If not mentioned, summarize what the article promotes instead.",
    },
    authorName: {
      type: Type.STRING,
      description:
        "The name of the article author if found in the content. Look for 'By [Name]', 'Author: [Name]', bylines, or similar patterns. Return empty string if not found.",
    },
    authorEmail: {
      type: Type.STRING,
      description:
        "The email address of the author if found in the content. Look for email patterns like name@domain.com. Return empty string if not found.",
    },
    outreachEmail: {
      type: Type.STRING,
      description:
        "If the brand is NOT mentioned in the article, generate a professional outreach email to the author requesting inclusion. The email should: 1) Reference the specific article topic, 2) Explain why the brand would be relevant, 3) Be polite and concise. Use placeholders like [Your Name] and [Your Title]. Return empty string if brand IS mentioned.",
    },
  },
  required: ["mentioned", "sentiment", "summary"],
};

export const analyzeContent = async (
  content: string,
  brandName: string,
): Promise<GeminiAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  const prompt = `
    Analyze the following web content context for the brand "${brandName}".
    
    Determine if the brand is explicitly mentioned. 
    Analyze the sentiment if mentioned.
    Provide a one-sentence summary.
    
    IMPORTANT: Also extract the author's name and email address if present in the content.
    - Look for bylines like "By John Smith", "Author: Jane Doe", "Written by..."
    - Look for email addresses in the format name@domain.com
    - If the brand is NOT mentioned, finding author info is especially important for outreach.
    
    If the brand is NOT mentioned, also generate a professional outreach email to request inclusion.
    The email should:
    - Have a compelling subject line
    - Reference the specific article topic
    - Explain why "${brandName}" would be a valuable addition
    - Be concise and professional
    - Use [Your Name] and [Your Title] as placeholders
    
    Web Content:
    ${content.slice(0, 10000)} 
  `;
  // Truncating content to ~10k chars to avoid token limits on very large raw dumps, though Gemini 1.5/2.5 handles large context well.

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        systemInstruction:
          "You are a specialized GEO (Generative Engine Optimization) Auditor. You analyze search results to see if a brand is present and how they are perceived.",
      },
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    const result = JSON.parse(response.text) as GeminiAnalysis;
    return result;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback in case of parsing error or API failure
    return {
      mentioned: false,
      sentiment: "neutral",
      summary: "Could not analyze content due to an error.",
    };
  }
};

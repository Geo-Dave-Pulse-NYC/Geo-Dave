import { GoogleGenAI, Type } from "@google/genai";
import { GeoAnalysisResult } from "../types";

const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const analyzeGeo = async (
  clientMarkdown: string,
  competitorMarkdown: string,
  clientUrl: string,
  competitorUrl: string,
): Promise<GeoAnalysisResult> => {
  if (!envApiKey) {
    throw new Error("Gemini API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: envApiKey });

  const prompt = `
    You are a GEO (Generative Engine Optimization) expert. 
    Compare the following two website contents (provided as Markdown).
    
    Client URL: ${clientUrl}
    Client Content:
    ${clientMarkdown.slice(0, 15000)} 
    
    Competitor URL: ${competitorUrl}
    Competitor Content:
    ${competitorMarkdown.slice(0, 15000)}
    
    Task:
    1. Analyze why the 'Competitor' page might be better optimized for AI readability than the 'Client' page (or vice versa, but focus on the gap).
    2. Identify 3 specific reasons focusing on: Schema Markup, Question/Answer formatting, and Data Density.
    3. Estimate word counts, header counts (H1/H2), and give a subjective "Data Density Score" (1-10) based on how much factual, structured data is present.
    4. Provide a verdict on who wins.
    5. Generate a COMPLETE HTML code snippet that the Client can directly copy-paste into their website's <head> section. 
       - If recommending JSON-LD schema, wrap it in a <script type="application/ld+json"> tag.
       - The code should be ready to use with NO modifications needed.
       - Include proper formatting and indentation.

    Return the result strictly in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metrics: {
              type: Type.OBJECT,
              properties: {
                clientWordCount: { type: Type.INTEGER },
                competitorWordCount: { type: Type.INTEGER },
                clientHeaderCount: { type: Type.INTEGER },
                competitorHeaderCount: { type: Type.INTEGER },
                clientDataDensity: {
                  type: Type.INTEGER,
                  description: "Score from 1 to 10",
                },
                competitorDataDensity: {
                  type: Type.INTEGER,
                  description: "Score from 1 to 10",
                },
              },
              required: [
                "clientWordCount",
                "competitorWordCount",
                "clientHeaderCount",
                "competitorHeaderCount",
                "clientDataDensity",
                "competitorDataDensity",
              ],
            },
            verdict: { type: Type.STRING },
            analysisPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedFix: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                codeBlock: { type: Type.STRING },
                language: { type: Type.STRING },
              },
              required: ["description", "codeBlock", "language"],
            },
          },
          required: ["metrics", "verdict", "analysisPoints", "recommendedFix"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as GeoAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze content with Gemini.");
  }
};

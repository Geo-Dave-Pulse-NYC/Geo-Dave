import { TavilyResponse } from "../types";

export const searchWeb = async (query: string): Promise<TavilyResponse> => {
  const apiKey = import.meta.env.VITE_TAVILY_API_KEY;
  if (!apiKey)
    throw new Error(
      "Tavily API Key is missing. Please set VITE_TAVILY_API_KEY in .env.local",
    );

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: query,
      search_depth: "advanced",
      include_raw_content: true,
      max_results: 5,
      include_answer: false,
      include_images: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Tavily API failed with status ${response.status}`,
    );
  }

  return await response.json();
};

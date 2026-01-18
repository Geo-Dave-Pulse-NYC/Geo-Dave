import { ScrapedContent } from "../types";

// NOTE: In a real production app, scraping logic should often be server-side
// to protect API keys and handle CORS reliably.
// For this client-side demo, we use the Firecrawl API directly.

export const scrapeUrl = async (url: string): Promise<ScrapedContent> => {
  const apiKey = import.meta.env.VITE_FIRECRAWL_API_KEY;
  if (!url) return { url, markdown: "", error: "No URL provided" };
  if (!apiKey)
    return {
      url,
      markdown: "",
      error:
        "Firecrawl API Key is missing. Please set VITE_FIRECRAWL_API_KEY in .env.local",
    };

  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: url,
        formats: ["markdown"],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to scrape ${url}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Firecrawl v1 response structure check
    const markdown = data.data?.markdown || "";

    return {
      url,
      markdown,
    };
  } catch (error: any) {
    console.error("Scraping error:", error);
    return {
      url,
      markdown: "",
      error: error.message || "Unknown scraping error",
    };
  }
};

// Mock data for demonstration if no key is provided (optional behavior,
// but for this specific request we generally expect a key or failure)
export const getMockContent = (url: string): string => {
  return `
# Mock Content for ${url}

This is simulated markdown content because a Firecrawl API key was not provided or the fetch failed.
The page contains various headers and data points relevant to GEO analysis.

## Key Features
- Feature 1
- Feature 2
- Feature 3

## Data Section
| Metric | Value |
|--------|-------|
| Speed  | 100ms |
| Size   | 50kb  |

This simulated content allows the AI to perform a structural analysis test.
  `;
};

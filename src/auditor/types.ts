export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  raw_content?: string;
  score: number;
}

export interface TavilyResponse {
  results: TavilySearchResult[];
  query: string;
  answer?: string;
}

export interface GeminiAnalysis {
  mentioned: boolean;
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  summary: string;
  authorName?: string;
  authorEmail?: string;
  outreachEmail?: string;
}

export interface AuditItem extends TavilySearchResult {
  rank: number;
  analysis: GeminiAnalysis | null;
  error?: string;
}

export interface AuditState {
  status: "idle" | "searching" | "analyzing" | "complete" | "error";
  items: AuditItem[];
  score: number;
  error?: string;
}

export interface ApiKeys {
  tavily: string;
}

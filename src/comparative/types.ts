export interface GeoMetrics {
  clientWordCount: number;
  competitorWordCount: number;
  clientHeaderCount: number;
  competitorHeaderCount: number;
  clientDataDensity: number; // Score 1-10
  competitorDataDensity: number; // Score 1-10
}

export interface RecommendedFix {
  description: string;
  codeBlock: string;
  language: string;
}

export interface GeoAnalysisResult {
  metrics: GeoMetrics;
  verdict: string;
  analysisPoints: string[];
  recommendedFix: RecommendedFix;
}

export interface ScrapedContent {
  url: string;
  markdown: string;
  error?: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  SCRAPING = 'SCRAPING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}
export enum AnalysisStatus {
  IDLE = "IDLE",
  GENERATING_QUESTIONS = "GENERATING_QUESTIONS",
  ANALYZING = "ANALYZING",
  COMPLETE = "COMPLETE",
  ERROR = "ERROR",
}

export interface VerificationResult {
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
}

export interface AnalysisItem {
  id: string;
  question: string;
  naiveAnswer: string | null;
  groundTruthAnswer: string | null;
  groundTruthSources: string[];
  verification: VerificationResult | null;
  status: "pending" | "loading" | "done" | "error";
}

export interface AppState {
  brandName: string;
  officialUrl: string;
  status: AnalysisStatus;
  items: AnalysisItem[];
  progressMessage: string;
  error?: string;
}

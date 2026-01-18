import React, { useState } from "react";
import { PlayCircle, Sparkles } from "lucide-react";
import ResultsDashboard from "./components/ResultsDashboard";
import { AuditState, AuditItem } from "./types";
import { searchWeb } from "./services/tavily";
import { analyzeContent } from "./services/gemini";

const App: React.FC = () => {
  const [inputs, setInputs] = useState({
    brand: "",
    query: "",
  });

  const [auditState, setAuditState] = useState<AuditState>({
    status: "idle",
    items: [],
    score: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const runAudit = async () => {
    if (!inputs.brand || !inputs.query) {
      alert("Please enter a brand and a search query.");
      return;
    }

    setAuditState({ status: "searching", items: [], score: 0 });

    try {
      // 1. Search Web
      const searchResponse = await searchWeb(inputs.query);

      if (!searchResponse.results || searchResponse.results.length === 0) {
        throw new Error("No results found for this query.");
      }

      // Deduplicate results by URL (keep first occurrence)
      const seenUrls = new Set<string>();
      const uniqueResults = searchResponse.results.filter((res) => {
        // Normalize URL by removing trailing slashes and query params for comparison
        const normalizedUrl = res.url
          .split("?")[0]
          .replace(/\/+$/, "")
          .toLowerCase();
        if (seenUrls.has(normalizedUrl)) {
          return false;
        }
        seenUrls.add(normalizedUrl);
        return true;
      });

      const initialItems: AuditItem[] = uniqueResults.map((res, index) => ({
        ...res,
        rank: index + 1,
        analysis: null,
      }));

      setAuditState({ status: "analyzing", items: initialItems, score: 0 });

      // 2. Analyze Results (Parallel execution for speed)
      // Note: In production, might want to limit concurrency, but 5 requests is fine for Gemini Flash.
      const analyzedItems = await Promise.all(
        initialItems.map(async (item) => {
          try {
            // Use raw_content if available (Tavily advanced depth), else standard content
            const textToAnalyze = item.raw_content || item.content;
            const analysis = await analyzeContent(textToAnalyze, inputs.brand);
            return { ...item, analysis };
          } catch (e) {
            console.error(`Analysis failed for result ${item.rank}`, e);
            return {
              ...item,
              analysis: {
                mentioned: false,
                sentiment: "neutral" as const,
                summary: "Failed to analyze this content.",
              },
            };
          }
        }),
      );

      // 3. Finalize State
      setAuditState({
        status: "complete",
        items: analyzedItems,
        score: analyzedItems.filter((i) => i.analysis?.mentioned).length,
      });
    } catch (error: any) {
      setAuditState({
        status: "error",
        items: [],
        score: 0,
        error: error.message || "An unknown error occurred",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header & Inputs */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Sparkles className="w-5 h-5 text-indigo-500 mr-2" />
              New Audit Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Target Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={inputs.brand}
                  onChange={handleInputChange}
                  placeholder="e.g. Nike, Global Edge"
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Search Query
                </label>
                <input
                  type="text"
                  name="query"
                  value={inputs.query}
                  onChange={handleInputChange}
                  placeholder="e.g. Best running shoes 2024"
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 border"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={runAudit}
                disabled={
                  auditState.status === "searching" ||
                  auditState.status === "analyzing"
                }
                className={`flex items-center px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all
                  ${
                    auditState.status === "searching" ||
                    auditState.status === "analyzing"
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
                  }`}
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                {auditState.status === "searching" ||
                auditState.status === "analyzing"
                  ? "Audit Running..."
                  : "Run Audit"}
              </button>
            </div>
          </div>

          {/* Results Area */}
          <ResultsDashboard auditState={auditState} />
        </div>
      </main>
    </div>
  );
};

export default App;

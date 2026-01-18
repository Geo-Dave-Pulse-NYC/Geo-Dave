import { useState } from "react";
import { AnalysisStatus, GeoAnalysisResult } from "./types";
import { scrapeUrl } from "./services/scraperService";
import { analyzeGeo } from "./services/geminiService";
import ComparisonTable from "./components/ComparisonTable";
import AnalysisReport from "./components/AnalysisReport";

function App() {
  const [clientUrl, setClientUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeoAnalysisResult | null>(null);

  const handleCompare = async () => {
    if (!clientUrl || !competitorUrl) {
      setError("Please enter both URLs.");
      return;
    }

    setStatus(AnalysisStatus.SCRAPING);
    setError(null);
    setResult(null);

    try {
      // Real Scraping using env variable
      const [clientRes, competitorRes] = await Promise.all([
        scrapeUrl(clientUrl),
        scrapeUrl(competitorUrl),
      ]);

      if (clientRes.error)
        throw new Error(`Client URL Error: ${clientRes.error}`);
      if (competitorRes.error)
        throw new Error(`Competitor URL Error: ${competitorRes.error}`);

      const clientMarkdown = clientRes.markdown;
      const competitorMarkdown = competitorRes.markdown;

      setStatus(AnalysisStatus.ANALYZING);

      const analysisResult = await analyzeGeo(
        clientMarkdown,
        competitorMarkdown,
        clientUrl,
        competitorUrl,
      );

      setResult(analysisResult);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                GEO Comparative Agent
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Generative Engine Optimization
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="client-url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Client URL
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="url"
                  id="client-url"
                  className="block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 border"
                  placeholder="https://mysite.com"
                  value={clientUrl}
                  onChange={(e) => setClientUrl(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="competitor-url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Competitor URL
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="url"
                  id="competitor-url"
                  className="block w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 sm:text-sm px-4 py-3 border"
                  placeholder="https://competitor.com"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleCompare}
              disabled={
                status === AnalysisStatus.SCRAPING ||
                status === AnalysisStatus.ANALYZING
              }
              className={`
                px-8 py-3 rounded-lg text-white font-semibold shadow-lg transition-all duration-200 flex items-center
                ${
                  status === AnalysisStatus.SCRAPING ||
                  status === AnalysisStatus.ANALYZING
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105 active:scale-95"
                }
              `}
            >
              {status === AnalysisStatus.SCRAPING && (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Reading websites...
                </>
              )}
              {status === AnalysisStatus.ANALYZING && (
                <>
                  <svg
                    className="animate-pulse -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                  Analyzing Strategy...
                </>
              )}
              {(status === AnalysisStatus.IDLE ||
                status === AnalysisStatus.COMPLETE ||
                status === AnalysisStatus.ERROR) && <>Compare Strategy</>}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Results */}
        {result && status === AnalysisStatus.COMPLETE && (
          <div className="animate-fade-in-up">
            <ComparisonTable
              metrics={result.metrics}
              clientUrl={clientUrl}
              competitorUrl={competitorUrl}
            />
            <AnalysisReport result={result} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          Powered by Gemini 2.0 & Firecrawl • GEO Comparative Agent
        </div>
      </footer>
    </div>
  );
}

export default App;

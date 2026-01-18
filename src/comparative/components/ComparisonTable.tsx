import React from "react";
import { GeoMetrics } from "../types";

interface ComparisonTableProps {
  metrics: GeoMetrics;
  clientUrl: string;
  competitorUrl: string;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  metrics,
  clientUrl,
  competitorUrl,
}) => {
  const getScoreColor = (
    clientScore: number,
    competitorScore: number,
    higherIsBetter = true,
  ) => {
    if (higherIsBetter) {
      if (clientScore > competitorScore)
        return {
          client: "text-green-600 bg-green-50",
          competitor: "text-red-600 bg-red-50",
        };
      if (clientScore < competitorScore)
        return {
          client: "text-red-600 bg-red-50",
          competitor: "text-green-600 bg-green-50",
        };
    } else {
      if (clientScore < competitorScore)
        return {
          client: "text-green-600 bg-green-50",
          competitor: "text-red-600 bg-red-50",
        };
      if (clientScore > competitorScore)
        return {
          client: "text-red-600 bg-red-50",
          competitor: "text-green-600 bg-green-50",
        };
    }
    return {
      client: "text-gray-600 bg-gray-50",
      competitor: "text-gray-600 bg-gray-50",
    };
  };

  const getDensityBar = (score: number) => {
    const percentage = (score / 10) * 100;
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              score >= 7
                ? "bg-green-500"
                : score >= 4
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-semibold w-8">{score}/10</span>
      </div>
    );
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const wordColors = getScoreColor(
    metrics.clientWordCount,
    metrics.competitorWordCount,
  );
  const headerColors = getScoreColor(
    metrics.clientHeaderCount,
    metrics.competitorHeaderCount,
  );
  const densityColors = getScoreColor(
    metrics.clientDataDensity,
    metrics.competitorDataDensity,
  );

  return (
    <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Content Metrics Comparison
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Metric
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-blue-600 uppercase tracking-wider">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400 normal-case font-normal">
                    Your Site
                  </span>
                  <span className="truncate max-w-[150px]" title={clientUrl}>
                    {extractDomain(clientUrl)}
                  </span>
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-purple-600 uppercase tracking-wider">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400 normal-case font-normal">
                    Competitor
                  </span>
                  <span
                    className="truncate max-w-[150px]"
                    title={competitorUrl}
                  >
                    {extractDomain(competitorUrl)}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Word Count */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="font-medium text-gray-700">Word Count</span>
                </div>
              </td>
              <td
                className={`px-6 py-4 text-center font-semibold ${wordColors.client}`}
              >
                {metrics.clientWordCount.toLocaleString()}
              </td>
              <td
                className={`px-6 py-4 text-center font-semibold ${wordColors.competitor}`}
              >
                {metrics.competitorWordCount.toLocaleString()}
              </td>
            </tr>

            {/* Header Count */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  <span className="font-medium text-gray-700">
                    Headers (H1/H2)
                  </span>
                </div>
              </td>
              <td
                className={`px-6 py-4 text-center font-semibold ${headerColors.client}`}
              >
                {metrics.clientHeaderCount}
              </td>
              <td
                className={`px-6 py-4 text-center font-semibold ${headerColors.competitor}`}
              >
                {metrics.competitorHeaderCount}
              </td>
            </tr>

            {/* Data Density */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  <span className="font-medium text-gray-700">
                    Data Density Score
                  </span>
                </div>
              </td>
              <td className={`px-6 py-4 ${densityColors.client}`}>
                {getDensityBar(metrics.clientDataDensity)}
              </td>
              <td className={`px-6 py-4 ${densityColors.competitor}`}>
                {getDensityBar(metrics.competitorDataDensity)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Overall:{" "}
            {metrics.clientDataDensity >= metrics.competitorDataDensity ? (
              <span className="text-green-600 font-medium">
                Your site has competitive content density
              </span>
            ) : (
              <span className="text-amber-600 font-medium">
                Competitor has higher content density
              </span>
            )}
          </span>
          <span className="text-xs text-gray-400">
            Higher scores indicate better AI readability
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;

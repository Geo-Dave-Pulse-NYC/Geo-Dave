import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import { AnalysisItem } from "../types";

interface AnalysisCardProps {
  item: AnalysisItem;
}

// Custom components for markdown styling
const markdownComponents: Partial<Components> = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="text-sm">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
  h2: ({ children }) => (
    <h2 className="text-base font-bold mb-2">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
  code: ({ children }) => (
    <code className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {children}
    </a>
  ),
};

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ item }) => {
  const {
    question,
    naiveAnswer,
    groundTruthAnswer,
    groundTruthSources,
    verification,
    status,
  } = item;

  if (status === "pending") return null;

  if (status === "loading") {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const isAccurate = verification?.isAccurate;
  const badgeColor = isAccurate
    ? "bg-green-100 text-green-800 border-green-200"
    : "bg-red-100 text-red-800 border-red-200";

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-start gap-4">
        <h3 className="text-lg font-semibold text-slate-800 leading-snug">
          {question}
        </h3>
        {verification && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide whitespace-nowrap ${badgeColor}`}
          >
            {isAccurate ? "Accurate" : "Hallucination"}
          </span>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Naive Answer */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              AI Simulation (The "Lie")
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-slate-700 text-sm prose prose-sm prose-slate max-w-none">
              <ReactMarkdown components={markdownComponents}>
                {naiveAnswer || ""}
              </ReactMarkdown>
            </div>
          </div>

          {/* Ground Truth */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Ground Truth (Official)
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-slate-700 text-sm prose prose-sm prose-slate max-w-none">
              <ReactMarkdown components={markdownComponents}>
                {groundTruthAnswer || ""}
              </ReactMarkdown>

              {groundTruthSources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200/50">
                  <p className="text-xs text-slate-500 mb-1">Sources:</p>
                  <ul className="space-y-1">
                    {groundTruthSources.map((source, idx) => (
                      <li key={idx}>
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate block"
                        >
                          {source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification & Patch */}
        {verification && !isAccurate && (
          <div className="mt-4 animate-fade-in-up space-y-4">
            {/* Issue Summary */}
            <div className="bg-red-50 border border-red-100 rounded-lg p-5">
              <h4 className="text-red-800 font-semibold flex items-center gap-2 mb-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
                Hallucination Detected
              </h4>
              <div className="text-sm text-red-700 mb-4 prose prose-sm prose-red max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {verification.reasoning || ""}
                </ReactMarkdown>
              </div>

              {verification.patch && (
                <div className="bg-white border border-red-200 rounded p-4 relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(verification.patch || "")
                      }
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded"
                    >
                      Copy Patch
                    </button>
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">
                    Suggested Content Patch
                  </div>
                  <div className="text-sm text-slate-800 prose prose-sm max-w-none">
                    <ReactMarkdown components={markdownComponents}>
                      {verification.patch}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Remediation Section */}
            {verification.remediation && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
                  <h4 className="text-white font-bold flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    How to Fix This Hallucination
                  </h4>
                </div>

                <div className="p-5 space-y-5">
                  {/* Summary */}
                  {verification.remediation.summary && (
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                        Issue Summary
                      </div>
                      <p className="text-slate-700 text-sm">
                        {verification.remediation.summary}
                      </p>
                    </div>
                  )}

                  {/* Action Steps */}
                  {verification.remediation.steps &&
                    verification.remediation.steps.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          Action Steps
                        </div>
                        <div className="space-y-2">
                          {verification.remediation.steps.map((step, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 bg-white rounded-lg p-3 border border-amber-100"
                            >
                              <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span className="text-slate-700 text-sm">
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Prevention Tips */}
                  {verification.remediation.preventionTips &&
                    verification.remediation.preventionTips.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          Prevention Tips
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {verification.remediation.preventionTips.map(
                            (tip, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 bg-white rounded-lg p-3 border border-amber-100"
                              >
                                <svg
                                  className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span className="text-slate-600 text-sm">
                                  {tip}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Suggested FAQ */}
                  {verification.remediation.suggestedFaqQuestion &&
                    verification.remediation.suggestedFaqAnswer && (
                      <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                        <div className="bg-amber-100 px-4 py-2 border-b border-amber-200">
                          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Suggested FAQ to Add
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <div className="text-xs text-slate-500 mb-1">
                              Question:
                            </div>
                            <div className="font-medium text-slate-800">
                              {verification.remediation.suggestedFaqQuestion}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">
                              Answer:
                            </div>
                            <div className="text-slate-700 text-sm bg-slate-50 rounded p-3 border border-slate-200">
                              {verification.remediation.suggestedFaqAnswer}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const faqContent = `Q: ${verification.remediation?.suggestedFaqQuestion}\n\nA: ${verification.remediation?.suggestedFaqAnswer}`;
                              navigator.clipboard.writeText(faqContent);
                            }}
                            className="w-full mt-2 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            Copy FAQ Content
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Verification */}
        {verification && isAccurate && (
          <div className="mt-4">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div>
                <h4 className="text-green-800 font-medium text-sm">
                  Verification Passed
                </h4>
                <div className="text-green-700 text-sm mt-1 prose prose-sm prose-green max-w-none">
                  <ReactMarkdown components={markdownComponents}>
                    {verification.reasoning || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

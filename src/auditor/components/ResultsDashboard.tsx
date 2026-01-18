import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertTriangle,
  TrendingUp,
  Search,
  Mail,
  Copy,
  User,
  X,
  Send,
} from "lucide-react";
import { AuditState, AuditItem } from "../types";

interface ResultsDashboardProps {
  auditState: AuditState;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ auditState }) => {
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (auditState.status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
        <Search className="w-12 h-12 mb-4 opacity-20" />
        <p>Ready to audit. Enter a brand and query above.</p>
      </div>
    );
  }

  if (auditState.status === "searching" || auditState.status === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-600">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="font-medium text-lg animate-pulse">
          {auditState.status === "searching"
            ? "Scanning the web via Tavily..."
            : "Gemini is reading the content..."}
        </p>
        <p className="text-sm text-slate-400 mt-2">
          This may take up to 20 seconds.
        </p>
      </div>
    );
  }

  if (auditState.status === "error") {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-4">
        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Audit Failed</h3>
          <p className="text-red-700 mt-1">{auditState.error}</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalResults = auditState.items.length;
  const mentions = auditState.items.filter((i) => i.analysis?.mentioned).length;
  const visibilityScore = Math.round((mentions / totalResults) * 100);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`p-6 rounded-xl border flex items-center space-x-4 ${getScoreColor(visibilityScore)}`}
        >
          <div className="flex-1">
            <p className="text-sm font-medium opacity-80 uppercase tracking-wide">
              Visibility Score
            </p>
            <div className="text-4xl font-bold mt-1">
              {mentions}/{totalResults}
            </div>
          </div>
          <TrendingUp className="w-10 h-10 opacity-50" />
        </div>

        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center space-x-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              Coverage
            </p>
            <div className="text-4xl font-bold text-slate-800 mt-1">
              {visibilityScore}%
            </div>
          </div>
          <CheckCircle2 className="w-10 h-10 text-indigo-100" />
        </div>

        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center space-x-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              Missed Opps
            </p>
            <div className="text-4xl font-bold text-slate-800 mt-1">
              {totalResults - mentions}
            </div>
          </div>
          <XCircle className="w-10 h-10 text-red-100" />
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">
            Search Engine Results Analysis
          </h3>
          <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
            Top 5 Analyzed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 w-16">Rank</th>
                <th className="px-6 py-3 w-1/4">Source</th>
                <th className="px-6 py-3 w-24 text-center">Mentioned?</th>
                <th className="px-6 py-3">AI Summary & Sentiment</th>
                <th className="px-6 py-3 w-48">Author Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditState.items.map((item) => (
                <tr
                  key={item.rank}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-slate-400">
                    #{item.rank}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-slate-900 hover:text-indigo-600 flex items-center group"
                      >
                        {item.title}
                        <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <span className="text-xs text-slate-400 truncate max-w-[200px] mt-1">
                        {item.url}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.analysis?.mentioned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Yes
                      </span>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" /> No
                        </span>
                        <span className="mt-1 text-[10px] uppercase font-bold text-red-500 tracking-wider">
                          Missed Opp
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {item.analysis ? (
                        <>
                          <p className="text-slate-600 leading-relaxed">
                            {item.analysis.summary}
                          </p>
                          {item.analysis.mentioned && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 uppercase tracking-wide">
                                Sentiment:
                              </span>
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded capitalize
                                 ${
                                   item.analysis.sentiment === "positive"
                                     ? "bg-green-100 text-green-700"
                                     : item.analysis.sentiment === "negative"
                                       ? "bg-red-100 text-red-700"
                                       : "bg-slate-100 text-slate-600"
                                 }`}
                              >
                                {item.analysis.sentiment}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 italic">
                          Analysis failed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {!item.analysis?.mentioned && item.analysis ? (
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
                      >
                        <Send className="w-3 h-3" />
                        Outreach
                      </button>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outreach Modal */}
      {selectedItem && selectedItem.analysis && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Outreach Opportunity
                </h3>
                <p className="text-indigo-200 text-sm truncate max-w-md">
                  {selectedItem.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Author Info Section */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Author Contact
                </h4>

                {selectedItem.analysis.authorName && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-800">
                        {selectedItem.analysis.authorName}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          selectedItem.analysis!.authorName!,
                          "name",
                        )
                      }
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors"
                    >
                      {copiedField === "name" ? (
                        "✓ Copied"
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                )}

                {selectedItem.analysis.authorEmail && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-800">
                        {selectedItem.analysis.authorEmail}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          selectedItem.analysis!.authorEmail!,
                          "email",
                        )
                      }
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors"
                    >
                      {copiedField === "email" ? (
                        "✓ Copied"
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!selectedItem.analysis.authorName &&
                  !selectedItem.analysis.authorEmail && (
                    <p className="text-sm text-slate-500 italic">
                      No author contact information found in the article.
                    </p>
                  )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline text-sm truncate max-w-xs"
                    >
                      {selectedItem.url}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedItem.url, "url")}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors"
                  >
                    {copiedField === "url" ? (
                      "✓ Copied"
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Email Template Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Email Template
                  </h4>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        selectedItem.analysis!.outreachEmail || "",
                        "email-template",
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    {copiedField === "email-template" ? (
                      "✓ Copied!"
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Email
                      </>
                    )}
                  </button>
                </div>

                {selectedItem.analysis.outreachEmail ? (
                  <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                      {selectedItem.analysis.outreachEmail}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-slate-100 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-500 italic">
                      No email template was generated for this article.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Missed Opportunity • Rank #{selectedItem.rank}
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-sm font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDashboard;

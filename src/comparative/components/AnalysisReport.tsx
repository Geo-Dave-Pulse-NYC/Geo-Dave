import React, { useState } from "react";
import { GeoAnalysisResult } from "../types";

interface AnalysisReportProps {
  result: GeoAnalysisResult;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.recommendedFix.codeBlock);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Try to detect if it's JSON-LD and parse it for preview
  const isJsonLd = result.recommendedFix.codeBlock.includes('application/ld+json') || 
                   result.recommendedFix.codeBlock.includes('@context');
  
  let jsonData: any = null;
  if (isJsonLd) {
    try {
      // Extract JSON from script tag if present
      const jsonMatch = result.recommendedFix.codeBlock.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[1]);
      } else {
        jsonData = JSON.parse(result.recommendedFix.codeBlock);
      }
    } catch (e) {
      // Not valid JSON
    }
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Verdict Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="bg-white/20 p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            Analysis Verdict
          </h3>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            {result.verdict}
          </p>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-100">
            <h4 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Key Optimization Gaps
            </h4>
            <div className="space-y-3">
              {result.analysisPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm border border-purple-100">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 text-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The Fix Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="bg-white/20 p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </span>
            Recommended Fix
          </h3>
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
            Ready to Use
          </span>
        </div>

        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <p className="text-gray-700">{result.recommendedFix.description}</p>
          <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Copy and paste directly into your website's &lt;head&gt; section</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'code' 
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Source Code
            </span>
          </button>
          {jsonData && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'preview' 
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Visual Preview
              </span>
            </button>
          )}
        </div>

        {/* Code Tab */}
        {activeTab === 'code' && (
          <div className="relative">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={copyToClipboard}
                className={`${copied ? 'bg-green-500' : 'bg-green-600 hover:bg-green-500'} text-sm text-white py-2 px-4 rounded-lg shadow font-medium flex items-center gap-2 transition-all`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 p-6 pt-16 overflow-x-auto text-sm font-mono text-green-400 max-h-[500px]">
              <code>{result.recommendedFix.codeBlock}</code>
            </pre>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && jsonData && (
          <div className="p-6 bg-gray-50">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Schema Type Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-white font-semibold">
                  {jsonData['@type'] || 'Structured Data'} Schema
                </span>
              </div>
              
              {/* Schema Properties Table */}
              <div className="divide-y divide-gray-100">
                {Object.entries(jsonData).filter(([key]) => !key.startsWith('@')).map(([key, value]) => (
                  <div key={key} className="flex">
                    <div className="w-1/3 px-4 py-3 bg-gray-50 font-medium text-gray-700 text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="w-2/3 px-4 py-3 text-gray-600 text-sm">
                      {typeof value === 'object' ? (
                        <div className="space-y-1">
                          {Object.entries(value as object).filter(([k]) => !k.startsWith('@')).map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                              <span className="text-gray-400 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="font-medium">{String(v)}</span>
                            </div>
                          ))}
                          {(value as any)['@type'] && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {(value as any)['@type']}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span>{String(value)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">How Search Engines See This</p>
                  <p className="text-blue-700">
                    This structured data helps AI systems like Google's AI Overviews, ChatGPT, and Perplexity 
                    understand your content programmatically. They can extract exact values like prices, 
                    ratings, and product details without parsing unstructured text.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-3 flex justify-between items-center border-t border-gray-200">
          <span className="inline-flex items-center gap-2 text-xs text-gray-500">
            <span className="bg-gray-200 px-2 py-1 rounded font-mono">
              {result.recommendedFix.language || "HTML"}
            </span>
            {isJsonLd && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                JSON-LD
              </span>
            )}
          </span>
          <span className="text-xs text-gray-500">GEO Comparative Agent</span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;

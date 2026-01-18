import React, { useState } from "react";
import { ShieldCheck, Scale, FileText } from "lucide-react";
import AuditorApp from "./auditor/App";
import ComparativeApp from "./comparative/App";
import FactCheckerApp from "./fact-checker/App";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "auditor" | "comparative" | "fact-checker"
  >("auditor");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Main Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shrink-0 z-50 shadow-xl">
        <div className="p-6 border-b border-slate-700">
          <h1 className="font-bold text-xl tracking-tight">Geo Unified</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("auditor")}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${activeTab === "auditor" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
          >
            <ShieldCheck
              className={`w-5 h-5 mr-3 ${activeTab === "auditor" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
            />
            <div className="text-left">
              <div className="font-medium">Auditor</div>
              <div
                className={`text-xs ${activeTab === "auditor" ? "text-indigo-200" : "text-slate-500 group-hover:text-slate-400"}`}
              >
                Audit brand presence
              </div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("comparative")}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${activeTab === "comparative" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
          >
            <Scale
              className={`w-5 h-5 mr-3 ${activeTab === "comparative" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
            />
            <div className="text-left">
              <div className="font-medium">Comparative</div>
              <div
                className={`text-xs ${activeTab === "comparative" ? "text-indigo-200" : "text-slate-500 group-hover:text-slate-400"}`}
              >
                Compare products
              </div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("fact-checker")}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${activeTab === "fact-checker" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
          >
            <FileText
              className={`w-5 h-5 mr-3 ${activeTab === "fact-checker" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
            />
            <div className="text-left">
              <div className="font-medium">Fact Checker</div>
              <div
                className={`text-xs ${activeTab === "fact-checker" ? "text-indigo-200" : "text-slate-500 group-hover:text-slate-400"}`}
              >
                Verify claims
              </div>
            </div>
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative bg-slate-50">
        <div className="min-h-full h-full">
          {activeTab === "auditor" && <AuditorApp />}
          {activeTab === "comparative" && <ComparativeApp />}
          {activeTab === "fact-checker" && <FactCheckerApp />}
        </div>
      </div>
    </div>
  );
};

export default App;

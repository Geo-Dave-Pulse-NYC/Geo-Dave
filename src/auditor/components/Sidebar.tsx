import React from 'react';
import { Key, ShieldCheck, ExternalLink } from 'lucide-react';
import { ApiKeys } from '../types';

interface SidebarProps {
  keys: ApiKeys;
  setKeys: React.Dispatch<React.SetStateAction<ApiKeys>>;
}

const Sidebar: React.FC<SidebarProps> = ({ keys, setKeys }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full md:w-80 bg-slate-900 text-white flex-shrink-0 flex flex-col h-auto md:min-h-screen border-r border-slate-700">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-indigo-400 mb-2">
          <ShieldCheck className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight text-white">GEO Auditor</h1>
        </div>
        <p className="text-slate-400 text-sm">Visibility & Sentiment Agent</p>
      </div>

      <div className="p-6 flex-1">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Configuration</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
              <Key className="w-4 h-4 mr-2" />
              Tavily API Key
            </label>
            <input
              type="password"
              name="tavily"
              value={keys.tavily}
              onChange={handleChange}
              placeholder="tvly-..."
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder-slate-600"
            />
            <a href="https://tavily.com/" target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-flex items-center">
              Get key <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <h3 className="text-sm font-medium text-indigo-300 mb-2">How it works</h3>
          <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
            <li>We search the live web for your query using Tavily.</li>
            <li>We read the top 5 results deeply.</li>
            <li>Gemini AI analyzes every page to see if your brand is mentioned.</li>
            <li>We detect "Missed Opportunities" where competitors rank but you don't.</li>
          </ul>
        </div>
      </div>

      <div className="p-6 border-t border-slate-800 text-xs text-slate-600 text-center">
        Powered by Tavily & Google Gemini
      </div>
    </div>
  );
};

export default Sidebar;
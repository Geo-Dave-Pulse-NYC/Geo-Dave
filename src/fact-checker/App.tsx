import React, { useState, useCallback } from 'react';
import { AnalysisCard } from './components/AnalysisCard';
import { StatusStepper } from './components/StatusStepper';
import { AnalysisStatus, AnalysisItem } from './types';
import { generateBrandQuestions, getNaiveAnswer, getGroundTruth, verifyAnswer } from './services/geminiService';

const App: React.FC = () => {
  const [brandName, setBrandName] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [progressMessage, setProgressMessage] = useState('');

  const handleRunAnalysis = useCallback(async () => {
    if (!brandName.trim() || !officialUrl.trim()) return;

    setStatus(AnalysisStatus.GENERATING_QUESTIONS);
    setProgressMessage('Simulating user questions...');
    setItems([]);

    try {
      // 1. Generate Questions
      const questions = await generateBrandQuestions(brandName);
      
      const initialItems: AnalysisItem[] = questions.map((q, idx) => ({
        id: `q-${idx}`,
        question: q,
        naiveAnswer: null,
        groundTruthAnswer: null,
        groundTruthSources: [],
        verification: null,
        status: 'pending'
      }));
      setItems(initialItems);

      setStatus(AnalysisStatus.ANALYZING);

      // 2. Process each question sequentially to be kind to rate limits and provide clear progress
      for (let i = 0; i < initialItems.length; i++) {
        const item = initialItems[i];
        
        // Update item status to loading
        setItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'loading' } : it));
        setProgressMessage(`Analyzing question ${i + 1} of ${initialItems.length}: "${item.question.substring(0, 30)}..."`);

        // a. Get Naive Answer
        const naiveAnswer = await getNaiveAnswer(item.question, brandName);

        // b. Get Ground Truth
        const groundTruth = await getGroundTruth(item.question, officialUrl);

        // c. Verify
        const verification = await verifyAnswer(item.question, naiveAnswer, groundTruth.answer);

        // Update item with results
        setItems(prev => prev.map(it => it.id === item.id ? {
          ...it,
          naiveAnswer,
          groundTruthAnswer: groundTruth.answer,
          groundTruthSources: groundTruth.sources,
          verification,
          status: 'done'
        } : it));
      }

      setStatus(AnalysisStatus.COMPLETE);
      setProgressMessage('Analysis Complete!');

    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
      setProgressMessage('An error occurred during analysis.');
    }
  }, [brandName, officialUrl]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">GEO Fact-Checker</h1>
          </div>
          <p className="text-slate-500 max-w-2xl">
            Detect hallucinations by comparing AI-generated answers against the ground truth from your official documentation.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="brand" className="block text-sm font-semibold text-slate-700 mb-2">Brand Name</label>
              <input
                id="brand"
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Global Edge"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                disabled={status === AnalysisStatus.ANALYZING || status === AnalysisStatus.GENERATING_QUESTIONS}
              />
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-slate-700 mb-2">Official URL</label>
              <input
                id="url"
                type="text"
                value={officialUrl}
                onChange={(e) => setOfficialUrl(e.target.value)}
                placeholder="e.g. globaledge.msu.edu"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                disabled={status === AnalysisStatus.ANALYZING || status === AnalysisStatus.GENERATING_QUESTIONS}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleRunAnalysis}
              disabled={!brandName || !officialUrl || status === AnalysisStatus.ANALYZING || status === AnalysisStatus.GENERATING_QUESTIONS}
              className={`
                px-6 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all
                ${(!brandName || !officialUrl) 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : (status === AnalysisStatus.ANALYZING || status === AnalysisStatus.GENERATING_QUESTIONS)
                    ? 'bg-blue-400 cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow active:scale-95'}
              `}
            >
              {status === AnalysisStatus.IDLE || status === AnalysisStatus.COMPLETE || status === AnalysisStatus.ERROR ? 'Run Analysis' : 'Analyzing...'}
            </button>
          </div>
        </div>

        {/* Progress Stepper */}
        {status !== AnalysisStatus.IDLE && (
          <StatusStepper status={status} progressMessage={progressMessage} />
        )}

        {/* Results List */}
        <div className="space-y-6">
          {items.map((item) => (
            <AnalysisCard key={item.id} item={item} />
          ))}
        </div>

        {status === AnalysisStatus.COMPLETE && items.length === 0 && (
           <div className="text-center py-10 text-slate-500">
             No questions generated. Try a different brand name.
           </div>
        )}
      </main>
    </div>
  );
};

export default App;

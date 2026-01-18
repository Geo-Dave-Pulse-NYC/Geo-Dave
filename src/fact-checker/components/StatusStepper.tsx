import React from 'react';
import { AnalysisStatus } from '../types';

interface StatusStepperProps {
  status: AnalysisStatus;
  progressMessage: string;
}

export const StatusStepper: React.FC<StatusStepperProps> = ({ status, progressMessage }) => {
  const steps = [
    { id: AnalysisStatus.IDLE, label: 'Start' },
    { id: AnalysisStatus.GENERATING_QUESTIONS, label: 'Identify Topics' },
    { id: AnalysisStatus.ANALYZING, label: 'Verify Facts' },
    { id: AnalysisStatus.COMPLETE, label: 'Report Ready' },
  ];

  const getCurrentStepIndex = () => {
    switch (status) {
      case AnalysisStatus.IDLE: return 0;
      case AnalysisStatus.GENERATING_QUESTIONS: return 1;
      case AnalysisStatus.ANALYZING: return 2;
      case AnalysisStatus.COMPLETE: return 3;
      case AnalysisStatus.ERROR: return 1; // Fallback
      default: return 0;
    }
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      {/* Step Indicators */}
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded"></div>
        <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div key={step.id} className="flex flex-col items-center group">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-white
                ${isCompleted ? 'border-blue-600 text-blue-600' : 'border-slate-300 text-slate-300'}
                ${isActive ? 'ring-4 ring-blue-100' : ''}
                `}
              >
                {idx < currentIndex ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                  <span className="text-xs font-bold">{idx + 1}</span>
                )}
              </div>
              <span className={`text-xs mt-2 font-medium ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Current Activity Message */}
      <div className="mt-6 text-center h-6">
        {status !== AnalysisStatus.IDLE && status !== AnalysisStatus.COMPLETE && (
           <p className="text-sm text-blue-600 font-medium animate-pulse flex items-center justify-center gap-2">
             <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             {progressMessage}
           </p>
        )}
         {status === AnalysisStatus.COMPLETE && (
            <p className="text-sm text-green-600 font-medium">Analysis Complete</p>
         )}
      </div>
    </div>
  );
};

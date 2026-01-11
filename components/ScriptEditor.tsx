import React from 'react';

interface ScriptEditorProps {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  isProcessing: boolean;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ value, onChange, onNext, isProcessing }) => {
  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
      <div className="mb-6 space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">The Writer's Room</h2>
        <p className="text-slate-500">Paste your visual novel script below. Nova will analyze it to generate your game.</p>
      </div>
      
      <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs font-mono text-slate-400 ml-2">script.txt</span>
        </div>
        <textarea
          className="flex-1 w-full p-6 resize-none outline-none font-mono text-sm leading-relaxed text-slate-700 bg-transparent"
          placeholder="[Scene: A coffee shop...]&#10;[Liam] Hello?"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          disabled={isProcessing || !value.trim()}
          className={`
            px-8 py-3 rounded-full font-semibold text-white shadow-lg
            transition-all duration-200 flex items-center gap-2
            ${isProcessing || !value.trim() 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95'}
          `}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Script...
            </>
          ) : (
            <>
              Generate Assets
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

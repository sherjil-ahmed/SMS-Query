import React, { useState } from 'react';
import { useSms } from '../context/SmsContext';
import { Sparkles, Search, X, Loader2, Bot, ArrowRight, CornerDownLeft } from 'lucide-react';

interface NlpSearchBarProps {
  onOpenQueryTab: () => void;
}

const NLP_EXAMPLES = [
  'find messages from John about the meeting yesterday between 2 PM and 4 PM',
  'Chase Bank codes from today',
  'unread delivery updates between 9 AM and 6 PM',
  'starred finance alerts from last 7 days',
];

export const NlpSearchBar: React.FC<NlpSearchBarProps> = ({ onOpenQueryTab }) => {
  const {
    nlpQuery,
    nlpExplanation,
    nlpSource,
    isNlpParsing,
    executeNLPQuery,
    clearNLPQuery,
  } = useSms();

  const [inputVal, setInputVal] = useState(nlpQuery || '');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isNlpParsing) return;
    await executeNLPQuery(inputVal);
  };

  const handleApplyExample = async (example: string) => {
    setInputVal(example);
    await executeNLPQuery(example);
  };

  const handleClear = () => {
    setInputVal('');
    clearNLPQuery();
  };

  return (
    <div className="space-y-2">
      {/* NLP Main Input Field */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-3 flex items-center pointer-events-none text-blue-600 dark:text-blue-400">
            {isNlpParsing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask NLP: e.g. messages from John about meeting yesterday between 2 PM and 4 PM..."
            disabled={isNlpParsing}
            className="w-full pl-9 pr-20 py-2.5 bg-white dark:bg-slate-900 border border-blue-200/90 dark:border-blue-900/60 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs transition-shadow"
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            {inputVal && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="submit"
              disabled={isNlpParsing || !inputVal.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shadow-xs active:scale-95"
            >
              {isNlpParsing ? (
                <span>Parsing</span>
              ) : (
                <>
                  <span>NLP Search</span>
                  <CornerDownLeft className="w-3 h-3 hidden sm:inline" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* NLP Active Interpretation Banner */}
      {nlpExplanation && (
        <div className="p-2.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs flex items-start justify-between gap-2 animate-in fade-in">
          <div className="flex items-start gap-2">
            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-blue-900 dark:text-blue-200">
                  NLP Interpretation
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                  {nlpSource === 'gemini' ? '· Gemini 3.8 Flash' : '· Intelligent Parser'}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-snug">
                {nlpExplanation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            <button
              onClick={onOpenQueryTab}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-medium"
            >
              <span>Fine-tune</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Dismiss NLP interpretation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Suggested Natural Language Queries Carousel */}
      {!nlpExplanation && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 mr-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>Try:</span>
          </span>
          {NLP_EXAMPLES.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyExample(ex)}
              className="whitespace-nowrap shrink-0 px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200/80 dark:border-slate-800 rounded-lg text-[11px] font-medium transition-colors"
            >
              "{ex}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

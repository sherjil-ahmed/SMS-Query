import React from 'react';
import { useSms } from '../context/SmsContext';
import { MessageSquare, ShieldCheck, Zap, ChevronRight } from 'lucide-react';

interface DefaultSmsBannerProps {
  onRequestSetDefault: () => void;
  onOpenGatewayInfo: () => void;
}

export const DefaultSmsBanner: React.FC<DefaultSmsBannerProps> = ({
  onRequestSetDefault,
  onOpenGatewayInfo,
}) => {
  const { isDefaultSmsApp, isSseConnected } = useSms();

  if (isDefaultSmsApp) {
    return (
      <div
        onClick={onOpenGatewayInfo}
        className="px-3 py-1.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-900/60 rounded-xl text-xs flex items-center justify-between cursor-pointer group hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-2xs"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold text-emerald-900 dark:text-emerald-200 text-[11px]">
            Default SMS App Active
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
            · {isSseConnected ? 'Live Real-Time Stream' : 'Connecting'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium group-hover:underline">
          <span>Gateway Info</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-600/15 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-bold text-xs">
            Set as Default SMS App
          </div>
          <div className="text-[11px] text-blue-100">
            Intercept incoming real-time SMS broadcasts
          </div>
        </div>
      </div>

      <button
        onClick={onRequestSetDefault}
        className="px-3.5 py-1.5 bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl shrink-0 transition-colors shadow-xs active:scale-95"
      >
        Set Default
      </button>
    </div>
  );
};

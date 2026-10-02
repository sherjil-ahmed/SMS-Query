import React, { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryMedium } from 'lucide-react';

interface AndroidStatusBarProps {
  carrier?: string;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ carrier = '5G' }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full px-5 pt-2 pb-1 flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200 select-none no-print">
      {/* Left: Clock */}
      <div className="font-mono tabular-nums font-semibold tracking-tight text-[13px]">
        {currentTime || '12:00'}
      </div>

      {/* Center: Subtle Camera Punch-hole */}
      <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-700/40 shadow-inner flex items-center justify-center">
        <div className="w-1 h-1 bg-slate-900 rounded-full" />
      </div>

      {/* Right: Network & Battery Indicators */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{carrier}</span>
        <Signal className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
        <Wifi className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-400">96%</span>
          <BatteryMedium className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
    </div>
  );
};

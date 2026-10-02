import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSms } from '../context/SmsContext';
import { Sun, Moon, Send, CloudCheck, Smartphone, Monitor, ShieldCheck, Download } from 'lucide-react';

interface TopAppBarProps {
  onOpenReceiveModal: () => void;
  isDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
  onOpenGatewayDrawer: () => void;
  onOpenDownloadModal: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  onOpenReceiveModal,
  isDeviceFrame,
  onToggleDeviceFrame,
  onOpenGatewayDrawer,
  onOpenDownloadModal,
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { cloudSettings, isSyncing, isDefaultSmsApp, isSseConnected } = useSms();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 h-14 flex items-center justify-between no-print">
      {/* Zone 1: Single Text Element Wordmark & Default Badge */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
          SMS
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            SMS Intelligence
          </span>
          <button
            onClick={onOpenGatewayDrawer}
            className="flex items-center gap-1 text-[10px] text-left font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{isDefaultSmsApp ? 'Default App (Active)' : 'Not Default App'}</span>
          </button>
        </div>
      </div>

      {/* Zone 2 & 3: Cloud Indicator & Primary Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Real-time SSE / Default SMS Indicator */}
        <button
          onClick={onOpenGatewayDrawer}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-colors ${
            isSseConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
          }`}
          title="Real-Time Telephony Gateway Status"
        >
          <span className={`w-2 h-2 rounded-full ${isSseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="hidden sm:inline">
            {isSseConnected ? 'Live Gateway' : 'Connecting'}
          </span>
        </button>

        {/* Mobile Install & APK Download Button */}
        <button
          onClick={onOpenDownloadModal}
          className="min-h-[36px] px-2.5 sm:px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
          title="Install App on Mobile / Download APK"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install / APK</span>
        </button>

        {/* Quick Receive SMS Trigger */}
        <button
          onClick={onOpenReceiveModal}
          className="min-h-[36px] px-2.5 sm:px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          title="Test Receive Incoming SMS"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Receive SMS</span>
        </button>

        {/* Device View Mode Toggle */}
        <button
          onClick={onToggleDeviceFrame}
          className="min-h-[36px] min-w-[36px] p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors hidden md:flex items-center justify-center"
          title={isDeviceFrame ? 'Switch to Full Screen View' : 'Switch to Android Phone Shell'}
          aria-label="Toggle frame"
        >
          {isDeviceFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="min-h-[36px] min-w-[36px] p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

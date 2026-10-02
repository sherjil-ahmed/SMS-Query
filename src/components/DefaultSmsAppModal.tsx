import React, { useState } from 'react';
import { MessageSquare, ShieldCheck, Check, AlertCircle } from 'lucide-react';

interface DefaultSmsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDefault: () => void;
  isCurrentlyDefault: boolean;
}

export const DefaultSmsAppModal: React.FC<DefaultSmsAppModalProps> = ({
  isOpen,
  onClose,
  onConfirmDefault,
  isCurrentlyDefault,
}) => {
  const [selectedApp, setSelectedApp] = useState<'app' | 'system'>('app');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedApp === 'app') {
      onConfirmDefault();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100 space-y-4 animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Android System Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <MessageSquare className="w-6 h-6" />
        </div>

        {/* Title & Description matching native Android 14/15 change default dialog */}
        <div className="text-center space-y-1.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Set SMS Intelligence as default SMS app?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The default SMS app can view, receive, and send real-time SMS/MMS messages and access device telephony broadcasts.
          </p>
        </div>

        {/* App Choice Radio List */}
        <div className="space-y-2 pt-2">
          {/* SMS Intelligence (Our app) */}
          <div
            onClick={() => setSelectedApp('app')}
            className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-colors ${
              selectedApp === 'app'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 ring-1 ring-blue-600'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                SMS
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>SMS Intelligence</span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    (Recommended)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Real-time broadcast receiver &amp; NLP query engine
                </div>
              </div>
            </div>

            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedApp === 'app' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-400'
            }`}>
              {selectedApp === 'app' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>

          {/* System Messages */}
          <div
            onClick={() => setSelectedApp('system')}
            className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-colors ${
              selectedApp === 'system'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 ring-1 ring-blue-600'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                SYS
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Stock System Messages
                </div>
                <div className="text-[11px] text-slate-500">
                  Android default carrier handler
                </div>
              </div>
            </div>

            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedApp === 'system' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-400'
            }`}>
              {selectedApp === 'system' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>
        </div>

        {/* Security & System Broadcast Note */}
        <div className="flex items-center gap-2 p-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Telephony Role: android.provider.Telephony.SMS_DELIVER</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-blue-600/20 active:scale-95"
          >
            Set as default
          </button>
        </div>
      </div>
    </div>
  );
};

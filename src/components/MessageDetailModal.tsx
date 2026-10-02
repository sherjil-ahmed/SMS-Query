import React, { useState } from 'react';
import { SMSMessage } from '../types/sms';
import { X, Star, Trash2, Copy, Check, Calendar, Clock, Smartphone, Tag, ShieldCheck } from 'lucide-react';
import { formatDateTime } from '../utils/exportUtils';
import { isWithinTimeOfDayWindow } from '../utils/filterSms';

interface MessageDetailModalProps {
  message: SMSMessage | null;
  onClose: () => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
}

export const MessageDetailModal: React.FC<MessageDetailModalProps> = ({
  message,
  onClose,
  onToggleStar,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!message) return null;

  const { dateStr, timeStr, fullISO } = formatDateTime(message.timestamp);
  const isBusinessHours = isWithinTimeOfDayWindow(message.timestamp, '09:00', '18:00');

  const otpMatch = message.body.match(/\b\d{4,8}\b/);
  const otpCode = otpMatch ? otpMatch[0] : null;

  const handleCopyBody = () => {
    navigator.clipboard.writeText(message.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (otpCode) {
      navigator.clipboard.writeText(otpCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Grab Handle for Touch Bottom Sheet */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 shrink-0 sm:hidden" />

        {/* Top Header */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-base">
              {message.sender.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                {message.sender}
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {message.senderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleStar(message.id)}
              className={`p-2 rounded-xl transition-colors ${
                message.starred
                  ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={message.starred ? 'Starred' : 'Star message'}
            >
              <Star className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={() => {
                onDelete(message.id);
                onClose();
              }}
              className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              title="Delete message"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-200">
          {/* OTP / Code Detection Highlight */}
          {otpCode && (
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="text-[11px] font-semibold uppercase text-blue-600 dark:text-blue-400">
                    Detected Security / Verification Code
                  </div>
                  <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tracking-widest">
                    {otpCode}
                  </div>
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}

          {/* Full Message Body */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 relative group">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Message Content
            </div>
            <p className="text-sm font-normal text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
              {message.body}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
              <span>{message.body.length} characters</span>
              <button
                onClick={handleCopyBody}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy text'}</span>
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <div className="text-slate-400 dark:text-slate-500 font-medium">Received Date</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{dateStr}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <div className="text-slate-400 dark:text-slate-500 font-medium">Timestamp (Time)</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 font-mono tabular-nums">
                  {timeStr}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <div className="text-slate-400 dark:text-slate-500 font-medium">Device SIM Card</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">SIM Slot {message.simSlot}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
              <Tag className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <div className="text-slate-400 dark:text-slate-500 font-medium">Category</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                  {message.category}
                </div>
              </div>
            </div>
          </div>

          {/* Time Window Query Compliance Indicator */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">9am - 6pm Business Hours Window:</span>
              <span
                className={`font-semibold ${
                  isBusinessHours
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {isBusinessHours ? 'Inside Window (9am-6pm)' : 'Outside Window'}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
              ISO: {fullISO}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

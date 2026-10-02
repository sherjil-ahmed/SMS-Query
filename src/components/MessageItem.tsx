import React from 'react';
import { SMSMessage } from '../types/sms';
import { Star, ShieldAlert, Check, Copy } from 'lucide-react';
import { formatDateTime } from '../utils/exportUtils';

interface MessageItemProps {
  message: SMSMessage;
  searchHighlight?: string;
  onSelect: (message: SMSMessage) => void;
  onToggleStar: (id: string) => void;
  onToggleRead: (id: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  searchHighlight = '',
  onSelect,
  onToggleStar,
  onToggleRead,
}) => {
  const { dateStr, timeStr } = formatDateTime(message.timestamp);

  // Check if timestamp is today
  const isToday = new Date(message.timestamp).toDateString() === new Date().toDateString();

  // Extract OTP if present
  const otpMatch = message.body.match(/\b\d{4,8}\b/);
  const otpCode = otpMatch ? otpMatch[0] : null;

  // Highlight keywords safely in text
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight || !highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark
          key={i}
          className="bg-amber-200 dark:bg-amber-900/60 text-slate-900 dark:text-amber-100 px-0.5 rounded-xs"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Sender initial badge color
  const getSenderColor = (category: string) => {
    switch (category) {
      case 'finance':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'verification':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
      case 'delivery':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      case 'work':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div
      onClick={() => onSelect(message)}
      className={`group relative p-3.5 sm:p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
        message.read
          ? 'bg-white dark:bg-slate-900/60 border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
          : 'bg-blue-50/40 dark:bg-slate-800/90 border-blue-200/70 dark:border-blue-900/50 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Sender Monogram */}
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${getSenderColor(
            message.category
          )}`}
        >
          {message.sender.slice(0, 2).toUpperCase()}
        </div>

        {/* Core Message Area */}
        <div className="flex-1 min-w-0">
          {/* Top Row: Sender + Timestamp */}
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 truncate">
              <span
                className={`text-sm truncate ${
                  message.read
                    ? 'font-medium text-slate-800 dark:text-slate-200'
                    : 'font-bold text-slate-900 dark:text-white'
                }`}
              >
                {renderHighlightedText(message.sender, searchHighlight)}
              </span>

              {!message.read && (
                <span
                  className="w-2 h-2 rounded-full bg-blue-600 shrink-0"
                  aria-label="Unread message"
                />
              )}
            </div>

            {/* Time / Date using Tabular Numbers */}
            <div className="flex items-center gap-1 shrink-0 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              <span>{isToday ? timeStr : dateStr}</span>
            </div>
          </div>

          {/* Clean Unboxed Metadata Line (per zero-pill discipline) */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="font-mono text-slate-400 dark:text-slate-500">{message.senderNumber}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{message.category}</span>
            <span aria-hidden="true">·</span>
            <span>SIM {message.simSlot}</span>
            {isToday && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{timeStr}</span>
              </>
            )}
          </div>

          {/* Body Content */}
          <p
            className={`text-xs line-clamp-2 leading-relaxed ${
              message.read
                ? 'text-slate-600 dark:text-slate-300'
                : 'text-slate-800 dark:text-slate-100 font-medium'
            }`}
          >
            {renderHighlightedText(message.body, searchHighlight)}
          </p>

          {/* Inline OTP Code Quick Copy if detected */}
          {otpCode && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-lg text-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-[11px] text-slate-600 dark:text-slate-400">Code:</span>
              <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                {otpCode}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(otpCode);
                  onToggleRead(message.id);
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 ml-1 p-0.5"
                title="Copy code"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Action Controls (Touch friendly >= 44px hitbox) */}
        <div
          className="flex flex-col items-center gap-1 shrink-0 ml-1"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Star Button */}
          <button
            type="button"
            onClick={() => onToggleStar(message.id)}
            className={`min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl transition-colors ${
              message.starred
                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label={message.starred ? 'Unstar message' : 'Star message'}
          >
            <Star className={`w-4 h-4 ${message.starred ? 'fill-current' : ''}`} />
          </button>

          {/* Read / Unread toggle */}
          <button
            type="button"
            onClick={() => onToggleRead(message.id)}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={message.read ? 'Mark unread' : 'Mark read'}
            aria-label="Toggle read status"
          >
            <Check className={`w-3.5 h-3.5 ${message.read ? 'opacity-40' : 'text-blue-600 font-bold opacity-100'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

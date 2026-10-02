import React from 'react';
import { SMSMessage } from '../types/sms';
import { MessageSquare, X, Check, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IncomingSmsBannerProps {
  message: SMSMessage | null;
  onDismiss: () => void;
  onInspect: (msg: SMSMessage) => void;
  onMarkRead: (id: string) => void;
}

export const IncomingSmsBanner: React.FC<IncomingSmsBannerProps> = ({
  message,
  onDismiss,
  onInspect,
  onMarkRead,
}) => {
  if (!message) return null;

  // Extract possible OTP/verification code (4-8 digits)
  const otpMatch = message.body.match(/\b\d{4,8}\b/);
  const otpCode = otpMatch ? otpMatch[0] : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -60, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed top-3 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-2xl p-3.5 text-slate-900 dark:text-slate-100 flex flex-col gap-2.5">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Messages · SIM {message.simSlot}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">now</span>
            </div>

            <button
              onClick={onDismiss}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sender & Body Preview */}
          <div
            onClick={() => {
              onInspect(message);
              onDismiss();
            }}
            className="cursor-pointer group"
          >
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>{message.sender}</span>
              <span className="text-xs font-mono font-normal text-slate-500 dark:text-slate-400">
                {message.senderNumber}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {message.body}
            </p>
          </div>

          {/* Interactive Fast Actions */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            {otpCode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(otpCode);
                  onMarkRead(message.id);
                  onDismiss();
                }}
                className="flex-1 py-1.5 px-3 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-blue-200 dark:border-blue-800/60"
              >
                <span>Copy Code</span>
                <span className="font-mono font-bold">{otpCode}</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(message.id);
                onDismiss();
              }}
              className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl flex items-center gap-1 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Read</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onInspect(message);
                onDismiss();
              }}
              className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl flex items-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

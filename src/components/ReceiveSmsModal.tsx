import React, { useState } from 'react';
import { MessageCategory } from '../types/sms';
import { X, Send, Sparkles, Clock, CheckCircle } from 'lucide-react';

interface ReceiveSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceive: (data: {
    sender: string;
    senderNumber: string;
    body: string;
    category: MessageCategory;
    simSlot: 1 | 2;
    customTimestamp?: number;
  }) => void;
}

const TEMPLATES: Array<{
  label: string;
  sender: string;
  senderNumber: string;
  body: string;
  category: MessageCategory;
  defaultHour?: number;
}> = [
  {
    label: 'Chase 2FA Code (10:30 AM)',
    sender: 'Chase Bank',
    senderNumber: '+1-800-432-3117',
    body: '719284 is your Chase temporary security code. Do not share this code. We will never call to ask for it.',
    category: 'verification',
    defaultHour: 10,
  },
  {
    label: 'Delivery ETA (2:15 PM)',
    sender: 'DoorDash',
    senderNumber: '36673',
    body: 'Your order from Chipotle Mexican Grill is on the way! Driver Sarah is 8 minutes away.',
    category: 'delivery',
    defaultHour: 14,
  },
  {
    label: 'Flight Gate Alert (9:15 AM)',
    sender: 'United Airlines',
    senderNumber: '+1-800-864-8331',
    body: 'Flight UA 412: Departure gate changed to C18. Boarding at 9:45 AM. Terminal 3.',
    category: 'service',
    defaultHour: 9,
  },
  {
    label: 'Evening Dinner (7:45 PM - Outside 9-6)',
    sender: 'Alex',
    senderNumber: '+1-415-555-0199',
    body: 'Table is reserved at 8:00 PM tonight at Osteria Bella. See you there soon!',
    category: 'personal',
    defaultHour: 19,
  },
  {
    label: 'Late Night Alert (11:20 PM - Outside 9-6)',
    sender: 'Capital One',
    senderNumber: '22741',
    body: 'Alert: $18.99 charge at STEAM GAMES on your card ending in 5541.',
    category: 'finance',
    defaultHour: 23,
  },
];

export const ReceiveSmsModal: React.FC<ReceiveSmsModalProps> = ({
  isOpen,
  onClose,
  onReceive,
}) => {
  const [sender, setSender] = useState('Chase Bank');
  const [senderNumber, setSenderNumber] = useState('+1-800-432-3117');
  const [body, setBody] = useState(
    'Your verification code is 591032 for transaction of $74.20. Valid for 10 minutes.'
  );
  const [category, setCategory] = useState<MessageCategory>('verification');
  const [simSlot, setSimSlot] = useState<1 | 2>(1);

  // Time customization
  const [timeMode, setTimeMode] = useState<'now' | 'custom'>('now');
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [customTime, setCustomTime] = useState('11:30'); // 11:30 AM (inside 9-6)
  const [submittedToast, setSubmittedToast] = useState(false);

  if (!isOpen) return null;

  const handleApplyTemplate = (t: (typeof TEMPLATES)[0]) => {
    setSender(t.sender);
    setSenderNumber(t.senderNumber);
    setBody(t.body);
    setCategory(t.category);
    if (t.defaultHour !== undefined) {
      setTimeMode('custom');
      setCustomTime(`${t.defaultHour.toString().padStart(2, '0')}:15`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender.trim() || !body.trim()) return;

    let computedTimestamp = Date.now();
    if (timeMode === 'custom' && customDate && customTime) {
      const [year, month, day] = customDate.split('-').map(Number);
      const [hour, minute] = customTime.split(':').map(Number);
      computedTimestamp = new Date(year, month - 1, day, hour, minute, 0).getTime();
    }

    onReceive({
      sender: sender.trim(),
      senderNumber: senderNumber.trim() || 'UNKNOWN',
      body: body.trim(),
      category,
      simSlot,
      customTimestamp: computedTimestamp,
    });

    setSubmittedToast(true);
    setTimeout(() => {
      setSubmittedToast(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200"
        role="dialog"
      >
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 shrink-0 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Simulate Receive SMS
              </h3>
              <p className="text-xs text-slate-500">
                Trigger Android Inbound Broadcast Receiver
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick preset templates */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>One-Tap Realistic Presets</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(t)}
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-900"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sender & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sender Name / Entity
                </label>
                <input
                  type="text"
                  required
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="e.g. Chase Bank, Amazon, Mom"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Originating Number / Shortcode
                </label>
                <input
                  type="text"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="e.g. +1-800-432-3117 or 22000"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category & SIM */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MessageCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="verification">Verification (2FA/OTP)</option>
                  <option value="finance">Finance / Banking</option>
                  <option value="delivery">Delivery &amp; Courier</option>
                  <option value="service">Service &amp; Booking</option>
                  <option value="personal">Personal / Friends</option>
                  <option value="work">Work &amp; Professional</option>
                  <option value="promotional">Promotional / Offers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  SIM Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimSlot(1)}
                    className={`py-2 text-xs font-medium rounded-xl border transition-colors ${
                      simSlot === 1
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    SIM 1 (Primary)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimSlot(2)}
                    className={`py-2 text-xs font-medium rounded-xl border transition-colors ${
                      simSlot === 2
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    SIM 2
                  </button>
                </div>
              </div>
            </div>

            {/* Received Timestamp Simulation (Key for time-of-day testing) */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  Received Timestamp Simulation
                </span>

                <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-700/60 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setTimeMode('now')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      timeMode === 'now'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Just Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeMode('custom')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      timeMode === 'custom'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Custom Time
                  </button>
                </div>
              </div>

              {timeMode === 'custom' && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Date</label>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Time of Day (24h)</label>
                    <input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Message Body
              </label>
              <textarea
                required
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type SMS text..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/20 active:scale-95"
              >
                {submittedToast ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span>{submittedToast ? 'Delivered!' : 'Deliver Inbound SMS'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

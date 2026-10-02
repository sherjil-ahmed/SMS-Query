import React, { useState } from 'react';
import { useSms } from '../context/SmsContext';
import { TimeRangePreset } from '../types/sms';
import { NlpSearchBar } from './NlpSearchBar';
import {
  Filter,
  Search,
  Calendar,
  Clock,
  User,
  Tag,
  Star,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { countActiveFilters } from '../utils/filterSms';

interface QueryBuilderTabProps {
  onViewResults: () => void;
}

export const QueryBuilderTab: React.FC<QueryBuilderTabProps> = ({ onViewResults }) => {
  const {
    messages,
    activeFilter,
    updateFilter,
    resetFilter,
    filteredMessages,
    nlpExplanation,
  } = useSms();

  const activeCount = countActiveFilters(activeFilter);

  // Extract unique senders for quick suggestions
  const topSenders = React.useMemo(() => {
    const map = new Map<string, number>();
    messages.forEach((m) => {
      map.set(m.sender, (map.get(m.sender) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 px-4 py-4 pb-28 text-slate-900 dark:text-slate-100">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Header Title & Active Count */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Multi-Attribute Query Engine</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Combine sender, keywords, dates, and custom daily time windows
            </p>
          </div>

          {activeCount > 0 && (
            <button
              onClick={resetFilter}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Dynamic Match Count Summary Card */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Live Query Result
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
                {filteredMessages.length}
              </span>
              <span className="text-xs text-slate-500">
                of {messages.length} messages match {activeCount} active criteria
              </span>
            </div>
          </div>

          <button
            onClick={onViewResults}
            className="min-h-[44px] px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 active:scale-95"
          >
            <span>View List</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* NLP Natural Language Parsing Section */}
        <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Natural Language Query (NLP)</span>
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
              Powered by Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Type any sentence in natural language; our NLP model translates it into exact sender, keyword, date, and time parameters below.
          </p>
          <NlpSearchBar onOpenQueryTab={() => {}} />
        </div>

        {/* Section 1: Keywords & Full-Text Search */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-4 h-4 text-slate-400" />
            <span>1. Keywords / Message Content</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={activeFilter.keyword}
              onChange={(e) => updateFilter({ keyword: e.target.value })}
              placeholder="e.g. 'code', 'order', 'dinner', 'flight', 'urgent'"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 self-center">Popular:</span>
            {['code', 'order', 'payment', 'dinner', 'flight', 'confirm'].map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => updateFilter({ keyword: kw })}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  activeFilter.keyword === kw
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Sender Name / Phone Number */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" />
            <span>2. Sender Name or Phone Number</span>
          </label>
          <input
            type="text"
            value={activeFilter.sender}
            onChange={(e) => updateFilter({ sender: e.target.value })}
            placeholder="e.g. 'Chase Bank', 'Mom', 'Google', '1-800'"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 self-center">Frequent:</span>
            {topSenders.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateFilter({ sender: activeFilter.sender === s ? '' : s })}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  activeFilter.sender === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Time Range Presets & Date Filters */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>3. Date &amp; Time Range</span>
          </label>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last7days', label: 'Last 7 Days' },
              { id: 'last30days', label: 'Last 30 Days' },
              { id: 'thisMonth', label: 'This Month' },
              { id: 'last3Months', label: 'Last 3 Months' },
              { id: 'custom', label: 'Custom Range' },
            ].map((p) => {
              const isSelected = activeFilter.timeRangePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    updateFilter({ timeRangePreset: p.id as TimeRangePreset })
                  }
                  className={`py-2 px-2.5 text-xs font-medium rounded-xl border transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Custom Date Pickers */}
          {activeFilter.timeRangePreset === 'custom' && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={activeFilter.customStartDate}
                  onChange={(e) => updateFilter({ customStartDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={activeFilter.customEndDate}
                  onChange={(e) => updateFilter({ customEndDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Custom Specified Duration (Time of Day Window - 9am to 6pm) */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>4. Custom Time-of-Day Window</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Filter SMS received between specific daily hours (e.g. 9am to 6pm)
              </p>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={activeFilter.enableTimeOfDayWindow}
                onChange={(e) =>
                  updateFilter({ enableTimeOfDayWindow: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {activeFilter.enableTimeOfDayWindow && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '9:00 AM – 6:00 PM (Business)', start: '09:00', end: '18:00' },
                  { label: '8:00 AM – 12:00 PM (Morning)', start: '08:00', end: '12:00' },
                  { label: '12:00 PM – 5:00 PM (Afternoon)', start: '12:00', end: '17:00' },
                  { label: '6:00 PM – 11:00 PM (Evening)', start: '18:00', end: '23:00' },
                ].map((preset, idx) => {
                  const isCurrent =
                    activeFilter.timeOfDayStart === preset.start &&
                    activeFilter.timeOfDayEnd === preset.end;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        updateFilter({
                          timeOfDayStart: preset.start,
                          timeOfDayEnd: preset.end,
                        })
                      }
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Exact Time Pickers */}
              <div className="grid grid-cols-2 gap-3 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={activeFilter.timeOfDayStart}
                    onChange={(e) => updateFilter({ timeOfDayStart: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={activeFilter.timeOfDayEnd}
                    onChange={(e) => updateFilter({ timeOfDayEnd: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Category & Status Attributes */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-slate-400" />
            <span>5. Category &amp; Status Attributes</span>
          </label>

          {/* Category Dropdown */}
          <div>
            <span className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'finance', label: 'Finance' },
                { id: 'verification', label: '2FA / Codes' },
                { id: 'delivery', label: 'Delivery' },
                { id: 'service', label: 'Services' },
                { id: 'work', label: 'Work' },
                { id: 'personal', label: 'Personal' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => updateFilter({ category: c.id })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                    activeFilter.category === c.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Read / Unread / Starred Status */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Read Status
              </span>
              <select
                value={activeFilter.readStatus}
                onChange={(e) =>
                  updateFilter({
                    readStatus: e.target.value as 'all' | 'unread' | 'read',
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Statuses</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Starred
              </span>
              <button
                type="button"
                onClick={() => updateFilter({ starredOnly: !activeFilter.starredOnly })}
                className={`w-full min-h-[38px] px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-colors ${
                  activeFilter.starredOnly
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${activeFilter.starredOnly ? 'fill-current' : ''}`} />
                <span>{activeFilter.starredOnly ? 'Starred Only' : 'Any'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 6: Sort Order */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Sort Order
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
            {(
              [
                { id: 'newest', label: 'Newest' },
                { id: 'oldest', label: 'Oldest' },
                { id: 'sender', label: 'Sender A-Z' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => updateFilter({ sortBy: s.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter.sortBy === s.id
                    ? 'bg-white dark:bg-slate-750 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Bottom Action Bar */}
        <div className="pt-2">
          <button
            onClick={onViewResults}
            className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-[0.99] transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Query &amp; Show {filteredMessages.length} Messages</span>
          </button>
        </div>
      </div>
    </div>
  );
};

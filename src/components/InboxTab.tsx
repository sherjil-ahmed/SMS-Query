import React, { useState } from 'react';
import { useSms } from '../context/SmsContext';
import { MessageItem } from './MessageItem';
import { NlpSearchBar } from './NlpSearchBar';
import { DefaultSmsBanner } from './DefaultSmsBanner';
import { SMSMessage } from '../types/sms';
import { Search, Filter, X, PlusCircle, CheckCheck, RefreshCw, Sparkles } from 'lucide-react';
import { countActiveFilters } from '../utils/filterSms';

interface InboxTabProps {
  onOpenQueryTab: () => void;
  onOpenReceiveModal: () => void;
  onSelectMessage: (msg: SMSMessage) => void;
  onRequestSetDefault: () => void;
  onOpenGatewayInfo: () => void;
}

export const InboxTab: React.FC<InboxTabProps> = ({
  onOpenQueryTab,
  onOpenReceiveModal,
  onSelectMessage,
  onRequestSetDefault,
  onOpenGatewayInfo,
}) => {
  const {
    messages,
    filteredMessages,
    activeFilter,
    updateFilter,
    resetFilter,
    toggleStar,
    toggleRead,
    markAllAsRead,
    resetToSampleData,
  } = useSms();

  const [searchMode, setSearchMode] = useState<'nlp' | 'standard'>('nlp');
  const activeFilterCount = countActiveFilters(activeFilter);

  // Group messages into logical chronological sections
  const groupMessages = (list: SMSMessage[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const groups: { title: string; items: SMSMessage[] }[] = [
      { title: 'Today', items: [] },
      { title: 'Yesterday', items: [] },
      { title: 'Past 7 Days', items: [] },
      { title: 'Older Messages', items: [] },
    ];

    list.forEach((msg) => {
      const msgDate = new Date(msg.timestamp);
      msgDate.setHours(0, 0, 0, 0);

      if (msgDate.getTime() === today.getTime()) {
        groups[0].items.push(msg);
      } else if (msgDate.getTime() === yesterday.getTime()) {
        groups[1].items.push(msg);
      } else if (msgDate.getTime() >= sevenDaysAgo.getTime()) {
        groups[2].items.push(msg);
      } else {
        groups[3].items.push(msg);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  };

  const grouped = groupMessages(filteredMessages);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-100 dark:bg-slate-950 pb-20">
      {/* Top Search & Filter Bar */}
      <div className="sticky top-0 z-20 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-md px-4 pt-2 pb-3 border-b border-slate-200/80 dark:border-slate-800/80 space-y-2">
        {/* Search Mode Segmented Control */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-850 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setSearchMode('nlp')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                searchMode === 'nlp'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>NLP Search</span>
            </button>
            <button
              onClick={() => setSearchMode('standard')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                searchMode === 'standard'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Keyword Search</span>
            </button>
          </div>

          {/* Quick Query Filter Trigger Button */}
          <button
            onClick={onOpenQueryTab}
            className={`min-h-[32px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border shadow-xs ${
              activeFilterCount > 0
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            aria-label="Open filter settings"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] font-bold flex items-center justify-center font-mono">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Input Bar: NLP Search Bar or Standard Keyword Box */}
        {searchMode === 'nlp' ? (
          <NlpSearchBar onOpenQueryTab={onOpenQueryTab} />
        ) : (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={activeFilter.keyword}
              onChange={(e) => updateFilter({ keyword: e.target.value })}
              placeholder="Search sender, numbers, keywords..."
              className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            {activeFilter.keyword && (
              <button
                onClick={() => updateFilter({ keyword: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Quick Category Segmented Buttons */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'starred', label: 'Starred' },
            { id: 'finance', label: 'Finance' },
            { id: 'verification', label: '2FA / Codes' },
            { id: 'delivery', label: 'Delivery' },
            { id: 'work', label: 'Work' },
          ].map((cat) => {
            const isSelected =
              cat.id === 'unread'
                ? activeFilter.readStatus === 'unread'
                : cat.id === 'starred'
                ? activeFilter.starredOnly
                : cat.id === 'all'
                ? activeFilter.category === 'all' &&
                  activeFilter.readStatus === 'all' &&
                  !activeFilter.starredOnly
                : activeFilter.category === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'unread') {
                    updateFilter({
                      readStatus: activeFilter.readStatus === 'unread' ? 'all' : 'unread',
                    });
                  } else if (cat.id === 'starred') {
                    updateFilter({ starredOnly: !activeFilter.starredOnly });
                  } else if (cat.id === 'all') {
                    updateFilter({
                      category: 'all',
                      readStatus: 'all',
                      starredOnly: false,
                    });
                  } else {
                    updateFilter({
                      category: activeFilter.category === cat.id ? 'all' : cat.id,
                    });
                  }
                }}
                className={`whitespace-nowrap shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Active Multi-Attribute Filter Notification Pill & Result Count */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
              {filteredMessages.length}
            </span>
            <span>of {messages.length} messages</span>

            {activeFilter.enableTimeOfDayWindow && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {activeFilter.timeOfDayStart}–{activeFilter.timeOfDayEnd}
                </span>
              </>
            )}

            {activeFilter.timeRangePreset !== 'all' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{activeFilter.timeRangePreset}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilter}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={markAllAsRead}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Scrollable List of Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Default SMS App Status / Set Default Callout */}
        <DefaultSmsBanner
          onRequestSetDefault={onRequestSetDefault}
          onOpenGatewayInfo={onOpenGatewayInfo}
        />

        {filteredMessages.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              No messages match this query
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4 leading-relaxed">
              Try adjusting your keywords, sender filters, or widening the time window (e.g. 9am to 6pm).
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={resetFilter}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold shadow-xs"
              >
                Clear All Filters
              </button>
              <button
                onClick={resetToSampleData}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Sample SMS</span>
              </button>
            </div>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.title} className="space-y-2.5">
              {/* Group Header */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {group.title}
                </span>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  {group.items.length}
                </span>
              </div>

              {/* Messages in Group */}
              <div className="space-y-2">
                {group.items.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    searchHighlight={activeFilter.keyword}
                    onSelect={onSelectMessage}
                    onToggleStar={toggleStar}
                    onToggleRead={toggleRead}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button: Quick Receive SMS Simulator */}
      <button
        onClick={onOpenReceiveModal}
        className="fixed bottom-20 right-5 sm:right-8 z-30 min-h-[48px] px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center gap-2 text-xs font-bold transition-all active:scale-95 no-print"
        title="Simulate receiving an SMS message"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Receive SMS</span>
      </button>
    </div>
  );
};

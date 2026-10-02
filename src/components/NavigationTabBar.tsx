import React from 'react';
import { MessageSquare, Filter, Download, Cloud } from 'lucide-react';
import { useSms } from '../context/SmsContext';
import { countActiveFilters } from '../utils/filterSms';

export type NavTabId = 'inbox' | 'query' | 'export' | 'sync';

interface NavigationTabBarProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
}

export const NavigationTabBar: React.FC<NavigationTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { messages, activeFilter, cloudSettings } = useSms();

  const unreadCount = messages.filter((m) => !m.read).length;
  const activeFilterCount = countActiveFilters(activeFilter);

  const tabs: Array<{
    id: NavTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string | null;
    dot?: boolean;
  }> = [
    {
      id: 'inbox',
      label: 'Inbox',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      id: 'query',
      label: 'Query',
      icon: Filter,
      badge: activeFilterCount > 0 ? activeFilterCount : null,
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
    },
    {
      id: 'sync',
      label: 'Cloud Sync',
      icon: Cloud,
      dot: cloudSettings.autoSyncEnabled,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 shadow-lg no-print">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center relative transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Number Badge */}
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono tabular-nums shadow-xs">
                    {tab.badge}
                  </span>
                )}

                {/* Status Dot */}
                {tab.dot && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>

              <span
                className={`text-[11px] font-medium tracking-tight mt-1 ${
                  isActive
                    ? 'font-bold text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

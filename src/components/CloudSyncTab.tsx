import React, { useState } from 'react';
import { useSms } from '../context/SmsContext';
import {
  Cloud,
  CloudCheck,
  RefreshCw,
  HardDrive,
  Radio,
  Clock,
  CheckCircle,
  Database,
  Trash2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { formatDateTime } from '../utils/exportUtils';

export const CloudSyncTab: React.FC = () => {
  const {
    messages,
    cloudSettings,
    updateCloudSettings,
    backupLogs,
    isSyncing,
    triggerCloudBackup,
    autoSimulateStream,
    setAutoSimulateStream,
    resetToSampleData,
    clearAllMessages,
  } = useSms();

  const [confirmClear, setConfirmClear] = useState(false);

  const lastSyncStr = cloudSettings.lastSyncedTimestamp
    ? formatDateTime(cloudSettings.lastSyncedTimestamp).timeStr +
      ' on ' +
      formatDateTime(cloudSettings.lastSyncedTimestamp).dateStr
    : 'Never';

  const totalBytes = JSON.stringify(messages).length;
  const sizeKb = (totalBytes / 1024).toFixed(1);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 px-4 py-4 pb-28 text-slate-900 dark:text-slate-100">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Real-Time Cloud Backup &amp; Sync</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronize SMS records automatically with Android Cloud / Google Drive
          </p>
        </div>

        {/* Real-Time Sync Status Card */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  cloudSettings.autoSyncEnabled
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {cloudSettings.autoSyncEnabled ? (
                  <CloudCheck className="w-5 h-5" />
                ) : (
                  <Cloud className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  Real-Time Cloud Backup
                </div>
                <div className="text-xs text-slate-500">
                  {cloudSettings.autoSyncEnabled
                    ? 'Continuous background sync enabled'
                    : 'Sync paused'}
                </div>
              </div>
            </div>

            {/* Main Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cloudSettings.autoSyncEnabled}
                onChange={(e) =>
                  updateCloudSettings({ autoSyncEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Sync Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <div className="text-[11px] text-slate-400">Total Backed Up</div>
              <div className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                {messages.length} SMS
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <div className="text-[11px] text-slate-400">Backup Storage</div>
              <div className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                {sizeKb} KB
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <div className="text-[11px] text-slate-400">Provider</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                {cloudSettings.provider}
              </div>
            </div>
          </div>

          {/* Last sync info & Manual Sync Button */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="text-slate-500">
              <span>Last synced: </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                {lastSyncStr}
              </span>
            </div>

            <button
              onClick={triggerCloudBackup}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* Sync Frequency & Destination Settings */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Cloud Configuration
          </div>

          {/* Cloud Provider */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Cloud Backup Target
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Google Drive', 'Android Cloud'] as const).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => updateCloudSettings({ provider: prov })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-colors ${
                    cloudSettings.provider === prov
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          {/* Sync Frequency */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Sync Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'instant', label: 'Instant', desc: 'On each SMS' },
                { id: 'hourly', label: 'Hourly', desc: 'Every 60m' },
                { id: 'daily', label: 'Daily', desc: 'At midnight' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() =>
                    updateCloudSettings({
                      syncFrequency: f.id as 'instant' | 'hourly' | 'daily',
                    })
                  }
                  className={`p-2 rounded-xl border text-center transition-colors ${
                    cloudSettings.syncFrequency === f.id
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{f.label}</div>
                  <div className="text-[10px] text-slate-400">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time SMS Inbound Stream Simulation */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio
                className={`w-4 h-4 ${
                  autoSimulateStream ? 'text-emerald-500 animate-pulse' : 'text-slate-400'
                }`}
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Live Incoming SMS Simulator Stream
                </div>
                <div className="text-[11px] text-slate-500">
                  Simulate receiving incoming SMS every 28 seconds
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSimulateStream}
                onChange={(e) => setAutoSimulateStream(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        </div>

        {/* Backup Revision History Logs */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Cloud Snapshot Log</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {backupLogs.length} Snapshots
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {backupLogs.map((log) => {
              const { dateStr, timeStr } = formatDateTime(log.timestamp);
              return (
                <div
                  key={log.id}
                  className="py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {log.provider} Backup
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {dateStr} · {timeStr}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                      {log.messageCount} items
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {(log.sizeBytes / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Database Management / Reset Controls */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-slate-400" />
            <span>Database Storage Management</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={resetToSampleData}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample SMS (25 Items)</span>
            </button>

            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Database</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    clearAllMessages();
                    setConfirmClear(false);
                  }}
                  className="py-2.5 px-3 bg-rose-600 text-white rounded-xl text-xs font-semibold"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="py-2.5 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

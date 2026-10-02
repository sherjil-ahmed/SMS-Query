import React, { useState } from 'react';
import { useSms } from '../context/SmsContext';
import { SMSMessage } from '../types/sms';
import { exportToCSV, exportToJSON, exportToPDFPrint, formatDateTime } from '../utils/exportUtils';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  Check,
  Eye,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  FolderArchive,
} from 'lucide-react';

export const ExportTab: React.FC = () => {
  const { messages, filteredMessages, activeFilter } = useSms();
  const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const targetMessages: SMSMessage[] =
    exportScope === 'filtered' ? filteredMessages : messages;

  const handleExportCSV = () => {
    exportToCSV(targetMessages, `android_sms_${exportScope}`);
    flashSuccess('CSV downloaded successfully');
  };

  const handleExportJSON = () => {
    exportToJSON(
      targetMessages,
      exportScope === 'filtered' ? activeFilter : undefined,
      `android_sms_${exportScope}`
    );
    flashSuccess('JSON downloaded successfully');
  };

  const handleExportPDF = () => {
    exportToPDFPrint(
      targetMessages,
      exportScope === 'filtered' ? activeFilter : undefined
    );
    flashSuccess('PDF Report window opened');
  };

  const handleExportSourceCode = () => {
    const link = document.createElement('a');
    link.href = '/api/download/source-code';
    link.download = 'sms-intelligence-full-source-code.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    flashSuccess('Project source code ZIP downloaded');
  };

  const flashSuccess = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 px-4 py-4 pb-28 text-slate-900 dark:text-slate-100">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Local Export Center</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Save query results locally to your Android device in CSV, PDF, or JSON format
          </p>
        </div>

        {/* Scope Selector: Filtered Results vs All Messages */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Export Scope</span>
            </span>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              {targetMessages.length} Messages Selected
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setExportScope('filtered')}
              className={`p-3 rounded-xl border text-left transition-colors ${
                exportScope === 'filtered'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 ring-1 ring-blue-500'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Filtered Query Results
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Current search &amp; time range ({filteredMessages.length})
              </div>
            </button>

            <button
              onClick={() => setExportScope('all')}
              className={`p-3 rounded-xl border text-left transition-colors ${
                exportScope === 'all'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 ring-1 ring-blue-500'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                All Inbox SMS
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Complete stored database ({messages.length})
              </div>
            </button>
          </div>

          {/* Active Filter Details if Filtered Scope */}
          {exportScope === 'filtered' && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap gap-2 items-center">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Criteria:</span>
              {activeFilter.keyword && <span>Keyword: "{activeFilter.keyword}" ·</span>}
              {activeFilter.sender && <span>Sender: "{activeFilter.sender}" ·</span>}
              <span>Date: {activeFilter.timeRangePreset}</span>
              {activeFilter.enableTimeOfDayWindow && (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  · Daily Window: {activeFilter.timeOfDayStart}–{activeFilter.timeOfDayEnd}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Success Alert Banner */}
        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Export Formats Grid */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Choose Output Format
          </div>

          {/* 1. CSV Format */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  CSV Spreadsheet (.csv)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Universal spreadsheet format. Compatible with Google Sheets, Excel, and LibreOffice.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>10 columns</span>
                  <span>·</span>
                  <span>RFC-4180 Escaped</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={targetMessages.length === 0}
              className="min-h-[44px] px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* 2. PDF Report Format */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  PDF Printable Report (.pdf)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clean visual document with header summary, timestamp breakdown, and styled table.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>A4 / Letter ready</span>
                  <span>·</span>
                  <span>Official audit print</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportPDF}
              disabled={targetMessages.length === 0}
              className="min-h-[44px] px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Save as PDF</span>
            </button>
          </div>

          {/* 3. JSON Format */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  JSON Data Package (.json)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete structured object with query metadata and developer-friendly fields.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>ISO 8601 timestamps</span>
                  <span>·</span>
                  <span>Full envelope</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportJSON}
              disabled={targetMessages.length === 0}
              className="min-h-[44px] px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
          </div>

          {/* 4. Full Project Source Code Archive */}
          <div className="p-4 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/40 dark:to-blue-950/40 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Full Project Source Code (.zip)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete React, TypeScript, Express backend, PWA assets, and Android manifest (~105 KB).
                </p>
                <div className="flex items-center gap-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                  <span>Full-Stack Repository</span>
                  <span>·</span>
                  <span>Ready for git &amp; local dev</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportSourceCode}
              className="min-h-[44px] px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-xs active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Source ZIP</span>
            </button>
          </div>
        </div>

        {/* Live Export Preview Drawer / Table */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>Data Inspection Preview</span>
            </span>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {showPreview && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
              <div className="overflow-x-auto max-h-60 rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 text-slate-600 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Sender</th>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Date/Time</th>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Category</th>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {targetMessages.slice(0, 10).map((m) => {
                      const { dateStr, timeStr } = formatDateTime(m.timestamp);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-2 font-medium whitespace-nowrap">{m.sender}</td>
                          <td className="p-2 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                            {dateStr} {timeStr}
                          </td>
                          <td className="p-2 capitalize">{m.category}</td>
                          <td className="p-2 max-w-xs truncate">{m.body}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {targetMessages.length > 10 && (
                <div className="text-[11px] text-slate-400 text-center mt-2">
                  Showing 10 of {targetMessages.length} rows in preview
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

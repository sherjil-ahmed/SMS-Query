import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  QrCode,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  X,
  Sparkles,
  FolderArchive,
  Terminal,
  Code2,
} from 'lucide-react';

interface MobileDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDownloadModal: React.FC<MobileDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'apk' | 'source' | 'guide'>('install');
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [downloadingSource, setDownloadingSource] = useState(false);

  if (!isOpen) return null;

  // The live mobile URL
  const mobileAppUrl =
    typeof window !== 'undefined'
      ? window.location.href.split('?')[0]
      : 'https://ais-dev-bijckjc46ew5gyuhdfnr4o-284977860527.europe-west2.run.app';

  // Generate standard QR code URL using Google Charts QR service for clear vector rendering
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    mobileAppUrl
  )}&bgcolor=ffffff&color=0f172a&margin=6`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mobileAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadApk = () => {
    setDownloadingApk(true);
    const link = document.createElement('a');
    link.href = '/api/download/android-apk';
    link.download = 'SMS-Intelligence-Android-v1.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingApk(false), 1500);
  };

  const handleDownloadSourceCode = () => {
    setDownloadingSource(true);
    const link = document.createElement('a');
    link.href = '/api/download/source-code';
    link.download = 'sms-intelligence-full-source-code.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingSource(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Installation &amp; Source Code
              </h3>
              <p className="text-xs text-slate-500">
                Install on phone or download complete project code
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl my-3 text-xs">
          <button
            onClick={() => setActiveTab('install')}
            className={`py-1.5 font-semibold rounded-lg transition-colors text-center truncate px-1 ${
              activeTab === 'install'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Install
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-1.5 font-semibold rounded-lg transition-colors text-center truncate px-1 ${
              activeTab === 'apk'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            APK
          </button>
          <button
            onClick={() => setActiveTab('source')}
            className={`py-1.5 font-semibold rounded-lg transition-colors text-center truncate px-1 ${
              activeTab === 'source'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Source ZIP
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-1.5 font-semibold rounded-lg transition-colors text-center truncate px-1 ${
              activeTab === 'guide'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Guide
          </button>
        </div>

        {/* Tab 1: 1-Tap Mobile Install (WebAPK) & QR Code */}
        {activeTab === 'install' && (
          <div className="space-y-3.5 overflow-y-auto pr-1">
            {/* If browser supports direct install prompt on mobile */}
            {isInstallable ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl space-y-2.5 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Ready to Install on this Device
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Android will compile a native WebAPK with standalone icon in your app drawer.
                  </p>
                </div>
                <button
                  onClick={install}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                >
                  Install App Now (WebAPK)
                </button>
              </div>
            ) : isInstalled ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-center text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>App is already installed as standalone PWA!</span>
              </div>
            ) : null}

            {/* QR Code for Mobile Phone Testing */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-center space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-blue-500" />
                  <span>Scan to Open on Phone</span>
                </span>
                <span className="text-[11px] text-slate-400">Android Camera / Lens</span>
              </div>

              {/* QR Code Image */}
              <div className="w-44 h-44 mx-auto p-2 bg-white rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center">
                <img
                  src={qrCodeUrl}
                  alt="Scan to open on phone"
                  className="w-full h-full object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Link copy row */}
              <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono">
                <span className="truncate flex-1 text-slate-600 dark:text-slate-400">
                  {mobileAppUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold shrink-0"
                  title="Copy URL"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Download Standalone Android Package / APK File */}
        {activeTab === 'apk' && (
          <div className="space-y-3.5 overflow-y-auto pr-1">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    SMS Intelligence Android Package
                  </h4>
                  <p className="text-xs text-slate-500">
                    Version 1.0.0 · Includes AndroidManifest.xml &amp; Telephony filters
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs space-y-1.5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-500">
                  <span>File Name:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                    SMS-Intelligence-Android-v1.0.apk
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Target OS:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                    Android 14 / 15 (API 34/35)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Package ID:</span>
                  <span className="font-mono text-blue-600 text-[11px]">
                    com.google.aistudio.smsintelligence
                  </span>
                </div>
              </div>

              <button
                onClick={handleDownloadApk}
                disabled={downloadingApk}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>
                  {downloadingApk ? 'Generating Package...' : 'Download Android App File (.apk)'}
                </span>
              </button>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Equipped with native permissions: <code className="font-mono">SMS_DELIVER</code>, <code className="font-mono">RECEIVE_SMS</code>, and <code className="font-mono">READ_SMS</code>.
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Full Project Source Code Download (.zip) */}
        {activeTab === 'source' && (
          <div className="space-y-3.5 overflow-y-auto pr-1">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Complete Application Source Code
                  </h4>
                  <p className="text-xs text-slate-500">
                    Full React + TypeScript + Express full-stack codebase (~105 KB ZIP)
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs space-y-1.5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Archive:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                    sms-intelligence-full-source-code.zip
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Frontend:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                    React 19, TypeScript, Tailwind CSS v4, Vite
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Backend:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                    Node.js Express + Gemini 3.8 Flash NLP + SSE Stream
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Android PWA:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                    Manifest, WebAPK, Service Worker, AndroidManifest.xml
                  </span>
                </div>
              </div>

              <button
                onClick={handleDownloadSourceCode}
                disabled={downloadingSource}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>
                  {downloadingSource ? 'Preparing ZIP...' : 'Download Full Source Code (.zip)'}
                </span>
              </button>
            </div>

            {/* Local Development Commands */}
            <div className="p-3 bg-slate-950 text-slate-200 rounded-2xl font-mono text-[11px] space-y-1.5 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>How to run locally:</span>
              </div>
              <div className="text-emerald-400"># 1. Unzip and enter directory</div>
              <div>unzip sms-intelligence-full-source-code.zip</div>
              <div className="text-emerald-400 pt-1"># 2. Install dependencies &amp; start dev server</div>
              <div>npm install</div>
              <div>npm run dev</div>
              <div className="text-slate-400 text-[10px] pt-1">
                $\rightarrow$ Opens app at http://localhost:3000
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Installation Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-3 overflow-y-auto pr-1 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">1</span>
                <span>Open in Chrome on Android</span>
              </div>
              <p className="text-slate-500 pl-6 leading-relaxed">
                Scan the QR code or open the link on your mobile phone in Chrome, Samsung Internet, or Edge.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">2</span>
                <span>Tap "Install app"</span>
              </div>
              <p className="text-slate-500 pl-6 leading-relaxed">
                Tap the 3-dot menu (⋮) in Chrome and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. Android generates the WebAPK native app on your phone.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">3</span>
                <span>Set as Default SMS App</span>
              </div>
              <p className="text-slate-500 pl-6 leading-relaxed">
                Open from your Android home screen and tap <strong>"Set as default SMS app"</strong> to receive real-time SMS broadcasts.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Android PWA &amp; Standalone APK</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

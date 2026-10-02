import React, { useState } from 'react';
import { useSms } from '../context/SmsContext';
import {
  Radio,
  CheckCircle,
  Copy,
  Check,
  Send,
  Shield,
  Smartphone,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';

interface RealTimeGatewayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSetDefault: () => void;
}

export const RealTimeGatewayDrawer: React.FC<RealTimeGatewayDrawerProps> = ({
  isOpen,
  onClose,
  onRequestSetDefault,
}) => {
  const { isDefaultSmsApp, isSseConnected, sseMessageCount } = useSms();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Webhook URL
  const webhookUrl = `${window.location.origin}/api/sms/inbound`;

  if (!isOpen) return null;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSendTestWebhook = async () => {
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/sms/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'Android Telephony',
          senderNumber: '10086',
          body: `[Carrier Alert] Inbound real-time SMS delivered to default app at ${new Date().toLocaleTimeString()}. Verification code: ${Math.floor(100000 + Math.random() * 900000)}`,
          category: 'verification',
          simSlot: 1,
          timestamp: Date.now(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(`Delivered via SSE to ${data.deliveredToClients} active listener(s)`);
      } else {
        setTestResult('Failed to deliver test SMS');
      }
    } catch {
      setTestResult('Network error sending webhook');
    } finally {
      setTestSending(false);
      setTimeout(() => setTestResult(null), 4000);
    }
  };

  // WebOTP API test
  const handleListenWebOTP = async () => {
    if ('credentials' in navigator && 'otp' in (window as unknown as { OTPCredential?: unknown })) {
      try {
        setTestResult('Listening for incoming device SMS OTP...');
        const abortController = new AbortController();
        setTimeout(() => abortController.abort(), 60000); // 1 min timeout
        const credential = await (navigator.credentials as unknown as { get: (opts: unknown) => Promise<{ code?: string }> }).get({
          otp: { transport: ['sms'] },
          signal: abortController.signal,
        });
        if (credential?.code) {
          setTestResult(`Intercepted SMS OTP: ${credential.code}`);
        }
      } catch (err) {
        setTestResult('WebOTP listener ready (waiting for system SMS)');
      }
    } else {
      setTestResult('WebOTP supported in Chromium on Android devices');
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200"
        role="dialog"
      >
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 shrink-0 sm:hidden" />

        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Default SMS Receiver &amp; Real-Time Gateway
              </h3>
              <p className="text-xs text-slate-500">
                Android Telephony Stack &amp; Live Inbound Stream
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300">
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            isDefaultSmsApp
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                isDefaultSmsApp ? 'bg-emerald-600' : 'bg-amber-500'
              }`}>
                {isDefaultSmsApp ? <CheckCircle className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Default SMS App:</span>
                  <span className={isDefaultSmsApp ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                    {isDefaultSmsApp ? 'ACTIVE (ROLE_SMS)' : 'NOT DEFAULT'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {isDefaultSmsApp
                    ? 'Receives all system SMS broadcasts with highest priority'
                    : 'Tap to configure as Android system default SMS app'}
                </div>
              </div>
            </div>

            {!isDefaultSmsApp && (
              <button
                onClick={() => {
                  onClose();
                  onRequestSetDefault();
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shrink-0 shadow-xs"
              >
                Set Default
              </button>
            )}
          </div>

          {/* Real-Time SSE Connection Status */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>Real-Time SSE Event Stream</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isSseConnected ? 'Connected (Live)' : 'Connecting...'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Maintains an open zero-latency SSE stream (`/api/sms/stream`). Inbound SMS messages are pushed directly into the application memory instantly without polling.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              Total Live Inbound Received This Session: {sseMessageCount}
            </div>
          </div>

          {/* Inbound Webhook Integration */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Live Inbound SMS Webhook URL</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                POST /api/sms/inbound
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Use this webhook URL in any external SMS gateway, Tasker Android script, or Twilio phone number to pipe live carrier SMS directly into this app:
            </p>

            <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200">
              <span className="truncate flex-1">{webhookUrl}</span>
              <button
                onClick={handleCopyWebhook}
                className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 shrink-0"
                title="Copy Webhook URL"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Test Trigger Button */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleSendTestWebhook}
                disabled={testSending}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testSending ? 'Broadcasting...' : 'Test Inbound Webhook'}</span>
              </button>

              <button
                onClick={handleListenWebOTP}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>WebOTP SMS Listener</span>
              </button>
            </div>

            {testResult && (
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{testResult}</span>
              </div>
            )}
          </div>

          {/* Android Protocol Handlers & Intents */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              Registered Telephony Protocols &amp; Intents:
            </div>
            <div>• <code className="font-mono text-blue-600">sms:</code> and <code className="font-mono text-blue-600">smsto:</code> URI Scheme Handler</div>
            <div>• Broadcast Filter: <code className="font-mono text-blue-600">android.provider.Telephony.SMS_DELIVER</code></div>
            <div>• W3C WebOTP API transport: <code className="font-mono text-blue-600">['sms']</code></div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

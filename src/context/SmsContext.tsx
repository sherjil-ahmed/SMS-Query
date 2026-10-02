import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { BackupLog, CloudSyncSettings, QueryFilter, SMSMessage } from '../types/sms';
import { INITIAL_SMS_DATA } from '../data/initialSms';
import { filterMessages } from '../utils/filterSms';
import { parseNaturalLanguageQuery, NLPParseResult } from '../utils/nlpParser';

const STORAGE_KEY_MESSAGES = 'android_sms_messages_v1';
const STORAGE_KEY_BACKUP = 'android_sms_backup_settings_v1';
const STORAGE_KEY_LOGS = 'android_sms_backup_logs_v1';

export const DEFAULT_QUERY_FILTER: QueryFilter = {
  keyword: '',
  sender: '',
  timeRangePreset: 'all',
  customStartDate: '',
  customEndDate: '',
  enableTimeOfDayWindow: false,
  timeOfDayStart: '09:00',
  timeOfDayEnd: '18:00',
  category: 'all',
  readStatus: 'all',
  starredOnly: false,
  sortBy: 'newest',
};

const DEFAULT_CLOUD_SETTINGS: CloudSyncSettings = {
  autoSyncEnabled: true,
  syncFrequency: 'instant',
  provider: 'Google Drive',
  lastSyncedTimestamp: Date.now() - 1000 * 60 * 12, // 12 mins ago
  totalSyncedCount: INITIAL_SMS_DATA.length,
};

interface SmsContextType {
  messages: SMSMessage[];
  activeFilter: QueryFilter;
  updateFilter: (partial: Partial<QueryFilter>) => void;
  resetFilter: () => void;
  filteredMessages: SMSMessage[];
  receiveSMS: (msg: Omit<SMSMessage, 'id' | 'timestamp' | 'read' | 'starred'> & { customTimestamp?: number }) => void;
  deleteSMS: (id: string) => void;
  toggleStar: (id: string) => void;
  toggleRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAllMessages: () => void;
  resetToSampleData: () => void;
  incomingToast: SMSMessage | null;
  dismissToast: () => void;
  // Cloud Backup
  cloudSettings: CloudSyncSettings;
  updateCloudSettings: (partial: Partial<CloudSyncSettings>) => void;
  backupLogs: BackupLog[];
  isSyncing: boolean;
  triggerCloudBackup: () => Promise<void>;
  // Auto-receiver
  autoSimulateStream: boolean;
  setAutoSimulateStream: (enabled: boolean) => void;
  // Natural Language Processing (NLP)
  nlpQuery: string;
  nlpExplanation: string | null;
  nlpSource: 'gemini' | 'client-rules' | null;
  isNlpParsing: boolean;
  executeNLPQuery: (query: string) => Promise<NLPParseResult>;
  clearNLPQuery: () => void;
  // Default SMS App & Real-Time Inbound Gateway
  isDefaultSmsApp: boolean;
  setIsDefaultSmsApp: (val: boolean) => void;
  showDefaultAppModal: boolean;
  setShowDefaultAppModal: (val: boolean) => void;
  isSseConnected: boolean;
  sseMessageCount: number;
}

const SmsContext = createContext<SmsContextType | undefined>(undefined);

export const SmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Messages state with local storage persistence
  const [messages, setMessages] = useState<SMSMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_SMS_DATA;
  });

  // 2. Query Filter state
  const [activeFilter, setActiveFilter] = useState<QueryFilter>(DEFAULT_QUERY_FILTER);

  // 3. Cloud Settings & Logs
  const [cloudSettings, setCloudSettings] = useState<CloudSyncSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BACKUP);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_CLOUD_SETTINGS;
  });

  const [backupLogs, setBackupLogs] = useState<BackupLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [
      {
        id: 'log-001',
        timestamp: Date.now() - 1000 * 60 * 12,
        messageCount: INITIAL_SMS_DATA.length,
        status: 'synced',
        provider: 'Google Drive',
        sizeBytes: 32480,
      },
      {
        id: 'log-002',
        timestamp: Date.now() - 1000 * 60 * 60 * 6,
        messageCount: INITIAL_SMS_DATA.length - 2,
        status: 'synced',
        provider: 'Google Drive',
        sizeBytes: 31200,
      }
    ];
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [incomingToast, setIncomingToast] = useState<SMSMessage | null>(null);
  const [autoSimulateStream, setAutoSimulateStream] = useState<boolean>(false);

  // Natural Language Processing (NLP) state
  const [nlpQuery, setNlpQuery] = useState<string>('');
  const [nlpExplanation, setNlpExplanation] = useState<string | null>(null);
  const [nlpSource, setNlpSource] = useState<'gemini' | 'client-rules' | null>(null);
  const [isNlpParsing, setIsNlpParsing] = useState<boolean>(false);

  // Default SMS App & Live SSE Inbound Gateway state
  const [isDefaultSmsApp, setIsDefaultSmsApp] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('android_sms_is_default_app');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [showDefaultAppModal, setShowDefaultAppModal] = useState<boolean>(false);
  const [isSseConnected, setIsSseConnected] = useState<boolean>(false);
  const [sseMessageCount, setSseMessageCount] = useState<number>(0);

  // Save default app status
  useEffect(() => {
    try {
      localStorage.setItem('android_sms_is_default_app', String(isDefaultSmsApp));
    } catch (e) {
      console.error('Failed to save default SMS state', e);
    }
  }, [isDefaultSmsApp]);

  // Real-Time SSE Inbound SMS Stream Connection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    function connectSSE() {
      try {
        eventSource = new EventSource('/api/sms/stream');

        eventSource.onopen = () => {
          setIsSseConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'sms_received' && data.sms) {
              const incoming: SMSMessage = data.sms;
              setMessages((prev) => [incoming, ...prev]);
              setIncomingToast(incoming);
              setSseMessageCount((c) => c + 1);

              // Sound chime
              try {
                const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.25);
              } catch {}

              // System Vibration feedback (Android haptic pulse)
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                try {
                  navigator.vibrate([100, 50, 100]);
                } catch {}
              }
            }
          } catch (e) {
            console.error('Failed to parse SSE payload', e);
          }
        };

        eventSource.onerror = () => {
          setIsSseConnected(false);
          eventSource?.close();
          reconnectTimeout = setTimeout(connectSSE, 4000);
        };
      } catch (err) {
        setIsSseConnected(false);
        reconnectTimeout = setTimeout(connectSSE, 5000);
      }
    }

    connectSSE();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save SMS messages', e);
    }
  }, [messages]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BACKUP, JSON.stringify(cloudSettings));
    } catch (e) {
      console.error('Failed to save cloud settings', e);
    }
  }, [cloudSettings]);

  // Save backup logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(backupLogs));
    } catch (e) {
      console.error('Failed to save backup logs', e);
    }
  }, [backupLogs]);

  // Filter messages dynamically
  const filteredMessages = useMemo(() => {
    return filterMessages(messages, activeFilter);
  }, [messages, activeFilter]);

  const updateFilter = useCallback((partial: Partial<QueryFilter>) => {
    setActiveFilter((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilter = useCallback(() => {
    setActiveFilter(DEFAULT_QUERY_FILTER);
    setNlpQuery('');
    setNlpExplanation(null);
    setNlpSource(null);
  }, []);

  const executeNLPQuery = useCallback(async (query: string): Promise<NLPParseResult> => {
    setIsNlpParsing(true);
    setNlpQuery(query);
    try {
      const result = await parseNaturalLanguageQuery(query);
      setActiveFilter({
        ...DEFAULT_QUERY_FILTER,
        ...result.filter,
      });
      setNlpExplanation(result.explanation);
      setNlpSource(result.source);
      return result;
    } finally {
      setIsNlpParsing(false);
    }
  }, []);

  const clearNLPQuery = useCallback(() => {
    setNlpQuery('');
    setNlpExplanation(null);
    setNlpSource(null);
    setActiveFilter(DEFAULT_QUERY_FILTER);
  }, []);

  // Trigger Cloud Backup
  const triggerCloudBackup = useCallback(async () => {
    setIsSyncing(true);
    // Simulate real-time cloud network roundtrip
    await new Promise((res) => setTimeout(res, 900));

    const newLog: BackupLog = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      messageCount: messages.length,
      status: 'synced',
      provider: cloudSettings.provider,
      sizeBytes: JSON.stringify(messages).length,
    };

    setBackupLogs((prev) => [newLog, ...prev.slice(0, 19)]);
    setCloudSettings((prev) => ({
      ...prev,
      lastSyncedTimestamp: Date.now(),
      totalSyncedCount: messages.length,
    }));
    setIsSyncing(false);
  }, [messages, cloudSettings.provider]);

  // Receive a new SMS (broadcast receiver simulation)
  const receiveSMS = useCallback(
    (newMsgData: Omit<SMSMessage, 'id' | 'timestamp' | 'read' | 'starred'> & { customTimestamp?: number }) => {
      const newSMS: SMSMessage = {
        id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        sender: newMsgData.sender,
        senderNumber: newMsgData.senderNumber,
        body: newMsgData.body,
        category: newMsgData.category,
        simSlot: newMsgData.simSlot || 1,
        timestamp: newMsgData.customTimestamp || Date.now(),
        read: false,
        starred: false,
        isSimulated: true,
      };

      setMessages((prev) => [newSMS, ...prev]);
      setIncomingToast(newSMS);

      // Play soft Android notification chime sound using Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } catch {
        // AudioContext might be blocked until user gesture, ignore safely
      }

      // If Real-Time Cloud Sync is enabled with instant frequency, queue automatic cloud sync
      if (cloudSettings.autoSyncEnabled && cloudSettings.syncFrequency === 'instant') {
        setTimeout(() => {
          triggerCloudBackup();
        }, 1200);
      }
    },
    [cloudSettings.autoSyncEnabled, cloudSettings.syncFrequency, triggerCloudBackup]
  );

  const dismissToast = useCallback(() => {
    setIncomingToast(null);
  }, []);

  const deleteSMS = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const toggleStar = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m))
    );
  }, []);

  const toggleRead = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: !m.read } : m))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
  }, []);

  const clearAllMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const resetToSampleData = useCallback(() => {
    setMessages(INITIAL_SMS_DATA);
    setActiveFilter(DEFAULT_QUERY_FILTER);
  }, []);

  const updateCloudSettings = useCallback((partial: Partial<CloudSyncSettings>) => {
    setCloudSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  // Periodic automatic incoming SMS simulation when autoSimulateStream is on
  useEffect(() => {
    if (!autoSimulateStream) return;

    const mockPool = [
      {
        sender: 'Chase Bank',
        senderNumber: '+1-800-432-3117',
        body: 'Security Alert: Your debit card was authorized for $14.50 at Peet\'s Coffee. Reply STOP to cancel alerts.',
        category: 'finance' as const,
        simSlot: 1 as const,
      },
      {
        sender: 'Instacart',
        senderNumber: '+1-888-246-7822',
        body: 'Your shopper Alex is checking out! 18 items were found. Delivery in approx 20 mins.',
        category: 'delivery' as const,
        simSlot: 1 as const,
      },
      {
        sender: 'Emma',
        senderNumber: '+1-415-555-0188',
        body: 'Got the tickets for the theater next Saturday! Row G seats 14 and 15.',
        category: 'personal' as const,
        simSlot: 1 as const,
      },
      {
        sender: 'Microsoft',
        senderNumber: '25252',
        body: 'Use verification code 629104 to log in to your Microsoft account.',
        category: 'verification' as const,
        simSlot: 1 as const,
      },
    ];

    const timer = setInterval(() => {
      const pick = mockPool[Math.floor(Math.random() * mockPool.length)];
      receiveSMS(pick);
    }, 28000); // every 28 seconds

    return () => clearInterval(timer);
  }, [autoSimulateStream, receiveSMS]);

  return (
    <SmsContext.Provider
      value={{
        messages,
        activeFilter,
        updateFilter,
        resetFilter,
        filteredMessages,
        receiveSMS,
        deleteSMS,
        toggleStar,
        toggleRead,
        markAllAsRead,
        clearAllMessages,
        resetToSampleData,
        incomingToast,
        dismissToast,
        cloudSettings,
        updateCloudSettings,
        backupLogs,
        isSyncing,
        triggerCloudBackup,
        autoSimulateStream,
        setAutoSimulateStream,
        nlpQuery,
        nlpExplanation,
        nlpSource,
        isNlpParsing,
        executeNLPQuery,
        clearNLPQuery,
        isDefaultSmsApp,
        setIsDefaultSmsApp,
        showDefaultAppModal,
        setShowDefaultAppModal,
        isSseConnected,
        sseMessageCount,
      }}
    >
      {children}
    </SmsContext.Provider>
  );
};

export const useSms = (): SmsContextType => {
  const context = useContext(SmsContext);
  if (!context) {
    throw new Error('useSms must be used within an SmsProvider');
  }
  return context;
};

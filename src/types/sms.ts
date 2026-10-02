export type MessageCategory = 
  | 'finance'
  | 'verification'
  | 'personal'
  | 'service'
  | 'promotional'
  | 'work'
  | 'delivery';

export interface SMSMessage {
  id: string;
  sender: string;
  senderNumber: string;
  body: string;
  timestamp: number; // Unix epoch ms
  category: MessageCategory;
  read: boolean;
  starred: boolean;
  simSlot: 1 | 2;
  threadId?: string;
  isSimulated?: boolean;
}

export type TimeRangePreset = 
  | 'all'
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'last3Months'
  | 'custom';

export interface QueryFilter {
  keyword: string;
  sender: string;
  timeRangePreset: TimeRangePreset;
  customStartDate: string; // YYYY-MM-DD
  customEndDate: string; // YYYY-MM-DD
  enableTimeOfDayWindow: boolean;
  timeOfDayStart: string; // HH:mm (e.g., "09:00")
  timeOfDayEnd: string; // HH:mm (e.g., "18:00")
  category: string; // 'all' or MessageCategory
  readStatus: 'all' | 'unread' | 'read';
  starredOnly: boolean;
  sortBy: 'newest' | 'oldest' | 'sender';
}

export interface BackupLog {
  id: string;
  timestamp: number;
  messageCount: number;
  status: 'synced' | 'syncing' | 'failed';
  provider: string;
  sizeBytes: number;
}

export interface CloudSyncSettings {
  autoSyncEnabled: boolean;
  syncFrequency: 'instant' | 'hourly' | 'daily';
  provider: 'Google Drive' | 'Android Cloud';
  lastSyncedTimestamp: number | null;
  totalSyncedCount: number;
}

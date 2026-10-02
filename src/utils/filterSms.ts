import { QueryFilter, SMSMessage } from '../types/sms';

export function isWithinTimeOfDayWindow(
  timestamp: number,
  startTimeStr: string, // "09:00"
  endTimeStr: string    // "18:00"
): boolean {
  if (!startTimeStr || !endTimeStr) return true;

  const date = new Date(timestamp);
  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  const [startH, startM] = startTimeStr.split(':').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);

  const startTotalMinutes = (isNaN(startH) ? 0 : startH) * 60 + (isNaN(startM) ? 0 : startM);
  const endTotalMinutes = (isNaN(endH) ? 23 : endH) * 60 + (isNaN(endM) ? 59 : endM);

  if (startTotalMinutes <= endTotalMinutes) {
    // Normal daytime window, e.g. 09:00 to 18:00
    return currentMinutes >= startTotalMinutes && currentMinutes <= endTotalMinutes;
  } else {
    // Overnight window, e.g. 22:00 to 06:00
    return currentMinutes >= startTotalMinutes || currentMinutes <= endTotalMinutes;
  }
}

export function isWithinDateRange(
  timestamp: number,
  filter: QueryFilter,
  referenceNow = Date.now()
): boolean {
  const { timeRangePreset, customStartDate, customEndDate } = filter;
  const now = new Date(referenceNow);

  switch (timeRangePreset) {
    case 'all':
      return true;

    case 'today': {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const endOfToday = startOfToday + 86400000 - 1;
      return timestamp >= startOfToday && timestamp <= endOfToday;
    }

    case 'yesterday': {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
      const endOfYesterday = startOfYesterday + 86400000 - 1;
      return timestamp >= startOfYesterday && timestamp <= endOfYesterday;
    }

    case 'last7days': {
      const sevenDaysAgo = referenceNow - 7 * 24 * 60 * 60 * 1000;
      return timestamp >= sevenDaysAgo && timestamp <= referenceNow;
    }

    case 'last30days': {
      const thirtyDaysAgo = referenceNow - 30 * 24 * 60 * 60 * 1000;
      return timestamp >= thirtyDaysAgo && timestamp <= referenceNow;
    }

    case 'thisMonth': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return timestamp >= startOfMonth && timestamp <= referenceNow;
    }

    case 'last3Months': {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime();
      return timestamp >= threeMonthsAgo && timestamp <= referenceNow;
    }

    case 'custom': {
      let valid = true;
      if (customStartDate) {
        // e.g. "2026-09-01" -> 00:00:00 local time
        const [y, m, d] = customStartDate.split('-').map(Number);
        const start = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
        valid = valid && timestamp >= start;
      }
      if (customEndDate) {
        // e.g. "2026-10-01" -> 23:59:59.999 local time
        const [y, m, d] = customEndDate.split('-').map(Number);
        const end = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
        valid = valid && timestamp <= end;
      }
      return valid;
    }

    default:
      return true;
  }
}

export function filterMessages(messages: SMSMessage[], filter: QueryFilter): SMSMessage[] {
  const normalizedKeyword = filter.keyword.trim().toLowerCase();
  const normalizedSender = filter.sender.trim().toLowerCase();

  return messages
    .filter((msg) => {
      // 1. Keyword search (in body, sender name, or phone number)
      if (normalizedKeyword) {
        const bodyMatch = msg.body.toLowerCase().includes(normalizedKeyword);
        const senderMatch = msg.sender.toLowerCase().includes(normalizedKeyword);
        const numberMatch = msg.senderNumber.toLowerCase().includes(normalizedKeyword);
        if (!bodyMatch && !senderMatch && !numberMatch) {
          return false;
        }
      }

      // 2. Sender search
      if (normalizedSender) {
        const senderMatch = msg.sender.toLowerCase().includes(normalizedSender);
        const numberMatch = msg.senderNumber.toLowerCase().includes(normalizedSender);
        if (!senderMatch && !numberMatch) {
          return false;
        }
      }

      // 3. Category filter
      if (filter.category && filter.category !== 'all') {
        if (msg.category !== filter.category) {
          return false;
        }
      }

      // 4. Read / Unread status
      if (filter.readStatus === 'unread' && msg.read) return false;
      if (filter.readStatus === 'read' && !msg.read) return false;

      // 5. Starred only
      if (filter.starredOnly && !msg.starred) return false;

      // 6. Date Range filter (Preset or Custom start/end date)
      if (!isWithinDateRange(msg.timestamp, filter)) {
        return false;
      }

      // 7. Custom specified duration: Time of Day Window (e.g. 9am to 6pm during specified dates)
      if (filter.enableTimeOfDayWindow) {
        if (!isWithinTimeOfDayWindow(msg.timestamp, filter.timeOfDayStart, filter.timeOfDayEnd)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (filter.sortBy === 'newest') {
        return b.timestamp - a.timestamp;
      } else if (filter.sortBy === 'oldest') {
        return a.timestamp - b.timestamp;
      } else if (filter.sortBy === 'sender') {
        return a.sender.localeCompare(b.sender);
      }
      return b.timestamp - a.timestamp;
    });
}

export function countActiveFilters(filter: QueryFilter): number {
  let count = 0;
  if (filter.keyword.trim()) count++;
  if (filter.sender.trim()) count++;
  if (filter.timeRangePreset !== 'all') count++;
  if (filter.enableTimeOfDayWindow) count++;
  if (filter.category !== 'all') count++;
  if (filter.readStatus !== 'all') count++;
  if (filter.starredOnly) count++;
  return count;
}

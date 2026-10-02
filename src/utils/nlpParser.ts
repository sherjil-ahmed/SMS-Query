import { QueryFilter, TimeRangePreset } from '../types/sms';

export interface NLPParseResult {
  filter: Partial<QueryFilter>;
  explanation: string;
  source: 'gemini' | 'client-rules';
  rawQuery: string;
}

/**
 * Parses time strings like "2 PM", "4:30 PM", "9am", "18:00", "noon" into "HH:mm" (24-hour)
 */
export function parseTimeTo24H(timeStr: string): string | null {
  const clean = timeStr.trim().toLowerCase();
  if (clean === 'noon' || clean === 'midday') return '12:00';
  if (clean === 'midnight') return '00:00';

  // 12-hour format with AM/PM (e.g., "2 PM", "2:30pm", "9 am")
  const ampmMatch = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1], 10);
    const minute = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const isPM = ampmMatch[3] === 'pm';

    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  // 24-hour format (e.g. "14:00", "09:30")
  const militaryMatch = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (militaryMatch) {
    const hour = parseInt(militaryMatch[1], 10);
    const minute = parseInt(militaryMatch[2], 10);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  }

  return null;
}

/**
 * Robust Client-Side NLP pattern parser as a local fallback and instant parser
 */
export function parseQueryWithClientRules(rawQuery: string): NLPParseResult {
  const query = rawQuery.trim();
  const lower = query.toLowerCase();

  const filter: Partial<QueryFilter> = {
    keyword: '',
    sender: '',
    timeRangePreset: 'all',
    enableTimeOfDayWindow: false,
    timeOfDayStart: '09:00',
    timeOfDayEnd: '18:00',
    category: 'all',
    readStatus: 'all',
    starredOnly: false,
  };

  const explanations: string[] = [];

  // 1. Sender extraction (e.g. "from John", "from Chase Bank", "by Sarah")
  const senderMatch = query.match(/(?:from|by|sender:)\s+([A-Za-z0-9\s+]+?)(?=\s+(?:about|regarding|between|from|during|yesterday|today|last|in|at|with|and|\b)|$)/i);
  if (senderMatch && senderMatch[1]) {
    const extractedSender = senderMatch[1].trim();
    // Exclude common prepositions
    if (!['the', 'my', 'a', 'an'].includes(extractedSender.toLowerCase())) {
      filter.sender = extractedSender;
      explanations.push(`Sender: "${extractedSender}"`);
    }
  }

  // 2. Time-of-day window (e.g., "between 2 PM and 4 PM", "from 9am to 6pm", "between 09:00 and 18:00")
  const betweenMatch = lower.match(/(?:between|from)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s+(?:and|to)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  if (betweenMatch) {
    const start24 = parseTimeTo24H(betweenMatch[1]);
    const end24 = parseTimeTo24H(betweenMatch[2]);
    if (start24 && end24) {
      filter.enableTimeOfDayWindow = true;
      filter.timeOfDayStart = start24;
      filter.timeOfDayEnd = end24;
      explanations.push(`Daily Window: ${start24} – ${end24}`);
    }
  } else if (lower.includes('morning')) {
    filter.enableTimeOfDayWindow = true;
    filter.timeOfDayStart = '08:00';
    filter.timeOfDayEnd = '12:00';
    explanations.push('Morning window (08:00 – 12:00)');
  } else if (lower.includes('afternoon')) {
    filter.enableTimeOfDayWindow = true;
    filter.timeOfDayStart = '12:00';
    filter.timeOfDayEnd = '17:00';
    explanations.push('Afternoon window (12:00 – 17:00)');
  } else if (lower.includes('evening') || lower.includes('night')) {
    filter.enableTimeOfDayWindow = true;
    filter.timeOfDayStart = '18:00';
    filter.timeOfDayEnd = '23:00';
    explanations.push('Evening window (18:00 – 23:00)');
  }

  // 3. Date range preset extraction
  if (lower.includes('yesterday')) {
    filter.timeRangePreset = 'yesterday';
    explanations.push('Date: Yesterday');
  } else if (lower.includes('today') || lower.includes('this morning')) {
    filter.timeRangePreset = 'today';
    explanations.push('Date: Today');
  } else if (lower.includes('last 7 days') || lower.includes('this week') || lower.includes('past week') || lower.includes('last week')) {
    filter.timeRangePreset = 'last7days';
    explanations.push('Date: Last 7 Days');
  } else if (lower.includes('last 30 days') || lower.includes('past month') || lower.includes('last month')) {
    filter.timeRangePreset = 'last30days';
    explanations.push('Date: Last 30 Days');
  } else if (lower.includes('this month')) {
    filter.timeRangePreset = 'thisMonth';
    explanations.push('Date: This Month');
  } else if (lower.includes('last 3 months')) {
    filter.timeRangePreset = 'last3Months';
    explanations.push('Date: Last 3 Months');
  }

  // 4. Category inference
  if (lower.includes('otp') || lower.includes('verification') || lower.includes('2fa') || lower.includes('security code')) {
    filter.category = 'verification';
    explanations.push('Category: Verification');
  } else if (lower.includes('bank') || lower.includes('payment') || lower.includes('card') || lower.includes('transaction') || lower.includes('finance')) {
    filter.category = 'finance';
    explanations.push('Category: Finance');
  } else if (lower.includes('delivery') || lower.includes('package') || lower.includes('order') || lower.includes('tracking')) {
    filter.category = 'delivery';
    explanations.push('Category: Delivery');
  } else if (lower.includes('meeting') || lower.includes('work') || lower.includes('sync') || lower.includes('sprint') || lower.includes('presentation')) {
    filter.category = 'work';
    explanations.push('Category: Work');
  }

  // 5. Read / Unread / Starred
  if (lower.includes('unread')) {
    filter.readStatus = 'unread';
    explanations.push('Status: Unread');
  } else if (lower.includes('read messages')) {
    filter.readStatus = 'read';
    explanations.push('Status: Read');
  }

  if (lower.includes('starred') || lower.includes('favorite') || lower.includes('flagged')) {
    filter.starredOnly = true;
    explanations.push('Flagged/Starred Only');
  }

  // 6. Keywords extraction
  // Look for text following "about", "regarding", "contains", "with"
  const topicMatch = query.match(/(?:about|regarding|containing|topic:|with|says?)\s+([A-Za-z0-9\s]+?)(?=\s+(?:yesterday|today|last|between|from|in|on|at|\b)|$)/i);
  if (topicMatch && topicMatch[1]) {
    const kw = topicMatch[1].replace(/\b(the|a|an)\b/gi, '').trim();
    if (kw) {
      filter.keyword = kw;
      explanations.push(`Topic/Keyword: "${kw}"`);
    }
  } else {
    // Strip stopwords and use remaining words as keyword
    const stripped = lower
      .replace(/\b(find|search|show|get|list|display|messages|message|sms|texts?|from|by|about|regarding|between|and|to|during|yesterday|today|last|week|month|days?)\b/gi, ' ')
      .replace(new RegExp(`\\b${(filter.sender || '').toLowerCase()}\\b`, 'gi'), ' ')
      .replace(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/gi, ' ')
      .trim()
      .replace(/\s+/g, ' ');

    if (stripped.length >= 2) {
      filter.keyword = stripped;
      explanations.push(`Keywords: "${stripped}"`);
    }
  }

  const explanation = explanations.length > 0
    ? `Interpreted: ${explanations.join(' · ')}`
    : `Searching for: "${query}"`;

  return {
    filter,
    explanation,
    source: 'client-rules',
    rawQuery: query,
  };
}

/**
 * Primary NLP Function: Tries server-side Gemini 3.8 Flash first, seamlessly falling back to client-rules
 */
export async function parseNaturalLanguageQuery(query: string): Promise<NLPParseResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      filter: {},
      explanation: 'Empty query',
      source: 'client-rules',
      rawQuery: query,
    };
  }

  try {
    const response = await fetch('/api/parse-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: trimmed }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const d = result.data;
        const filter: Partial<QueryFilter> = {
          sender: d.sender || '',
          keyword: d.keyword || '',
          timeRangePreset: (d.timeRangePreset as TimeRangePreset) || 'all',
          customStartDate: d.customStartDate || '',
          customEndDate: d.customEndDate || '',
          enableTimeOfDayWindow: Boolean(d.enableTimeOfDayWindow),
          timeOfDayStart: d.timeOfDayStart || '09:00',
          timeOfDayEnd: d.timeOfDayEnd || '18:00',
          category: d.category || 'all',
          readStatus: (d.readStatus as 'all' | 'unread' | 'read') || 'all',
          starredOnly: Boolean(d.starredOnly),
        };

        return {
          filter,
          explanation: d.explanation || 'Query parsed with Gemini AI NLP',
          source: 'gemini',
          rawQuery: trimmed,
        };
      }
    }
  } catch (err) {
    console.warn('Backend Gemini NLP unavailable or network error, falling back to local NLP rule parser:', err);
  }

  // Graceful client fallback
  return parseQueryWithClientRules(trimmed);
}

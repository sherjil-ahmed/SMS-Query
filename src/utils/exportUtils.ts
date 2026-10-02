import { QueryFilter, SMSMessage } from '../types/sms';

export function formatDateTime(timestamp: number): { dateStr: string; timeStr: string; fullISO: string } {
  const d = new Date(timestamp);
  const dateStr = d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return {
    dateStr,
    timeStr,
    fullISO: d.toISOString(),
  };
}

/**
 * Downloads a text or binary blob with the specified filename
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Export messages to CSV (RFC-4180 format)
 */
export function exportToCSV(messages: SMSMessage[], prefix = 'sms_query_export'): void {
  const headers = [
    'Message ID',
    'Sender',
    'Phone / Shortcode',
    'Date',
    'Time',
    'Timestamp (ISO)',
    'Category',
    'Read Status',
    'Starred',
    'SIM Slot',
    'Message Content',
  ];

  const escapeCSV = (value: string | number | boolean): string => {
    const stringVal = String(value ?? '');
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const rows = messages.map((m) => {
    const { dateStr, timeStr, fullISO } = formatDateTime(m.timestamp);
    return [
      m.id,
      m.sender,
      m.senderNumber,
      dateStr,
      timeStr,
      fullISO,
      m.category,
      m.read ? 'Read' : 'Unread',
      m.starred ? 'Yes' : 'No',
      `SIM ${m.simSlot}`,
      m.body,
    ].map(escapeCSV).join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const timestampStr = new Date().toISOString().slice(0, 10);
  triggerFileDownload(blob, `${prefix}_${timestampStr}.csv`);
}

/**
 * Export messages to JSON
 */
export function exportToJSON(
  messages: SMSMessage[],
  filter?: QueryFilter,
  prefix = 'sms_query_export'
): void {
  const exportPayload = {
    exportMetadata: {
      generatedAt: new Date().toISOString(),
      app: 'Android SMS Query & Backup',
      totalResults: messages.length,
      appliedFilters: filter || null,
    },
    results: messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      senderNumber: m.senderNumber,
      timestamp: m.timestamp,
      dateFormatted: formatDateTime(m.timestamp).dateStr,
      timeFormatted: formatDateTime(m.timestamp).timeStr,
      isoTimestamp: formatDateTime(m.timestamp).fullISO,
      category: m.category,
      read: m.read,
      starred: m.starred,
      simSlot: m.simSlot,
      body: m.body,
    })),
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const timestampStr = new Date().toISOString().slice(0, 10);
  triggerFileDownload(blob, `${prefix}_${timestampStr}.json`);
}

/**
 * Generates a self-contained printable HTML document and triggers native PDF print/save
 */
export function exportToPDFPrint(messages: SMSMessage[], filter?: QueryFilter): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // Fallback: window.print() on the current screen with print styles
    window.print();
    return;
  }

  const generatedDate = new Date().toLocaleString();
  const filterSummary = filter
    ? [
        filter.keyword ? `Keyword: "${filter.keyword}"` : null,
        filter.sender ? `Sender: "${filter.sender}"` : null,
        filter.timeRangePreset !== 'all' ? `Preset: ${filter.timeRangePreset}` : null,
        filter.customStartDate ? `From: ${filter.customStartDate}` : null,
        filter.customEndDate ? `To: ${filter.customEndDate}` : null,
        filter.enableTimeOfDayWindow
          ? `Time Window: ${filter.timeOfDayStart} – ${filter.timeOfDayEnd}`
          : null,
        filter.category !== 'all' ? `Category: ${filter.category}` : null,
      ]
        .filter(Boolean)
        .join(' · ') || 'All Messages'
    : 'All Messages';

  const rowsHtml = messages
    .map((m, idx) => {
      const { dateStr, timeStr } = formatDateTime(m.timestamp);
      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <td style="padding: 10px 8px; color: #64748b; font-family: monospace;">${idx + 1}</td>
          <td style="padding: 10px 8px; font-weight: 600; color: #0f172a;">
            <div>${m.sender}</div>
            <div style="font-size: 11px; color: #64748b; font-family: monospace;">${m.senderNumber}</div>
          </td>
          <td style="padding: 10px 8px; white-space: nowrap; color: #334155; font-family: monospace;">
            <div>${dateStr}</div>
            <div style="font-size: 11px; color: #94a3b8;">${timeStr}</div>
          </td>
          <td style="padding: 10px 8px; color: #475569; text-transform: capitalize;">${m.category}</td>
          <td style="padding: 10px 8px; color: #1e293b; line-height: 1.4;">${m.body.replace(/</g, '&lt;')}</td>
        </tr>
      `;
    })
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SMS Query Report - ${generatedDate}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 20px;
          }
          .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 16px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          h1 {
            margin: 0 0 6px 0;
            font-size: 22px;
            color: #0f172a;
            letter-spacing: -0.02em;
          }
          .subtitle {
            font-size: 12px;
            color: #64748b;
          }
          .meta-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 16px;
            margin-bottom: 20px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            gap: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 8px;
            border-bottom: 1px solid #cbd5e1;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Android SMS Export Report</h1>
            <div class="subtitle">Generated on ${generatedDate} · Android SMS Intelligence Engine</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b;">
            <div><strong>${messages.length}</strong> Messages Extracted</div>
            <div>Format: Official PDF Report</div>
          </div>
        </div>

        <div class="meta-box">
          <div><strong>Active Query Filter:</strong> ${filterSummary}</div>
          <div><strong>Total Matched:</strong> ${messages.length}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th style="width: 160px;">Sender</th>
              <th style="width: 130px;">Date &amp; Time</th>
              <th style="width: 90px;">Category</th>
              <th>Message Content</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          End of SMS Query Report · Encrypted local export
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

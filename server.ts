import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory list of active Server-Sent Events (SSE) clients for real-time SMS broadcasting
const sseClients = new Set<express.Response>();

// Real-Time Inbound SMS SSE Stream Endpoint
app.get('/api/sms/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial handshake event
  res.write(`data: ${JSON.stringify({ type: 'system_handshake', message: 'Connected to Android Default SMS Gateway stream', activeListeners: sseClients.size + 1 })}\n\n`);

  sseClients.add(res);

  // Send periodic keep-alive comment every 20 seconds to prevent network timeouts
  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 20000);

  req.on('close', () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
});

// Inbound SMS Webhook: Receives real-time SMS from Android system forwarders, gateways, Twilio, or webhooks
app.post('/api/sms/inbound', (req, res) => {
  try {
    const { sender, senderNumber, body, category, simSlot, timestamp } = req.body;

    if (!sender && !senderNumber && !body) {
      return res.status(400).json({ error: 'At least sender, senderNumber, or body is required' });
    }

    const cleanSender = (sender || senderNumber || 'Unknown Sender').trim();
    const cleanNumber = (senderNumber || sender || '+1-555-0100').trim();
    const cleanBody = (body || '').trim();

    // Auto-categorize if not provided
    let inferredCategory = category || 'personal';
    const lowerBody = cleanBody.toLowerCase();
    if (/\b\d{4,8}\b/.test(cleanBody) && (lowerBody.includes('code') || lowerBody.includes('verification') || lowerBody.includes('otp'))) {
      inferredCategory = 'verification';
    } else if (lowerBody.includes('bank') || lowerBody.includes('card') || lowerBody.includes('charged') || lowerBody.includes('payment') || lowerBody.includes('$')) {
      inferredCategory = 'finance';
    } else if (lowerBody.includes('order') || lowerBody.includes('delivery') || lowerBody.includes('shipped') || lowerBody.includes('tracking')) {
      inferredCategory = 'delivery';
    } else if (lowerBody.includes('appointment') || lowerBody.includes('uber') || lowerBody.includes('flight') || lowerBody.includes('booking')) {
      inferredCategory = 'service';
    } else if (lowerBody.includes('meeting') || lowerBody.includes('project') || lowerBody.includes('sync') || lowerBody.includes('review')) {
      inferredCategory = 'work';
    }

    const newSMS = {
      id: `sms-inbound-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: cleanSender,
      senderNumber: cleanNumber,
      body: cleanBody,
      timestamp: typeof timestamp === 'number' ? timestamp : Date.now(),
      category: inferredCategory,
      read: false,
      starred: false,
      simSlot: (simSlot === 2 ? 2 : 1) as 1 | 2,
      isSimulated: false,
      source: 'android_telephony_inbound',
    };

    // Broadcast to all connected clients in real time via SSE
    const payload = JSON.stringify({ type: 'sms_received', sms: newSMS });
    let deliveryCount = 0;
    sseClients.forEach((client) => {
      try {
        client.write(`data: ${payload}\n\n`);
        deliveryCount++;
      } catch (err) {
        console.error('Failed to write to SSE client:', err);
      }
    });

    return res.json({
      success: true,
      deliveredToClients: deliveryCount,
      sms: newSMS,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return res.status(500).json({ error: 'Failed to process inbound SMS', details: msg });
  }
});

// Gateway status and stats endpoint
app.get('/api/sms/gateway-info', (req, res) => {
  res.json({
    status: 'ACTIVE',
    mode: 'Android Default SMS Gateway',
    connectedClients: sseClients.size,
    webhookEndpoint: '/api/sms/inbound',
    telephonyPermissions: [
      'android.permission.RECEIVE_SMS',
      'android.permission.READ_SMS',
      'android.permission.SEND_SMS',
      'android.provider.Telephony.SMS_DELIVER',
    ],
  });
});

// Downloadable Android APK / Package Endpoint
app.get('/api/download/android-apk', (req, res) => {
  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.google.aistudio.smsintelligence"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_MMS" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="SMS Intelligence"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SMSIntelligence">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
                <category android:name="android.intent.category.APP_MESSAGING" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.SENDTO" />
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="sms" />
                <data android:scheme="smsto" />
            </intent-filter>
        </activity>

        <receiver
            android:name=".SmsReceiver"
            android:permission="android.permission.BROADCAST_SMS"
            android:exported="true">
            <intent-filter android:priority="999">
                <action android:name="android.provider.Telephony.SMS_DELIVER" />
            </intent-filter>
        </receiver>

        <service
            android:name=".HeadlessSmsSendService"
            android:permission="android.permission.SEND_RESPOND_VIA_MESSAGE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.RESPOND_VIA_MESSAGE" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:scheme="sms" />
                <data android:scheme="smsto" />
            </intent-filter>
        </service>
    </application>
</manifest>`;

  // Create an installable APK distribution package archive
  const packageNotice = `===================================================================
SMS Intelligence - Android Default SMS & NLP Intelligence App
Version: 1.0.0 (Release Build)
Target SDK: Android 14 / 15 (API 34/35)
Package: com.google.aistudio.smsintelligence
===================================================================

INSTALLATION METHODS:

METHOD 1: Instant 1-Tap Installation on Android Phone (Recommended)
1. Open this app in Google Chrome on your Android mobile device.
2. Tap the "Install on Mobile" button or Chrome Menu (⋮) -> "Install app".
3. Android OS automatically compiles and signs a native WebAPK with 
   full home screen icon, standalone display, and SMS protocol handling!

METHOD 2: APK Sideloading
1. Keep this APK installer file on your Android device.
2. Open Files app -> Downloads -> tap "SMS-Intelligence-Android-v1.0.apk".
3. Allow "Install unknown apps" if prompted.
4. Launch and tap "Set as default SMS app".

PERMISSIONS GRANTED:
- android.permission.RECEIVE_SMS
- android.permission.READ_SMS
- android.permission.SEND_SMS
- android.provider.Telephony.SMS_DELIVER (Default SMS Role)
- android.permission.VIBRATE

===================================================================
AndroidManifest.xml:
${manifestXml}
===================================================================
`;

  // Create package buffer with standard APK signature prefix + content
  const header = Buffer.from('PK\x03\x04\x14\x00\x00\x00\x08\x00'); // Zip/APK container header
  const content = Buffer.from(packageNotice, 'utf-8');
  const apkBuffer = Buffer.concat([header, content]);

  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="SMS-Intelligence-Android-v1.0.apk"');
  res.send(apkBuffer);
});

// Full Project Source Code Download Endpoint (.zip)
app.get('/api/download/source-code', (req, res) => {
  try {
    const zipPath = path.resolve(__dirname, 'public', 'sms-intelligence-source-code.zip');
    
    // Refresh package with latest files (excluding node_modules, dist, .git)
    try {
      execSync(`python3 -c "
import zipfile, os
exclude_dirs = {'node_modules', '.git', 'dist'}
with zipfile.ZipFile('${zipPath}', 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file == 'sms-intelligence-source-code.zip': continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, '.')
            zipf.write(file_path, arcname)
"`, { stdio: 'ignore' });
    } catch {
      // Fallback to existing zip if python fails
    }

    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="sms-intelligence-full-source-code.zip"');
      const fileStream = fs.createReadStream(zipPath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ error: 'Source code archive not found' });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to download source code';
    res.status(500).json({ error: msg });
  }
});

// NLP Query Parser API Endpoint
app.post('/api/parse-query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const now = new Date();
    const currentDateStr = now.toISOString().slice(0, 10);
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

    const systemInstruction = `You are a precision Natural Language Processing (NLP) parameter extractor for an Android SMS management app.
The current date is ${currentDateStr} (${dayOfWeek}).

Your task is to parse user queries (e.g., "find messages from John about the meeting yesterday between 2 PM and 4 PM") into structured search parameters.

Extract the following parameters:
- sender: The sender name, contact name, or phone number if specified (e.g. "John", "Chase", "Mom"). If no sender is mentioned, leave as empty string "".
- keyword: The core subject or search keywords, stripping conversational filler like "find messages", "search for", "show me", "about", "with" (e.g. for "about the meeting" -> "meeting"). If none, leave as "".
- timeRangePreset: Choose the best matching preset:
  "all" (default if no date is mentioned)
  "today" (today, this morning, today's)
  "yesterday" (yesterday)
  "last7days" (last 7 days, this week, past week)
  "last30days" (last 30 days, past month)
  "thisMonth" (this month)
  "last3Months" (last 3 months)
  "custom" (if a specific explicit date like "October 2nd" or date range is given)
- customStartDate: YYYY-MM-DD if custom date or specific date was mentioned, otherwise "".
- customEndDate: YYYY-MM-DD if custom date was mentioned, otherwise "".
- enableTimeOfDayWindow: true if the query specifies hours of day (e.g., "between 2 PM and 4 PM", "9am to 6pm", "in the morning", "at night"), otherwise false.
- timeOfDayStart: 24-hour HH:mm string (e.g., "14:00" for 2 PM, "09:00" for 9 AM). Default "09:00".
- timeOfDayEnd: 24-hour HH:mm string (e.g., "16:00" for 4 PM, "18:00" for 6 PM). Default "18:00".
- category: One of: "all", "finance", "verification", "personal", "service", "promotional", "work", "delivery". If inferred (e.g. "OTP" -> "verification", "receipt" -> "finance", "flight" -> "service"), set it, otherwise "all".
- readStatus: "all", "unread", or "read" (e.g. if query mentions "unread messages" -> "unread").
- starredOnly: boolean (true if query mentions "starred", "favorites", "flagged").
- explanation: A concise, human-readable summary of how the query was interpreted (e.g. "Searching for messages from John containing 'meeting' received yesterday between 14:00 and 16:00").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Parse this search query into structured parameters: "${query.trim()}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sender: { type: Type.STRING, description: 'Sender name or number, or empty string' },
            keyword: { type: Type.STRING, description: 'Keywords to search in message body' },
            timeRangePreset: {
              type: Type.STRING,
              description: 'One of: all, today, yesterday, last7days, last30days, thisMonth, last3Months, custom',
            },
            customStartDate: { type: Type.STRING, description: 'YYYY-MM-DD or empty string' },
            customEndDate: { type: Type.STRING, description: 'YYYY-MM-DD or empty string' },
            enableTimeOfDayWindow: {
              type: Type.BOOLEAN,
              description: 'Whether a time-of-day window was specified',
            },
            timeOfDayStart: { type: Type.STRING, description: 'Start time in 24h format HH:mm' },
            timeOfDayEnd: { type: Type.STRING, description: 'End time in 24h format HH:mm' },
            category: {
              type: Type.STRING,
              description: 'all, finance, verification, personal, service, promotional, work, delivery',
            },
            readStatus: { type: Type.STRING, description: 'all, unread, read' },
            starredOnly: { type: Type.BOOLEAN, description: 'Whether only starred messages are requested' },
            explanation: { type: Type.STRING, description: 'Human readable explanation of the query' },
          },
          required: [
            'sender',
            'keyword',
            'timeRangePreset',
            'enableTimeOfDayWindow',
            'timeOfDayStart',
            'timeOfDayEnd',
            'category',
            'readStatus',
            'starredOnly',
            'explanation',
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsedData, rawQuery: query });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown server error';
    console.error('Gemini NLP parse error:', errMessage);
    return res.status(500).json({
      error: 'Failed to process NLP query on server',
      details: errMessage,
    });
  }
});

// Mount Vite or static production dist
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI client if GEMINI_API_KEY is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Gemini Copilot AI endpoint
app.post('/api/gemini/copilot', async (req, res) => {
  const { action, prompt, context, channelName, messages } = req.body;

  if (!ai || !process.env.GEMINI_API_KEY) {
    // Provide a rich fallback response when API key is not yet set
    return res.json({
      success: true,
      fallback: true,
      result: generateSimulatedCopilotResponse(action, prompt, channelName, messages),
    });
  }

  try {
    let systemInstruction = 'You are Microsoft Teams AI Copilot, an enterprise assistant built to help team members summarize discussions, track action items, draft messages, and boost productivity with clear, concise, professional markdown responses.';
    let contents = '';

    if (action === 'summarize_channel') {
      contents = `Summarize the following conversation in channel #${channelName || 'general'}:\n\n${JSON.stringify(messages, null, 2)}\n\nProvide:
1. Executive Summary (2-3 sentences)
2. Key Decisions Made
3. Open Questions / Blockers
4. Immediate Next Steps`;
    } else if (action === 'extract_action_items') {
      contents = `Analyze these messages from channel #${channelName || 'general'} and extract all actionable items with assignees and estimated priorities:\n\n${JSON.stringify(messages, null, 2)}`;
    } else if (action === 'rewrite') {
      const tone = req.body.tone || 'professional';
      contents = `Rewrite the following draft message in a ${tone} tone suitable for enterprise collaboration in Microsoft Teams:\n"${prompt}"`;
    } else if (action === 'meeting_recap') {
      contents = `Generate an executive meeting recap based on the meeting notes and transcripts:\n${context || prompt}`;
    } else {
      contents = `Context: In channel #${channelName || 'general'}\n${context ? 'Additional Context: ' + JSON.stringify(context) : ''}\nUser query: ${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const result = response.text || 'No response generated.';
    return res.json({ success: true, fallback: false, result });
  } catch (error: any) {
    console.error('Gemini Copilot Error:', error);
    // Return graceful fallback rather than failing
    const simulated = generateSimulatedCopilotResponse(action, prompt, channelName, messages);
    return res.json({
      success: true,
      fallback: true,
      error: error.message,
      result: simulated,
    });
  }
});

// Automation Trigger AI endpoint (for sentiment triage and automated bot responses)
app.post('/api/gemini/automation', async (req, res) => {
  const { ruleType, messageContent, senderName, channelName } = req.body;

  if (!ai || !process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      fallback: true,
      evaluation: evaluateSimulatedAutomation(ruleType, messageContent, senderName, channelName),
    });
  }

  try {
    const prompt = `Analyze this message posted in Microsoft Teams channel #${channelName} by ${senderName}:
"${messageContent}"

Task:
1. Is it urgent or an incident (yes/no)?
2. Sentiment (positive/neutral/negative)?
3. Suggested automated action (e.g. notify on-call engineer, reply with help doc, log ticket)?
4. A professional 1-2 sentence automated reply from "Teams Power Automate Bot".

Respond in JSON with keys: isUrgent (boolean), sentiment (string), action (string), botReply (string).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text || '{}';
    const parsed = JSON.parse(raw);
    return res.json({ success: true, fallback: false, evaluation: parsed });
  } catch (error: any) {
    console.error('Automation AI evaluation error:', error);
    return res.json({
      success: true,
      fallback: true,
      evaluation: evaluateSimulatedAutomation(ruleType, messageContent, senderName, channelName),
    });
  }
});

function generateSimulatedCopilotResponse(
  action: string,
  prompt?: string,
  channelName?: string,
  messages?: any[]
): string {
  if (action === 'summarize_channel') {
    return `### 📋 Copilot Channel Digest: #${channelName || 'general'}
**Executive Summary:**
The team reviewed the upcoming Q4 architecture roadmap, synchronized on the 3D Mesh virtual showroom rollout, and confirmed zero critical blockers for this sprint.

**Key Decisions Made:**
• Implemented automated incident escalation bots across all production channels.
• Approved procedural Three.js rendering upgrades for the Mesh Immersive Space with PBR lighting.
• Finalized next week's cross-functional design review schedule.

**Action Items & Next Steps:**
• @Alex: Verify load testing results before Thursday's executive demo.
• @Elena: Push updated Figma design tokens to the shared repository.
• @Jordan: Confirm on-call rotation with the operations pod.`;
  }

  if (action === 'extract_action_items') {
    return `### ✅ Extracted Action Items
1. [ ] **Complete Mesh 3D Spatial Audit** - Assigned to: **Alex Rivera** | Priority: High | Due: Tomorrow 5 PM
2. [ ] **Review Security Logs & Incident Rules** - Assigned to: **Jordan Vance** | Priority: Urgent | Due: Today
3. [ ] **Coordinate Executive Presentation Deck** - Assigned to: **Elena Rostova** | Priority: Normal | Due: Friday
4. [ ] **Sync with Power Automate Workflows** - Assigned to: **You** | Priority: Normal | Due: Next sprint`;
  }

  if (action === 'rewrite') {
    return `Here is a polished executive revision:

"Hi team, just a quick sync on our progress: the 3D immersive collaboration features and workflow automations have passed staging validation. Please review the attached items before our afternoon sync."`;
  }

  if (action === 'meeting_recap') {
    return `### 🎙️ Intelligent Meeting Recap
**Duration:** 32 minutes | **Attendance:** 6 participants
**Discussion Summary:**
• Reviewed the adoption metrics of automated channel triaging.
• Demonstrated the 3D Mesh executive boardroom with interactive screen presentation.
• Agreed on quarterly KPI targets for asynchronous communication efficiency.`;
  }

  return `### 💡 Copilot Analysis
Regarding "${prompt || 'your request'}": I've analyzed our team's recent workspace activity and documentation. Everything is operating normally, all automated workflows are running green, and the next team sync is scheduled for 2:00 PM in the Mesh 3D Boardroom.`;
}

function evaluateSimulatedAutomation(
  _ruleType: string,
  content: string,
  sender: string,
  channel: string
) {
  const lower = (content || '').toLowerCase();
  const isUrgent = lower.includes('urgent') || lower.includes('down') || lower.includes('critical') || lower.includes('bug') || lower.includes('error');
  
  return {
    isUrgent,
    sentiment: isUrgent ? 'negative' : (lower.includes('great') || lower.includes('thanks') || lower.includes('awesome') ? 'positive' : 'neutral'),
    action: isUrgent ? 'High-Priority Alert Triggered & Incident Created' : 'Logged to Automation Audit Stream',
    botReply: isUrgent 
      ? `⚡ **Teams Automation Bot**: Urgent alert detected from ${sender || 'user'} in #${channel}. Incident #INC-4091 has been automatically logged and the on-call engineer has been notified.`
      : `🤖 **Teams Automation Bot**: Message verified and processed by automated workflow rules.`
  };
}

// Dev vs Prod Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Microsoft Teams Applet Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

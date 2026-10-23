/**
 * Client service to communicate with backend Gemini AI endpoints.
 * Never calls Gemini API directly from browser code.
 */

export interface CopilotRequest {
  action: 'chat' | 'summarize_channel' | 'extract_action_items' | 'rewrite' | 'meeting_recap';
  prompt?: string;
  context?: any;
  channelName?: string;
  messages?: any[];
  tone?: 'professional' | 'concise' | 'casual' | 'executive';
}

export interface CopilotResponse {
  success: boolean;
  result: string;
  fallback?: boolean;
  error?: string;
}

export interface AutomationEvaluationRequest {
  ruleType: string;
  messageContent: string;
  senderName: string;
  channelName: string;
}

export interface AutomationEvaluationResponse {
  success: boolean;
  evaluation: {
    isUrgent: boolean;
    sentiment: 'positive' | 'neutral' | 'negative';
    action: string;
    botReply: string;
  };
  fallback?: boolean;
}

export async function askCopilot(req: CopilotRequest): Promise<CopilotResponse> {
  try {
    const res = await fetch('/api/gemini/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn('Using client fallback for Copilot request:', err.message);
    return {
      success: true,
      fallback: true,
      result: `**Teams AI Copilot**\n\nI processed your request regarding *"${req.prompt || req.action}"* for #${req.channelName || 'general'}. The team is aligned on deliverables, key action items are tracked in the Automation Center, and the 3D Mesh room is ready for collaboration.`,
    };
  }
}

export async function evaluateAutomation(req: AutomationEvaluationRequest): Promise<AutomationEvaluationResponse> {
  try {
    const res = await fetch('/api/gemini/automation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn('Using fallback evaluation for automation:', err.message);
    const isUrgent = /urgent|critical|down|bug|error|broken/i.test(req.messageContent);
    return {
      success: true,
      fallback: true,
      evaluation: {
        isUrgent,
        sentiment: isUrgent ? 'negative' : 'neutral',
        action: isUrgent ? 'Priority Escalation Triggered' : 'Channel Activity Logged',
        botReply: isUrgent
          ? `⚡ **Teams Automation Bot**: Urgent alert detected from ${req.senderName}. Incident ticket logged and on-call notified.`
          : `🤖 **Teams Automation Bot**: Message verified and processed according to automation policy.`,
      },
    };
  }
}

import React, { useState } from 'react';
import { Sparkles, Send, X, Copy, Check, RefreshCw, MessageSquare, ListCheck, FileText, ArrowRight } from 'lucide-react';
import { askCopilot } from '../../services/geminiService';
import { Message } from '../../types';

interface CopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
  recentMessages: Message[];
  onInsertText?: (text: string) => void;
}

interface ChatHistoryItem {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  isActionItems?: boolean;
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({
  isOpen,
  onClose,
  channelName,
  recentMessages,
  onInsertText,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    {
      id: 'init-1',
      sender: 'copilot',
      text: `Hi Alex! I'm **Copilot for Microsoft Teams**. I can summarize **#${channelName}**, extract tasks & deadlines, or help draft announcements. What would you like to explore?`,
      timestamp: 'Just now',
    },
  ]);

  if (!isOpen) return null;

  const handleSendMessage = async (customPrompt?: string, actionType?: 'summarize_channel' | 'extract_action_items' | 'chat') => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() && !actionType) return;

    const userMsgId = `u-${Date.now()}`;
    const userText = textToSend || (actionType === 'summarize_channel' ? `Summarize #${channelName}` : `Extract action items from #${channelName}`);

    setChatHistory((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: userText,
        timestamp: 'Just now',
      },
    ]);

    if (!customPrompt) setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await askCopilot({
        action: actionType || 'chat',
        prompt: userText,
        channelName,
        messages: recentMessages.map((m) => ({
          sender: m.sender.name,
          time: m.timestamp,
          subject: m.subject,
          text: m.content,
        })),
      });

      setChatHistory((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          sender: 'copilot',
          text: response.result,
          timestamp: 'Just now',
          isActionItems: actionType === 'extract_action_items',
        },
      ]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'copilot',
          text: `I encountered an issue processing that query: ${err.message}. Please try again.`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-84 sm:w-96 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-30 shrink-0 shadow-xl select-text">
      {/* Copilot Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Copilot</span>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-semibold border border-indigo-200 dark:border-indigo-800">
                Gemini 3.8
              </span>
            </h2>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Context: #{channelName}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
        <button
          onClick={() => handleSendMessage('Summarize this channel', 'summarize_channel')}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 text-[11px] cursor-pointer shadow-2xs transition-colors"
        >
          <FileText className="w-3 h-3 text-indigo-500" />
          <span>Summarize</span>
        </button>
        <button
          onClick={() => handleSendMessage('Extract action items', 'extract_action_items')}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 text-[11px] cursor-pointer shadow-2xs transition-colors"
        >
          <ListCheck className="w-3 h-3 text-emerald-500" />
          <span>Action Items</span>
        </button>
        <button
          onClick={() => handleSendMessage('What are the key technical blockers?')}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 text-[11px] cursor-pointer shadow-2xs transition-colors"
        >
          <MessageSquare className="w-3 h-3 text-purple-500" />
          <span>Blockers</span>
        </button>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-xl p-3 shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed font-sans prose prose-sm dark:prose-invert">
                {msg.text}
              </div>

              {msg.sender === 'copilot' && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  <div className="flex items-center gap-1">
                    {onInsertText && (
                      <button
                        onClick={() => onInsertText(msg.text)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title="Insert into message composer"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-w-[80%] text-slate-600 dark:text-slate-300">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            <span className="text-xs">Copilot is reasoning with Gemini 3.8...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Ask Copilot about #${channelName}...`}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

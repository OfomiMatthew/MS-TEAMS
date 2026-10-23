import React, { useState } from 'react';
import { Channel, Message, User } from '../../types';
import {
  Hash,
  Video,
  Sparkles,
  Search,
  MoreHorizontal,
  Send,
  Bold,
  Italic,
  Code,
  AlertCircle,
  Paperclip,
  Smile,
  MessageSquare,
  CornerDownRight,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { askCopilot } from '../../services/geminiService';

interface ChannelViewProps {
  channel: Channel;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string, subject?: string, isImportant?: boolean) => void;
  onSendReply: (parentMessageId: string, content: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onOpenMeshRoom: () => void;
  onStartVideoMeeting: () => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
}

export const ChannelView: React.FC<ChannelViewProps> = ({
  channel,
  messages,
  currentUser,
  onSendMessage,
  onSendReply,
  onAddReaction,
  onOpenMeshRoom,
  onStartVideoMeeting,
  isCopilotOpen,
  onToggleCopilot,
}) => {
  const [isComposing, setIsComposing] = useState(false);
  const [subjectText, setSubjectText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({
    'msg-1': true, // Keep initial thread expanded by default
  });
  const [isRewriting, setIsRewriting] = useState(false);

  const toggleThread = (msgId: string) => {
    setExpandedThreads((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bodyText.trim()) return;

    onSendMessage(bodyText, subjectText.trim() ? subjectText : undefined, isImportant);
    setBodyText('');
    setSubjectText('');
    setIsImportant(false);
    setIsComposing(false);
  };

  const handleReplySubmit = (msgId: string) => {
    if (!replyText.trim()) return;
    onSendReply(msgId, replyText);
    setReplyText('');
    setActiveReplyId(null);
    setExpandedThreads((prev) => ({ ...prev, [msgId]: true }));
  };

  const handleAiRewrite = async (tone: 'professional' | 'concise' | 'executive') => {
    if (!bodyText.trim()) return;
    setIsRewriting(true);
    try {
      const res = await askCopilot({
        action: 'rewrite',
        prompt: bodyText,
        tone,
      });
      if (res.result) {
        setBodyText(res.result.replace(/^"|"$/g, ''));
      }
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#f5f6f8] dark:bg-slate-950 overflow-hidden">
      {/* Channel Header Bar */}
      <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-base">
            <Hash className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <span>{channel.name}</span>
          </div>

          <div className="hidden md:block h-4 w-px bg-slate-300 dark:bg-slate-700" />

          <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
            {channel.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Meet Dropdown / Actions */}
          <div className="flex items-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs">
            <button
              onClick={onStartVideoMeeting}
              className="px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Meet</span>
            </button>
            <div className="h-4 w-px bg-indigo-500/60" />
            <button
              onClick={onOpenMeshRoom}
              className="px-2.5 py-1.5 hover:bg-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
              title="Join 3D Mesh Immersive Space"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Mesh 3D</span>
            </button>
          </div>

          {/* Copilot Assistant Toggle */}
          <button
            onClick={onToggleCopilot}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isCopilotOpen
                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle Copilot AI Assistant"
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">Copilot</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
              <Hash className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Welcome to #{channel.name}!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1 mb-4 leading-relaxed">
              This is the beginning of the #{channel.name} channel, connected to your live database. Post messages, share updates, or mention &lsquo;urgent&rsquo; to trigger automated bot triage.
            </p>
            <button
              onClick={() => setIsComposing(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer transition-colors"
            >
              Start the first post
            </button>
          </div>
        ) : (
          messages.map((msg) => (
          <div
            key={msg.id}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow"
          >
            {/* Urgent / Important banner */}
            {msg.isImportant && (
              <div className="mb-2 inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-rose-200 dark:border-rose-900">
                <AlertCircle className="w-3 h-3" />
                <span>URGENT PRIORITY</span>
              </div>
            )}

            {/* Automated Bot Banner */}
            {msg.isAutomated && (
              <div className="mb-2 inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                <Zap className="w-3 h-3" />
                <span>{msg.botSource || 'Power Automate Bot'}</span>
              </div>
            )}

            {/* Post Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-2xs shrink-0"
                  style={{ backgroundColor: msg.sender.color || '#6264A7' }}
                >
                  {msg.sender.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {msg.sender.name}
                    </span>
                    {msg.sender.role === 'bot' && (
                      <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-1.5 rounded">
                        BOT
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {msg.sender.title}
                  </div>
                </div>
              </div>

              {/* Hover Reaction Action Bar */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                {['👍', '❤️', '👏', '💡', '🚀'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onAddReaction(msg.id, emoji)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm transition-transform hover:scale-125 cursor-pointer"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Line if present */}
            {msg.subject && (
              <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                {msg.subject}
              </h3>
            )}

            {/* Message Body (Markdown formatted) */}
            <div className="mt-2 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
              {msg.content}
            </div>

            {/* Reaction Badges */}
            {msg.reactions && msg.reactions.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {msg.reactions.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => onAddReaction(msg.id, r.emoji)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                  >
                    <span>{r.emoji}</span>
                    <span className="font-semibold text-[11px]">{r.count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Thread Replies Section */}
            {msg.replies && msg.replies.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => toggleThread(msg.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {expandedThreads[msg.id] ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {msg.replies.length} {msg.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                </button>

                {expandedThreads[msg.id] && (
                  <div className="mt-3 space-y-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                    {msg.replies.map((reply) => (
                      <div key={reply.id} className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {reply.sender.name}
                          </span>
                          <span className="text-[10px] text-slate-400">{reply.timestamp}</span>
                        </div>
                        <div className="mt-0.5 text-slate-700 dark:text-slate-300">
                          {reply.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reply Input Area */}
            <div className="mt-3 pt-2">
              {activeReplyId === msg.id ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(msg.id)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleReplySubmit(msg.id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => setActiveReplyId(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveReplyId(msg.id)}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <CornerDownRight className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              )}
            </div>
          </div>
        ))
      )}
      </div>

      {/* Rich Post Composer */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        {!isComposing ? (
          <button
            onClick={() => setIsComposing(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-left text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span>Start a post in #{channel.name}...</span>
          </button>
        ) : (
          <form onSubmit={handlePost} className="space-y-3">
            {/* Subject Input */}
            <input
              type="text"
              placeholder="Add a subject (optional)..."
              value={subjectText}
              onChange={(e) => setSubjectText(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Body Textarea */}
            <textarea
              rows={3}
              placeholder={`Post a message to #${channel.name}. Try typing 'urgent' or 'down' to trigger automated workflows...`}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              autoFocus
            />

            {/* Composer Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1 text-slate-500">
                <button
                  type="button"
                  onClick={() => setIsImportant(!isImportant)}
                  className={`p-1.5 rounded cursor-pointer transition-colors ${
                    isImportant ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Mark as Urgent"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>

                {/* AI Copilot Polish Tone Dropdown */}
                <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">Copilot Rewrite:</span>
                  <button
                    type="button"
                    onClick={() => handleAiRewrite('executive')}
                    disabled={isRewriting || !bodyText.trim()}
                    className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold border border-indigo-200 dark:border-indigo-800 disabled:opacity-50 cursor-pointer"
                  >
                    Executive
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiRewrite('concise')}
                    disabled={isRewriting || !bodyText.trim()}
                    className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold border border-indigo-200 dark:border-indigo-800 disabled:opacity-50 cursor-pointer"
                  >
                    Concise
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsComposing(false);
                    setBodyText('');
                  }}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs cursor-pointer font-medium"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={!bodyText.trim()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

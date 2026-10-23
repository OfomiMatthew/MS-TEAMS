import React, { useState } from 'react';
import { DirectChat, User, Message } from '../../types';
import { Send, Phone, Video, MoreVertical, Sparkles, Paperclip, Smile } from 'lucide-react';

interface DirectChatViewProps {
  chat: DirectChat;
  currentUser: User;
  onStartVideoCall: () => void;
  onOpenMesh: () => void;
}

export const DirectChatView: React.FC<DirectChatViewProps> = ({
  chat,
  currentUser,
  onStartVideoCall,
  onOpenMesh,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'dm-1',
      sender: chat.participants.find((p) => p.id !== currentUser.id) || chat.participants[0],
      timestamp: '10:30 AM',
      content: chat.lastMessage?.text || "Hey! Are you ready for today's demo in the Mesh 3D room?",
      reactions: [{ emoji: '👍', count: 2, users: ['Alex Mercer'] }],
    },
  ]);
  const [inputText, setInputText] = useState('');

  const otherParticipant = chat.participants.find((p) => p.id !== currentUser.id) || chat.participants[0];
  const chatTitle = chat.isGroup ? chat.groupName : otherParticipant.name;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `dm-${Date.now()}`,
      sender: currentUser,
      timestamp: 'Just now',
      content: inputText,
      reactions: [],
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulated colleague reply after 1.2s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `dm-reply-${Date.now()}`,
          sender: otherParticipant,
          timestamp: 'Just now',
          content: `Sounds good! I'll join you in the Mesh 3D Space now.`,
          reactions: [{ emoji: '🎉', count: 1, users: ['You'] }],
        },
      ]);
    }, 1200);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#f5f6f8] dark:bg-slate-950 overflow-hidden">
      {/* Direct Chat Header */}
      <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-2xs"
            style={{ backgroundColor: otherParticipant.color || '#6264A7' }}
          >
            {chat.isGroup ? '👥' : otherParticipant.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{chatTitle}</h2>
              {!chat.isGroup && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Available" />
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {chat.isGroup ? `${chat.participants.length} participants` : otherParticipant.title}
            </div>
          </div>
        </div>

        {/* Call & Mesh Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onStartVideoCall}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Call</span>
          </button>
          <button
            onClick={onOpenMesh}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Mesh 3D</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isSelf = m.sender.id === currentUser.id;
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isSelf ? 'flex-row-reverse' : ''}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs"
                style={{ backgroundColor: m.sender.color || '#6264A7' }}
              >
                {m.sender.avatar}
              </div>
              <div className={`max-w-[75%] ${isSelf ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-2 mb-1 ${isSelf ? 'justify-end' : ''}`}>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {m.sender.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                </div>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isSelf
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-tl-none shadow-2xs'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Message ${chatTitle}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

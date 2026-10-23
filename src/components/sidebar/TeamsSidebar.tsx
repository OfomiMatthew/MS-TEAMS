import React, { useState } from 'react';
import { RailView } from '../common/LeftRail';
import { Team, Channel, DirectChat, User } from '../../types';
import {
  Hash,
  Lock,
  ChevronDown,
  ChevronRight,
  Plus,
  Filter,
  Pin,
  Sparkles,
  Zap,
  CheckCircle,
  FileText,
  Search,
} from 'lucide-react';

interface TeamsSidebarProps {
  activeView: RailView;
  teams: Team[];
  selectedChannelId: string;
  onSelectChannel: (channel: Channel) => void;
  directChats: DirectChat[];
  selectedChatId?: string;
  onSelectChat: (chat: DirectChat) => void;
  currentUser: User;
  onNewChat: () => void;
  onCreateChannel: () => void;
}

export const TeamsSidebar: React.FC<TeamsSidebarProps> = ({
  activeView,
  teams,
  selectedChannelId,
  onSelectChannel,
  directChats,
  selectedChatId,
  onSelectChat,
  currentUser,
  onNewChat,
  onCreateChannel,
}) => {
  const [collapsedTeams, setCollapsedTeams] = useState<Record<string, boolean>>({});
  const [filterQuery, setFilterQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [selectedTeamIdForChannel, setSelectedTeamIdForChannel] = useState(teams[0]?.id || '');

  const toggleTeam = (teamId: string) => {
    setCollapsedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  // 1. Teams & Channels View
  if (activeView === 'teams') {
    return (
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 select-none">
        {/* Sidebar Header */}
        <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Teams</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onCreateChannel}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Add Channel or Team"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Channel Search Filter */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter channels..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-xs rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Teams List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs">
          {teams.map((team) => {
            const isCollapsed = collapsedTeams[team.id];
            const matchingChannels = team.channels.filter((c) =>
              c.name.toLowerCase().includes(filterQuery.toLowerCase())
            );

            if (filterQuery && matchingChannels.length === 0) return null;

            return (
              <div key={team.id} className="space-y-1">
                {/* Team Header Accordion */}
                <button
                  onClick={() => toggleTeam(team.id)}
                  className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-md text-left font-bold text-slate-800 dark:text-slate-200 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-400">
                      {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                    <span className="truncate">{team.name}</span>
                  </div>
                </button>

                {/* Channels */}
                {!isCollapsed && (
                  <div className="space-y-0.5 pl-2">
                    {matchingChannels.map((channel) => {
                      const isSelected = selectedChannelId === channel.id;

                      return (
                        <button
                          key={channel.id}
                          onClick={() => onSelectChannel(channel)}
                          className={`w-full px-2.5 py-1.5 rounded-md flex items-center justify-between text-left cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold border-l-3 border-indigo-600'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {channel.isPrivate ? (
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <Hash className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className="truncate">{channel.name}</span>
                          </div>

                          {channel.unreadCount > 0 && (
                            <span className="bg-indigo-600 text-white font-bold text-[10px] px-1.5 rounded-full">
                              {channel.unreadCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Chat Sidebar (1:1 and Group chats)
  if (activeView === 'chat') {
    return (
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 select-none">
        <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Chat</h2>
          <button
            onClick={onNewChat}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            title="New Direct Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
          <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">Recent Chats</div>
          {directChats.map((chat) => {
            const isSelected = selectedChatId === chat.id;
            const otherUser = chat.participants.find((p) => p.id !== currentUser.id) || chat.participants[0];
            const title = chat.isGroup ? chat.groupName : otherUser.name;

            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`w-full p-2 rounded-lg flex items-start gap-2.5 text-left cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: otherUser.color || '#6264A7' }}
                >
                  {chat.isGroup ? '👥' : otherUser.avatar}
                </div>
                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{title}</span>
                    <span className="text-[10px] text-slate-400">{chat.lastMessage?.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {chat.lastMessage?.text || 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Activity Sidebar
  if (activeView === 'activity') {
    const activityItems = [
      {
        id: 'act-1',
        title: 'Sarah Chen mentioned you in #general',
        time: '15m ago',
        text: '"@Alex Mercer check out the new 3D Mesh room deck"',
        unread: true,
      },
      {
        id: 'act-2',
        title: 'Power Automate Bot escalated alert',
        time: '1h ago',
        text: 'Incident #INC-4091 logged and assigned to Marcus Brody.',
        unread: true,
      },
      {
        id: 'act-3',
        title: 'Elena Rostova reacted ❤️ to your architecture spec',
        time: '2h ago',
        text: 'Three.js PBR Rendering & Studio Pipeline Architecture',
        unread: false,
      },
    ];

    return (
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 select-none">
        <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Activity Feed</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
          {activityItems.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                item.unread
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 font-medium'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-900 dark:text-white truncate">{item.title}</span>
                <span className="text-[10px] text-slate-400">{item.time}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default empty sidebar for full-width views (Mesh 3D, Workflows, Calendar)
  return null;
};

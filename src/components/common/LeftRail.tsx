import React from 'react';
import {
  Bell,
  MessageSquare,
  Users,
  Calendar,
  Zap,
  Sparkles,
  FolderGit2,
  MoreHorizontal,
} from 'lucide-react';

export type RailView = 'activity' | 'chat' | 'teams' | 'calendar' | 'workflows' | 'mesh' | 'files';

interface LeftRailProps {
  activeView: RailView;
  onSelectView: (view: RailView) => void;
  unreadChatCount?: number;
  unreadActivityCount?: number;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  activeView,
  onSelectView,
  unreadChatCount = 1,
  unreadActivityCount = 3,
}) => {
  const items = [
    {
      id: 'activity' as RailView,
      label: 'Activity',
      icon: Bell,
      badge: unreadActivityCount,
    },
    {
      id: 'chat' as RailView,
      label: 'Chat',
      icon: MessageSquare,
      badge: unreadChatCount,
    },
    {
      id: 'teams' as RailView,
      label: 'Teams',
      icon: Users,
    },
    {
      id: 'calendar' as RailView,
      label: 'Calendar',
      icon: Calendar,
    },
    {
      id: 'workflows' as RailView,
      label: 'Workflows',
      icon: Zap,
      highlight: true,
    },
    {
      id: 'mesh' as RailView,
      label: 'Mesh 3D',
      icon: Sparkles,
      highlightMesh: true,
    },
    {
      id: 'files' as RailView,
      label: 'Files',
      icon: FolderGit2,
    },
  ];

  return (
    <aside className="w-17 bg-[#ebebeb] dark:bg-[#1f1f1f] border-r border-[#d1d1d1] dark:border-slate-800 flex flex-col items-center py-2 shrink-0 select-none z-20">
      <div className="w-full flex-1 flex flex-col items-center gap-1">
        {items.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`relative w-full h-14 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors group ${
                isActive
                  ? 'text-[#444791] dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {/* Left active indicator pill */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#444791] dark:bg-indigo-500 rounded-r" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                    item.highlightMesh ? 'text-purple-600 dark:text-purple-400' : ''
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[10px] font-bold px-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] tracking-tight leading-none text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Apps / Settings */}
      <div className="w-full pt-2 border-t border-slate-300 dark:border-slate-800 flex flex-col items-center">
        <button
          onClick={() => onSelectView('workflows')}
          className="w-full h-12 flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 cursor-pointer"
          title="Apps & Power Automate"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] leading-none mt-1">Apps</span>
        </button>
      </div>
    </aside>
  );
};

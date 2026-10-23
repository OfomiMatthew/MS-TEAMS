import React, { useState } from 'react';
import { User } from '../../types';
import { Search, Video, Sparkles, Bell, HelpCircle, ChevronDown, Check, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onMeetNow: () => void;
  onOpenMesh: () => void;
  onSearchSelect?: (target: string) => void;
  onUpdateStatus: (status: User['status']) => void;
  onSignInWithGoogle?: () => void;
  onSignOut?: () => void;
  isAnonymous?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onMeetNow,
  onOpenMesh,
  onSearchSelect,
  onUpdateStatus,
  onSignInWithGoogle,
  onSignOut,
  isAnonymous,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const statusColors = {
    available: 'bg-emerald-500',
    busy: 'bg-rose-500',
    dnd: 'bg-rose-600',
    away: 'bg-amber-400',
    offline: 'bg-slate-400',
  };

  const statusLabels = {
    available: 'Available',
    busy: 'Busy',
    dnd: 'Do Not Disturb',
    away: 'Be Right Back',
    offline: 'Appear Offline',
  };

  return (
    <header className="h-12 bg-[#444791] text-white flex items-center justify-between px-3 z-30 shrink-0 select-none shadow-xs">
      {/* Left: Brand & Organization */}
      <div className="flex items-center gap-3 w-64">
        <div className="flex items-center gap-2">
          {/* Microsoft Teams Logo Icon */}
          <div className="w-7 h-7 rounded-md bg-[#5b5fc7] flex items-center justify-center font-bold text-white text-sm shadow-xs border border-white/20">
            T
          </div>
          <span className="font-semibold text-sm tracking-tight text-white hidden sm:inline">
            Microsoft Teams
          </span>
        </div>
        <span className="text-[11px] font-medium text-indigo-200/80 bg-white/10 px-2 py-0.5 rounded">
          Contoso
        </span>
      </div>

      {/* Center: Universal Search Bar & Command Palette */}
      <div className="relative flex-1 max-w-xl mx-4">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-indigo-200 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search or type a command e.g. /copilot, /mesh, /incident"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            className="w-full bg-[#353874] hover:bg-[#2b2e61] focus:bg-white text-white focus:text-slate-900 placeholder:text-indigo-200/70 focus:placeholder:text-slate-400 text-xs rounded-md pl-9 pr-4 py-1.5 focus:outline-none transition-colors"
          />
        </div>

        {/* Command suggestions drop-down */}
        {showSearchDropdown && (
          <div className="absolute top-10 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-2 text-slate-800 dark:text-slate-200 text-xs z-50">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Quick Commands</div>
            <button
              onMouseDown={() => {
                onOpenMesh();
                setSearchQuery('');
              }}
              className="w-full text-left px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>/mesh - Enter 3D Immersive Boardroom</span>
            </button>
            <button
              onMouseDown={() => {
                onMeetNow();
                setSearchQuery('');
              }}
              className="w-full text-left px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center gap-2 cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 text-indigo-600" />
              <span>/meet - Instant video call</span>
            </button>
          </div>
        )}
      </div>

      {/* Right: Quick Meet & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Meet Now Button */}
        <button
          onClick={onMeetNow}
          className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Video className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Meet Now</span>
        </button>

        {/* User Profile Avatar with Status Dot */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-white/40 cursor-pointer"
          >
            <div className="relative">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-2xs"
                style={{ backgroundColor: currentUser.color || '#6264A7' }}
              >
                {currentUser.avatar}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#444791] ${
                  statusColors[currentUser.status]
                }`}
              />
            </div>
          </button>

          {/* Profile Flyout */}
          {showProfileMenu && (
            <div className="absolute top-10 right-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 text-slate-900 dark:text-white z-50">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                  style={{ backgroundColor: currentUser.color || '#6264A7' }}
                >
                  {currentUser.avatar}
                </div>
                <div>
                  <div className="font-bold text-xs">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                    {currentUser.title}
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="mt-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Presence Status</div>
                {(['available', 'busy', 'dnd', 'away'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onUpdateStatus(s);
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-2 py-1.5 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusColors[s]}`} />
                      <span>{statusLabels[s]}</span>
                    </div>
                    {currentUser.status === s && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>

              {/* Sign in with Google / Sign out */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {isAnonymous && onSignInWithGoogle ? (
                  <button
                    onClick={() => {
                      onSignInWithGoogle();
                      setShowProfileMenu(false);
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <span>Sign in with Google</span>
                  </button>
                ) : onSignOut ? (
                  <button
                    onClick={() => {
                      onSignOut();
                      setShowProfileMenu(false);
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs text-center cursor-pointer transition-colors"
                  >
                    Switch Account
                  </button>
                ) : null}
                <div className="text-[11px] text-slate-400 text-center">
                  <span>Cloud Database: Connected</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

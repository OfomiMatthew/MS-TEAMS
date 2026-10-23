import React, { useState } from 'react';
import { MeshScene } from './MeshScene';
import { MeshRoomConfig, User } from '../../types';
import { MESH_ROOM_CONFIG, TEAM_MEMBERS } from '../../data/mockData';
import { Users, Presentation, Radio, Sparkles, Volume2, ArrowLeft, Maximize2 } from 'lucide-react';

interface MeshViewProps {
  currentUser: User;
  onExit?: () => void;
}

export const MeshView: React.FC<MeshViewProps> = ({ currentUser, onExit }) => {
  const [roomConfig, setRoomConfig] = useState<MeshRoomConfig>(MESH_ROOM_CONFIG);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [showRoster, setShowRoster] = useState(false);
  const [audioSpatialZone, setAudioSpatialZone] = useState<'all' | 'table' | 'private'>('table');

  const handleAdvanceSlide = (dir: 1 | -1) => {
    setRoomConfig((prev) => {
      const nextIdx = Math.max(0, Math.min(prev.slides.length - 1, prev.currentSlide + dir));
      return { ...prev, currentSlide: nextIdx };
    });
  };

  const toggleMic = () => {
    setIsMuted((prev) => {
      const next = !prev;
      setIsSpeaking(!next);
      return next;
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Bar inside Mesh Space */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          {onExit && (
            <button
              onClick={onExit}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Teams</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Mesh for Teams
            </span>
            <span className="text-xs bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded-full font-medium">
              Immersive Space 3D
            </span>
          </div>
        </div>

        {/* Spatial audio mode & participant list toggle */}
        <div className="flex items-center gap-2">
          {/* Spatial Audio Zone Selector */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
            <span className="text-slate-400 px-1.5 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              Spatial Audio:
            </span>
            <button
              onClick={() => setAudioSpatialZone('table')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                audioSpatialZone === 'table' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Conference Table
            </button>
            <button
              onClick={() => setAudioSpatialZone('all')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                audioSpatialZone === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Room
            </button>
          </div>

          <button
            onClick={() => setShowRoster(!showRoster)}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showRoster ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">In Room ({TEAM_MEMBERS.length - 1})</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div className="relative flex-1 w-full h-[calc(100%-48px)]">
        <MeshScene
          roomConfig={roomConfig}
          currentUser={currentUser}
          activeParticipants={TEAM_MEMBERS.filter((m) => m.role !== 'bot')}
          isMuted={isMuted}
          isSpeaking={isSpeaking}
          onToggleMic={toggleMic}
          onAdvanceSlide={handleAdvanceSlide}
        />

        {/* Side Roster Flyout */}
        {showRoster && (
          <div className="absolute top-4 right-4 z-30 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Mesh Participants ({TEAM_MEMBERS.length - 1})
              </h3>
              <button
                onClick={() => setShowRoster(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
              {TEAM_MEMBERS.filter((m) => m.role !== 'bot').map((member, i) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/70 border border-slate-700/60"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: member.color || '#6264A7' }}
                    >
                      {member.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                        <span>{member.name}</span>
                        {member.id === currentUser.id && (
                          <span className="text-[10px] text-indigo-300 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-700/50">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{member.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {i === 0 && !isMuted ? (
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    ) : (
                      <span className="text-[10px] text-slate-500">Seat #{i + 1}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              💡 Tip: Click on any empty chair in the 3D room to sit down, or click on the presentation screen to advance slides.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

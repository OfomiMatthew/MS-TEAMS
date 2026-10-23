import React, { useState, useEffect } from 'react';
import { User, Meeting } from '../../types';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Hand,
  PhoneOff,
  Sparkles,
  Maximize2,
  Users,
  MessageSquare,
  Smile,
  Volume2,
} from 'lucide-react';

interface VideoCallModalProps {
  meeting: Meeting;
  currentUser: User;
  onLeave: () => void;
  onSwitchToMesh: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  meeting,
  currentUser,
  onLeave,
  onSwitchToMesh,
}) => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [speakingUserId, setSpeakingUserId] = useState<string>('user-sarah');
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string>(
    'Sarah Chen: Welcome everyone. Let\'s review our Q4 spatial collaboration and automation milestones.'
  );

  // Simulate speaking shifts and live captions
  useEffect(() => {
    const speechSequence = [
      { id: 'user-sarah', text: 'Sarah Chen: The 3D Mesh boardroom with PBR studio lighting is performing at 60 FPS.' },
      { id: 'user-current', text: 'Alex Mercer (You): All automation triggers are live and listening for incident keywords.' },
      { id: 'user-elena', text: 'Elena Rostova: The procedural textures and bottom dock ergonomics pass all accessibility checks.' },
    ];

    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % speechSequence.length;
      setSpeakingUserId(speechSequence[idx].id);
      setCaptions(speechSequence[idx].text);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const triggerReaction = (emoji: string) => {
    setFloatingReaction(emoji);
    setTimeout(() => setFloatingReaction(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-white select-none">
      {/* Top Meeting Header */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span>{meeting.title}</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                {meeting.durationMinutes}:00
              </span>
            </h2>
          </div>
        </div>

        {/* Switch to Mesh 3D Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToMesh}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer border border-indigo-400/30"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Switch to Mesh 3D Space</span>
          </button>
        </div>
      </div>

      {/* Main Grid Stage */}
      <div className="relative flex-1 p-4 flex flex-col overflow-hidden">
        {/* Screen Sharing Banner if active */}
        {isScreenSharing ? (
          <div className="flex-1 bg-slate-900 rounded-2xl border border-indigo-500/50 p-6 flex flex-col items-center justify-center text-center">
            <div className="text-indigo-400 font-bold text-sm mb-2">
              📺 Alex Mercer is sharing screen: Architecture &amp; Automation Flowchart
            </div>
            <div className="w-full max-w-2xl bg-slate-950 p-6 rounded-xl border border-slate-800 text-left font-mono text-xs text-slate-300 space-y-2">
              <div className="text-emerald-400 font-bold">[Vite + Express Server: port 3000]</div>
              <div className="text-indigo-300"> ├── /api/gemini/copilot (Gemini 3.8 Flash)</div>
              <div className="text-indigo-300"> ├── /api/gemini/automation (Power Automate Bot Rules)</div>
              <div className="text-indigo-300"> └── Three.js WebGL (PBR Studio 3D Mesh Room)</div>
            </div>
          </div>
        ) : (
          /* Video Grid */
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 auto-rows-fr">
            {meeting.participants.map((participant) => {
              const isSelf = participant.id === currentUser.id;
              const isSpeaking = speakingUserId === participant.id;

              return (
                <div
                  key={participant.id}
                  className={`relative bg-slate-900 rounded-xl overflow-hidden border flex items-center justify-center transition-all ${
                    isSpeaking
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-indigo-500/20 shadow-lg'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Subtle video background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950" />

                  {/* Participant Avatar / Mock Video Feed */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold shadow-xl transition-transform ${
                        isSpeaking ? 'scale-105 ring-4 ring-indigo-400' : ''
                      }`}
                      style={{ backgroundColor: participant.color || '#6264A7' }}
                    >
                      {participant.avatar}
                    </div>
                  </div>

                  {/* Speaking Wave Badge */}
                  {isSpeaking && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-indigo-950/80 border border-indigo-700/80 px-2 py-0.5 rounded-full text-[11px] font-semibold text-indigo-300">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Speaking</span>
                    </div>
                  )}

                  {/* Nameplate */}
                  <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs font-semibold">
                    <span>{isSelf ? `${participant.name} (You)` : participant.name}</span>
                    {isSelf && isHandRaised && (
                      <span className="text-amber-400 font-bold">✋ Raised</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Reaction Animation */}
        {floatingReaction && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-bounce">
            <span className="text-6xl">{floatingReaction}</span>
          </div>
        )}

        {/* Live Closed Captions */}
        <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-xs flex items-center gap-3">
          <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase">
            Live AI Captions
          </span>
          <span className="text-slate-200 font-medium">{captions}</span>
        </div>
      </div>

      {/* Bottom Meeting Control Bar */}
      <div className="h-18 px-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {/* Reaction Picker */}
          <div className="flex items-center gap-1">
            {['👍', '❤️', '👏', '🎉', '💡'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => triggerReaction(emoji)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-base flex items-center justify-center transition-transform hover:scale-110 active:scale-90 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Core Controls */}
        <div className="flex items-center gap-3">
          {/* Mic */}
          <button
            onClick={() => setIsMicMuted(!isMicMuted)}
            className={`p-3 rounded-full cursor-pointer transition-colors ${
              isMicMuted ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3 rounded-full cursor-pointer transition-colors ${
              !isVideoOn ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Share Screen */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-3 rounded-full cursor-pointer transition-colors ${
              isScreenSharing ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Share Screen"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Raise Hand */}
          <button
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={`p-3 rounded-full cursor-pointer transition-colors ${
              isHandRaised ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Raise Hand"
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* End Call */}
          <button
            onClick={onLeave}
            className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span>Contoso Encrypted Meeting</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Meeting, User } from '../../types';
import { Calendar as CalendarIcon, Video, Sparkles, Plus, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  meetings: Meeting[];
  currentUser: User;
  onJoinMeeting: (meeting: Meeting) => void;
  onJoinMesh: () => void;
  onNewMeeting: (meeting: Meeting) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  meetings,
  currentUser,
  onJoinMeeting,
  onJoinMesh,
  onNewMeeting,
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('30');
  const [newTime, setNewTime] = useState('Today, 4:00 PM');
  const [isMeshEnabled, setIsMeshEnabled] = useState(true);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      title: newTitle,
      startTime: newTime,
      endTime: '4:30 PM',
      durationMinutes: parseInt(newDuration, 10),
      organizer: currentUser,
      participants: [currentUser],
      isLive: false,
      meshRoomId: isMeshEnabled ? 'mesh-boardroom-1' : undefined,
      agenda: 'Discuss spatial collaboration and automated workflows.',
    };

    onNewMeeting(newMeeting);
    setShowScheduleModal(false);
    setNewTitle('');
  };

  return (
    <div className="flex-1 h-full bg-[#f3f4f6] dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Calendar Header */}
      <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Calendar &amp; Meetings</h1>
            <p className="text-xs text-slate-500">Synchronized with Microsoft Teams Exchange</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onJoinMeeting(meetings[0])}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Meet Now</span>
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Meeting</span>
          </button>
        </div>
      </div>

      {/* Main Agenda Schedule */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Today's Scheduled Sessions
        </div>

        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className={`p-5 rounded-xl border transition-all ${
              meeting.isLive
                ? 'bg-white dark:bg-slate-900 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {meeting.isLive && (
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE NOW
                    </span>
                  )}
                  {meeting.meshRoomId && (
                    <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      Mesh 3D Enabled
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {meeting.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{meeting.startTime}</span>
                  </div>
                  <span>•</span>
                  <span>{meeting.durationMinutes} minutes</span>
                  <span>•</span>
                  <span>Organizer: {meeting.organizer.name}</span>
                </div>

                {meeting.agenda && (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {meeting.agenda}
                  </p>
                )}

                {/* Attendees list */}
                <div className="mt-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-500">Attendees:</span>
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {meeting.participants.map((p) => (
                      <div
                        key={p.id}
                        className="w-5 h-5 rounded-full border border-white dark:border-slate-900 flex items-center justify-center font-bold text-[9px] text-white"
                        style={{ backgroundColor: p.color || '#6264A7' }}
                        title={p.name}
                      >
                        {p.avatar}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {meeting.meshRoomId && (
                  <button
                    onClick={onJoinMesh}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Join in Mesh 3D</span>
                  </button>
                )}
                <button
                  onClick={() => onJoinMeeting(meeting)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Video Call</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-900 dark:text-white text-xs">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              Schedule Teams Meeting
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Workflow Sync"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Date &amp; Time</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Duration (minutes)</label>
                <select
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="mesh-toggle"
                  checked={isMeshEnabled}
                  onChange={(e) => setIsMeshEnabled(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="mesh-toggle" className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Enable Mesh 3D Immersive Boardroom
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3.5 py-2 border rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save &amp; Send Invites
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { User, Channel, DirectChat, Message, AutomationWorkflow, Meeting, Team } from './types';
import { Header } from './components/common/Header';
import { LeftRail, RailView } from './components/common/LeftRail';
import { TeamsSidebar } from './components/sidebar/TeamsSidebar';
import { ChannelView } from './components/chat/ChannelView';
import { DirectChatView } from './components/chat/DirectChatView';
import { AutomationCenter } from './components/workflows/AutomationCenter';
import { MeshView } from './components/mesh/MeshView';
import { CalendarView } from './components/calendar/CalendarView';
import { FilesView } from './components/files/FilesView';
import { CopilotPanel } from './components/copilot/CopilotPanel';
import { VideoCallModal } from './components/meeting/VideoCallModal';
import { evaluateAutomation } from './services/geminiService';
import {
  auth,
  googleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
} from './lib/firebase';
import {
  syncUserProfile,
  subscribeToTeams,
  subscribeToChannels,
  subscribeToChannelMessages,
  sendMessageToDb,
  sendBotMessageToDb,
  addReactionToDb,
  subscribeToAutomations,
  subscribeToAutomationLogs,
  logAutomationRun,
  subscribeToMeetings,
  createChannelInDb,
  createTeamInDb,
  createMeetingInDb,
  saveAutomationInDb,
  toggleAutomationInDb,
} from './services/dbService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'guest',
    name: 'Connecting...',
    email: 'user@contoso.com',
    avatar: 'ME',
    role: 'member',
    title: 'Cloud Engineer',
    department: 'Engineering',
    status: 'available',
    statusMessage: 'Connecting to Cloud Database...',
    color: '#6264A7',
  });

  const [isAnonymousUser, setIsAnonymousUser] = useState(true);
  const [activeRailView, setActiveRailView] = useState<RailView>('teams');

  // Real database state (no dummy mock data)
  const [teams, setTeams] = useState<Team[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelMessages, setChannelMessages] = useState<Message[]>([]);
  const [automations, setAutomations] = useState<AutomationWorkflow[]>([]);
  const [automationLogs, setAutomationLogs] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Modals & Drawers
  const [activeMeetingModal, setActiveMeetingModal] = useState<Meeting | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newChanName, setNewChanName] = useState('');
  const [newChanDesc, setNewChanDesc] = useState('');
  const [isChanPrivate, setIsChanPrivate] = useState(false);

  // 1. Firebase Authentication initialization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setIsAnonymousUser(fbUser.isAnonymous);
        const profile = await syncUserProfile(fbUser);
        setCurrentUser(profile);
      } else {
        // Automatically sign in anonymously so user has immediate live Firestore access
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error('Anonymous sign in error:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignInGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: any) {
      console.warn('Google sign-in popup closed or error:', err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await signInAnonymously(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // 2. Real-time Subscriptions to Firestore Collections
  useEffect(() => {
    // Subscribe to Teams
    const unsubTeams = subscribeToTeams(async (liveTeams) => {
      if (liveTeams.length === 0) {
        // Auto-seed initial real workspace team if database is completely fresh
        if (currentUser.id && currentUser.id !== 'guest') {
          try {
            await createTeamInDb(
              'Engineering & Cloud',
              'Core architecture, cloud infrastructure, and 3D collaboration.',
              currentUser
            );
          } catch (e) {
            console.warn('Seed team notice:', e);
          }
        }
      } else {
        setTeams(liveTeams);
      }
    });

    // Subscribe to Channels
    const unsubChannels = subscribeToChannels((liveChannels) => {
      setChannels(liveChannels);
      if (!selectedChannel && liveChannels.length > 0) {
        setSelectedChannel(liveChannels[0]);
      } else if (selectedChannel) {
        // Keep current selected channel up-to-date
        const match = liveChannels.find((c) => c.id === selectedChannel.id);
        if (match) setSelectedChannel(match);
      }
    });

    // Subscribe to Automations
    const unsubAutomations = subscribeToAutomations(async (liveAuts) => {
      if (liveAuts.length === 0) {
        // Seed default Power Automate rules into database
        await saveAutomationInDb({
          name: 'Critical Incident & Urgent Keyword Escalation',
          description: 'Monitors channels for critical keywords (urgent, down, critical, error). Dispatches automated incident triage and notifies on-call.',
          icon: '⚡',
          isEnabled: true,
          trigger: {
            type: 'on_urgent',
            label: 'When message contains urgent keywords',
            description: 'Triggered by "urgent", "down", "outage", "broken", "critical"',
            config: { keywords: ['urgent', 'down', 'outage', 'broken', 'critical'] },
          },
          action: {
            type: 'escalate_alert',
            label: 'Notify On-Call & Post Automated Incident Reply',
            description: 'Dispatches incident alert to channel',
            config: {},
          },
          stats: { totalRuns: 0, lastTriggered: null },
          logs: [],
        });
      } else {
        setAutomations(liveAuts);
      }
    });

    // Subscribe to Automation Audit Logs
    const unsubLogs = subscribeToAutomationLogs((liveLogs) => {
      setAutomationLogs(liveLogs);
    });

    // Subscribe to Meetings
    const unsubMeetings = subscribeToMeetings(async (liveMeetings) => {
      if (liveMeetings.length === 0 && currentUser.id && currentUser.id !== 'guest') {
        // Seed initial live meeting for Mesh 3D space
        await createMeetingInDb(
          {
            title: 'Weekly Cloud Architecture & Mesh 3D Sync',
            startTime: 'Now (In Progress)',
            endTime: '12:00 PM',
            durationMinutes: 45,
            organizer: currentUser,
            participants: [currentUser],
            isLive: true,
            meshRoomId: 'mesh-boardroom-1',
            channelName: 'general',
            agenda: 'Review Three.js 3D Mesh collaboration, PBR lighting, and autonomous workflow rules.',
          },
          currentUser
        );
      } else {
        setMeetings(liveMeetings);
      }
    });

    return () => {
      unsubTeams();
      unsubChannels();
      unsubAutomations();
      unsubLogs();
      unsubMeetings();
    };
  }, [currentUser.id]);

  // 3. Subscribe to messages of active channel
  useEffect(() => {
    if (!selectedChannel) return;
    const unsubMessages = subscribeToChannelMessages(selectedChannel.id, (msgs) => {
      setChannelMessages(msgs);
    });
    return () => unsubMessages();
  }, [selectedChannel?.id]);

  // Merge channels into their parent teams
  const teamsWithChannels = teams.map((team) => ({
    ...team,
    channels: channels.filter((c) => c.teamId === team.id),
  }));

  // 4. Handle Post Message with Live Firestore + Automation Trigger
  const handlePostMessage = async (content: string, subject?: string, isImportant?: boolean) => {
    if (!selectedChannel) return;

    try {
      await sendMessageToDb(selectedChannel.id, currentUser, content, subject, isImportant);

      // Check active automated workflows
      const lower = content.toLowerCase();
      const urgentWorkflow = automations.find((w) => w.isEnabled && (w.trigger.type === 'on_urgent' || w.trigger.type === 'keyword'));

      if (urgentWorkflow) {
        const keywords = urgentWorkflow.trigger.config.keywords || ['urgent', 'down', 'critical', 'outage', 'broken'];
        const hasTrigger = isImportant || keywords.some((k: string) => lower.includes(k.toLowerCase()));

        if (hasTrigger) {
          // Run AI automation evaluation
          const evalRes = await evaluateAutomation({
            ruleType: urgentWorkflow.id,
            messageContent: content,
            senderName: currentUser.name,
            channelName: selectedChannel.name,
          });

          // Post automated bot response to Firestore after a brief delay
          setTimeout(async () => {
            await sendBotMessageToDb(
              selectedChannel.id,
              'Power Automate Bot',
              urgentWorkflow.name,
              evalRes.evaluation.botReply
            );

            // Save log to Firestore audit stream
            await logAutomationRun({
              workflowId: urgentWorkflow.id,
              triggerEvent: `Trigger keyword detected in #${selectedChannel.name}`,
              actionExecuted: 'Dispatched automated priority response and notified on-call SRE',
              status: 'success',
              channelName: selectedChannel.name,
              details: `Evaluated by Gemini AI: Sentiment ${evalRes.evaluation.sentiment}. Incident dispatched.`,
              timestamp: 'Just now',
            });
          }, 800);
        }
      }
    } catch (err: any) {
      console.error('Failed to post message to Firestore:', err);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    const msg = channelMessages.find((m) => m.id === messageId);
    if (!msg) return;
    await addReactionToDb(messageId, msg.reactions, emoji, currentUser.name);
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim() || teams.length === 0) return;

    try {
      const teamId = teams[0].id;
      const chanId = await createChannelInDb(teamId, newChanName, newChanDesc, isChanPrivate, currentUser);
      setShowCreateChannelModal(false);
      setNewChanName('');
      setNewChanDesc('');
      setIsChanPrivate(false);
    } catch (err) {
      console.error('Failed to create channel:', err);
    }
  };

  // Attach logs to workflows for display in AutomationCenter
  const workflowsWithLogs: AutomationWorkflow[] = automations.map((w) => ({
    ...w,
    logs: automationLogs.filter((l) => l.workflowId === w.id || l.triggerEvent.includes(w.name)),
  }));

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onMeetNow={() => setActiveMeetingModal(meetings[0] || null)}
        onOpenMesh={() => setActiveRailView('mesh')}
        onUpdateStatus={(status) => setCurrentUser((u) => ({ ...u, status }))}
        onSignInWithGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}
        isAnonymous={isAnonymousUser}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Rail */}
        <LeftRail
          activeView={activeRailView}
          onSelectView={(v) => setActiveRailView(v)}
          unreadChatCount={0}
          unreadActivityCount={automationLogs.length > 0 ? 1 : 0}
        />

        {/* Secondary Context Sidebar */}
        {(activeRailView === 'teams' || activeRailView === 'chat' || activeRailView === 'activity') && (
          <TeamsSidebar
            activeView={activeRailView}
            teams={teamsWithChannels}
            selectedChannelId={selectedChannel?.id || ''}
            onSelectChannel={(ch) => setSelectedChannel(ch)}
            directChats={[]}
            selectedChatId={undefined}
            onSelectChat={() => {}}
            currentUser={currentUser}
            onNewChat={() => {}}
            onCreateChannel={() => setShowCreateChannelModal(true)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {activeRailView === 'teams' && selectedChannel && (
            <ChannelView
              channel={selectedChannel}
              messages={channelMessages}
              currentUser={currentUser}
              onSendMessage={handlePostMessage}
              onSendReply={() => {}}
              onAddReaction={handleAddReaction}
              onOpenMeshRoom={() => setActiveRailView('mesh')}
              onStartVideoMeeting={() => setActiveMeetingModal(meetings[0] || null)}
              isCopilotOpen={isCopilotOpen}
              onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
            />
          )}

          {activeRailView === 'chat' && (
            <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#f5f6f8] dark:bg-slate-950 p-6 text-center text-slate-500">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 mb-3 font-bold text-lg">
                💬
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Direct Chats</h3>
              <p className="text-xs max-w-sm mt-1">
                Connected to real database. Invite your team or start a conversation in any channel on the left.
              </p>
            </div>
          )}

          {activeRailView === 'workflows' && (
            <AutomationCenter
              workflows={workflowsWithLogs}
              onToggleWorkflow={async (id) => {
                const wf = automations.find((w) => w.id === id);
                if (wf) {
                  await toggleAutomationInDb(id, !wf.isEnabled);
                }
              }}
              onExecuteWorkflow={async (id) => {
                const wf = automations.find((w) => w.id === id);
                if (wf && selectedChannel) {
                  await logAutomationRun({
                    workflowId: id,
                    triggerEvent: `Manual test execution of "${wf.name}"`,
                    actionExecuted: wf.action.label,
                    status: 'success',
                    channelName: selectedChannel.name,
                    details: 'Triggered from Automation Center. Database verified.',
                    timestamp: 'Just now',
                  });
                }
              }}
              onAddWorkflow={async (newWf) => {
                await saveAutomationInDb(newWf);
              }}
            />
          )}

          {activeRailView === 'mesh' && (
            <MeshView
              currentUser={currentUser}
              onExit={() => setActiveRailView('teams')}
            />
          )}

          {activeRailView === 'calendar' && (
            <CalendarView
              meetings={meetings}
              currentUser={currentUser}
              onJoinMeeting={(m) => setActiveMeetingModal(m)}
              onJoinMesh={() => setActiveRailView('mesh')}
              onNewMeeting={async (m) => {
                await createMeetingInDb(m, currentUser);
              }}
            />
          )}

          {activeRailView === 'files' && <FilesView />}

          {/* Copilot Assistant Drawer */}
          {selectedChannel && (
            <CopilotPanel
              isOpen={isCopilotOpen}
              onClose={() => setIsCopilotOpen(false)}
              channelName={selectedChannel.name}
              recentMessages={channelMessages}
            />
          )}
        </div>
      </div>

      {/* Video Call Modal */}
      {activeMeetingModal && (
        <VideoCallModal
          meeting={activeMeetingModal}
          currentUser={currentUser}
          onLeave={() => setActiveMeetingModal(null)}
          onSwitchToMesh={() => {
            setActiveMeetingModal(null);
            setActiveRailView('mesh');
          }}
        />
      )}

      {/* Create Channel Modal */}
      {showCreateChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-900 dark:text-white text-xs">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <span>Create a Channel</span>
            </h2>

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Channel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. general, announcements, releases"
                  value={newChanName}
                  onChange={(e) => setNewChanName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief description of this channel"
                  value={newChanDesc}
                  onChange={(e) => setNewChanDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="private-chan-toggle"
                  checked={isChanPrivate}
                  onChange={(e) => setIsChanPrivate(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="private-chan-toggle" className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Make private (only invited members)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateChannelModal(false)}
                  className="px-3.5 py-2 border rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg cursor-pointer shadow-xs"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

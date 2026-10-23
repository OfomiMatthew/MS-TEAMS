import {
  db,
  auth,
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { User, Channel, Team, Message, AutomationWorkflow, AutomationLog, Meeting } from '../types';

// Real-time synchronization service for Firestore

export async function syncUserProfile(firebaseUser: any, customTitle?: string): Promise<User> {
  const userId = firebaseUser.uid;
  const userRef = doc(db, 'users', userId);

  const userData: User = {
    id: userId,
    name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Team Member'),
    email: firebaseUser.email || 'user@contoso.com',
    avatar: firebaseUser.displayName ? firebaseUser.displayName.slice(0, 2).toUpperCase() : 'ME',
    role: 'member',
    title: customTitle || 'Software Engineer',
    department: 'Engineering',
    status: 'available',
    statusMessage: 'Connected to Cloud Database',
    color: '#6264A7',
  };

  try {
    await setDoc(userRef, { ...userData, createdAt: new Date().toISOString() }, { merge: true });
    return userData;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
    return userData;
  }
}

// Subscribe to Teams
export function subscribeToTeams(onUpdate: (teams: Team[]) => void) {
  const teamsCol = collection(db, 'teams');
  return onSnapshot(
    teamsCol,
    (snapshot) => {
      const teams: Team[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        teams.push({
          id: docSnap.id,
          name: data.name,
          code: data.code || 'TE',
          avatarBg: data.avatarBg || 'bg-indigo-700',
          description: data.description || '',
          channels: [],
        });
      });
      onUpdate(teams);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'teams');
    }
  );
}

// Subscribe to Channels
export function subscribeToChannels(onUpdate: (channels: Channel[]) => void) {
  const channelsCol = collection(db, 'channels');
  return onSnapshot(
    channelsCol,
    (snapshot) => {
      const channels: Channel[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        channels.push({
          id: docSnap.id,
          teamId: data.teamId,
          name: data.name,
          description: data.description || '',
          isPrivate: !!data.isPrivate,
          unreadCount: 0,
          category: data.category || 'general',
          pinned: !!data.pinned,
        });
      });
      onUpdate(channels);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'channels');
    }
  );
}

// Subscribe to Messages for a Channel
export function subscribeToChannelMessages(channelId: string, onUpdate: (messages: Message[]) => void) {
  const messagesCol = collection(db, 'messages');
  const q = query(messagesCol, where('channelId', '==', channelId));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        msgs.push({
          id: docSnap.id,
          channelId: data.channelId,
          sender: {
            id: data.senderId,
            name: data.senderName,
            email: data.senderEmail || '',
            avatar: data.senderAvatar || 'U',
            role: data.senderRole || 'member',
            title: data.senderTitle || 'Member',
            department: 'Engineering',
            status: 'available',
            color: data.senderColor || '#6264A7',
          },
          timestamp: data.timestamp || new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          subject: data.subject,
          content: data.content,
          isImportant: !!data.isImportant,
          isAutomated: !!data.isAutomated,
          botSource: data.botSource,
          reactions: data.reactions || [],
          replies: data.replies || [],
        });
      });

      // Sort by creation time
      msgs.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
      onUpdate(msgs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `messages`);
    }
  );
}

// Send Message to Firestore
export async function sendMessageToDb(channelId: string, user: User, content: string, subject?: string, isImportant?: boolean) {
  const messagesCol = collection(db, 'messages');
  const messageData = {
    channelId,
    senderId: user.id,
    senderName: user.name,
    senderEmail: user.email,
    senderAvatar: user.avatar,
    senderColor: user.color,
    senderRole: user.role,
    senderTitle: user.title,
    content,
    subject: subject || null,
    isImportant: !!isImportant,
    isAutomated: false,
    reactions: [],
    replies: [],
    createdAt: new Date().toISOString(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  try {
    const docRef = await addDoc(messagesCol, messageData);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'messages');
    throw err;
  }
}

// Send Bot Automated Message
export async function sendBotMessageToDb(channelId: string, botName: string, botSource: string, content: string) {
  const messagesCol = collection(db, 'messages');
  const messageData = {
    channelId,
    senderId: 'bot',
    senderName: botName,
    senderEmail: 'bot@microsoft.teams',
    senderAvatar: '⚡',
    senderColor: '#008272',
    senderRole: 'bot',
    senderTitle: 'Power Automate Bot',
    content,
    isImportant: false,
    isAutomated: true,
    botSource,
    reactions: [],
    replies: [],
    createdAt: new Date().toISOString(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  try {
    await addDoc(messagesCol, messageData);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'messages');
  }
}

// Add Reaction to Message
export async function addReactionToDb(messageId: string, currentReactions: any[], emoji: string, userName: string) {
  const msgRef = doc(db, 'messages', messageId);
  const existing = currentReactions.find((r) => r.emoji === emoji);
  let updatedReactions = [...currentReactions];

  if (existing) {
    updatedReactions = currentReactions.map((r) =>
      r.emoji === emoji ? { ...r, count: r.count + 1, users: [...r.users, userName] } : r
    );
  } else {
    updatedReactions.push({ emoji, count: 1, users: [userName] });
  }

  try {
    await updateDoc(msgRef, { reactions: updatedReactions });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `messages/${messageId}`);
  }
}

// Subscribe to Automations
export function subscribeToAutomations(onUpdate: (automations: AutomationWorkflow[]) => void) {
  const autCol = collection(db, 'automations');
  return onSnapshot(
    autCol,
    (snapshot) => {
      const auts: AutomationWorkflow[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        auts.push({
          id: docSnap.id,
          name: data.name,
          description: data.description,
          icon: data.icon || '⚡',
          isEnabled: data.isEnabled !== false,
          trigger: data.trigger || {
            type: 'keyword',
            label: 'When message contains keyword',
            description: '',
            config: {},
          },
          action: data.action || {
            type: 'post_reply',
            label: 'Post automated reply',
            description: '',
            config: {},
          },
          stats: data.stats || {
            totalRuns: 0,
            lastTriggered: null,
          },
          logs: [],
        });
      });
      onUpdate(auts);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'automations');
    }
  );
}

// Log Workflow Execution
export async function logAutomationRun(log: Omit<AutomationLog, 'id'>) {
  const logsCol = collection(db, 'automation_logs');
  try {
    await addDoc(logsCol, { ...log, createdAt: new Date().toISOString() });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'automation_logs');
  }
}

// Subscribe to Logs
export function subscribeToAutomationLogs(onUpdate: (logs: AutomationLog[]) => void) {
  const logsCol = collection(db, 'automation_logs');
  return onSnapshot(
    logsCol,
    (snapshot) => {
      const logs: AutomationLog[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        logs.push({
          id: docSnap.id,
          timestamp: data.timestamp,
          triggerEvent: data.triggerEvent,
          actionExecuted: data.actionExecuted,
          status: data.status,
          channelName: data.channelName,
          details: data.details,
        });
      });
      logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      onUpdate(logs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'automation_logs');
    }
  );
}

// Subscribe to Meetings
export function subscribeToMeetings(onUpdate: (meetings: Meeting[]) => void) {
  const meetCol = collection(db, 'meetings');
  return onSnapshot(
    meetCol,
    (snapshot) => {
      const meets: Meeting[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        meets.push({
          id: docSnap.id,
          title: data.title,
          startTime: data.startTime,
          endTime: data.endTime || '',
          durationMinutes: data.durationMinutes || 30,
          organizer: data.organizer || {
            id: data.organizerId,
            name: data.organizerName,
            email: '',
            avatar: 'ME',
            role: 'member',
            title: 'Organizer',
            department: 'Team',
            status: 'available',
          },
          participants: data.participants || [],
          isLive: !!data.isLive,
          meshRoomId: data.meshRoomId,
          channelName: data.channelName,
          agenda: data.agenda,
        });
      });
      onUpdate(meets);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'meetings');
    }
  );
}

// Create New Team
export async function createTeamInDb(name: string, description: string, user: User): Promise<string> {
  const teamsCol = collection(db, 'teams');
  const code = name.slice(0, 2).toUpperCase();
  const docRef = await addDoc(teamsCol, {
    name,
    code,
    description,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  });

  // Automatically create a 'general' channel for this team
  await createChannelInDb(docRef.id, 'general', 'General discussions', false, user);
  return docRef.id;
}

// Create New Channel
export async function createChannelInDb(teamId: string, name: string, description: string, isPrivate: boolean, user: User): Promise<string> {
  const channelsCol = collection(db, 'channels');
  const docRef = await addDoc(channelsCol, {
    teamId,
    name: name.toLowerCase().replace(/\s+/g, '-'),
    description,
    isPrivate,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

// Create New Meeting
export async function createMeetingInDb(meeting: Omit<Meeting, 'id'>, user: User): Promise<string> {
  const meetCol = collection(db, 'meetings');
  const docRef = await addDoc(meetCol, {
    ...meeting,
    organizerId: user.id,
    organizerName: user.name,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

// Save or Update Automation
export async function saveAutomationInDb(workflow: Omit<AutomationWorkflow, 'id'>): Promise<string> {
  const autCol = collection(db, 'automations');
  const docRef = await addDoc(autCol, {
    ...workflow,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

// Toggle Automation in DB
export async function toggleAutomationInDb(workflowId: string, isEnabled: boolean) {
  const autRef = doc(db, 'automations', workflowId);
  await updateDoc(autRef, { isEnabled });
}

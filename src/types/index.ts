export type UserStatus = 'available' | 'busy' | 'dnd' | 'away' | 'offline';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'member' | 'guest' | 'bot';
  title: string;
  department: string;
  status: UserStatus;
  statusMessage?: string;
  color?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs or names
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'doc' | 'pdf' | 'image' | 'code' | 'sheet';
  url?: string;
}

export interface Message {
  id: string;
  channelId?: string;
  chatId?: string;
  sender: User;
  timestamp: string;
  content: string;
  subject?: string;
  isImportant?: boolean;
  isAutomated?: boolean;
  botSource?: string;
  attachments?: Attachment[];
  reactions: Reaction[];
  replies?: Message[];
}

export interface Channel {
  id: string;
  teamId: string;
  name: string;
  description: string;
  isPrivate: boolean;
  unreadCount: number;
  category: 'general' | 'incident' | 'ai' | 'dev' | 'design';
  pinned?: boolean;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  avatarBg: string;
  description: string;
  channels: Channel[];
}

export interface DirectChat {
  id: string;
  participantIds: string[];
  participants: User[];
  lastMessage?: {
    text: string;
    timestamp: string;
    senderName: string;
  };
  unreadCount: number;
  isGroup?: boolean;
  groupName?: string;
}

export interface AutomationTrigger {
  type: 'keyword' | 'on_message' | 'scheduled' | 'on_urgent';
  label: string;
  description: string;
  config: {
    keywords?: string[];
    channelId?: string;
    cronExpression?: string;
  };
}

export interface AutomationAction {
  type: 'post_reply' | 'escalate_alert' | 'ai_summary' | 'assign_task';
  label: string;
  description: string;
  config: {
    replyTemplate?: string;
    targetChannel?: string;
    notifyUser?: string;
  };
}

export interface AutomationLog {
  id: string;
  workflowId?: string;
  timestamp: string;
  triggerEvent: string;
  actionExecuted: string;
  status: 'success' | 'warning' | 'failed';
  channelName: string;
  details: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  trigger: AutomationTrigger;
  action: AutomationAction;
  stats: {
    totalRuns: number;
    lastTriggered: string | null;
  };
  logs: AutomationLog[];
}

export interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  organizer: User;
  participants: User[];
  isLive: boolean;
  meshRoomId?: string;
  channelName?: string;
  agenda?: string;
}

export interface MeshAvatarPosition {
  userId: string;
  userName: string;
  userTitle: string;
  userColor: string;
  position: [number, number, number];
  rotation: number;
  isSpeaking: boolean;
  isMuted: boolean;
  currentReaction?: string;
  chairIndex: number;
}

export interface MeshRoomConfig {
  id: string;
  name: string;
  theme: 'boardroom' | 'auditorium' | 'skyline_lounge';
  capacity: number;
  currentSlide: number;
  slides: {
    title: string;
    subtitle: string;
    bullets: string[];
    metric?: { label: string; value: string };
  }[];
}

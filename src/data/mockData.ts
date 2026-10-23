import { User, Team, DirectChat, Message, AutomationWorkflow, Meeting, MeshRoomConfig } from '../types';

export const CURRENT_USER: User = {
  id: 'user-current',
  name: 'Alex Mercer',
  email: 'alex.mercer@contoso.com',
  avatar: 'AM',
  role: 'admin',
  title: 'Principal Cloud & AI Architect',
  department: 'Platform Engineering',
  status: 'available',
  statusMessage: 'Working on Mesh 3D & AI automation pipelines 🚀',
  color: '#6264A7',
};

export const TEAM_MEMBERS: User[] = [
  CURRENT_USER,
  {
    id: 'user-sarah',
    name: 'Sarah Chen',
    email: 'sarah.chen@contoso.com',
    avatar: 'SC',
    role: 'member',
    title: 'VP of Product Experience',
    department: 'Product Management',
    status: 'busy',
    statusMessage: 'In executive review meetings',
    color: '#0078D4',
  },
  {
    id: 'user-marcus',
    name: 'Marcus Brody',
    email: 'marcus.brody@contoso.com',
    avatar: 'MB',
    role: 'member',
    title: 'Staff Reliability Engineer',
    department: 'Infrastructure & SRE',
    status: 'available',
    statusMessage: 'Monitoring production cluster health 📊',
    color: '#107C41',
  },
  {
    id: 'user-elena',
    name: 'Elena Rostova',
    email: 'elena.rostova@contoso.com',
    avatar: 'ER',
    role: 'member',
    title: 'Design Director - Immersive Tech',
    department: 'Design Systems',
    status: 'dnd',
    statusMessage: 'Deep focus: 3D spatial materials',
    color: '#D83B01',
  },
  {
    id: 'user-david',
    name: 'David Kim',
    email: 'david.kim@contoso.com',
    avatar: 'DK',
    role: 'member',
    title: 'Senior Full Stack Engineer',
    department: 'Platform Engineering',
    status: 'away',
    statusMessage: 'Be right back (lunch)',
    color: '#8764B8',
  },
  {
    id: 'user-bot-automate',
    name: 'Power Automate Bot',
    email: 'flow-bot@contoso.internal',
    avatar: '⚡',
    role: 'bot',
    title: 'Automated Workflow Engine',
    department: 'Automation Services',
    status: 'available',
    statusMessage: 'Active & executing 4 automated rules',
    color: '#008272',
  },
  {
    id: 'user-bot-copilot',
    name: 'Copilot AI',
    email: 'copilot@microsoft.com',
    avatar: '✨',
    role: 'bot',
    title: 'Enterprise AI Assistant',
    department: 'Microsoft AI',
    status: 'available',
    statusMessage: 'Ready to summarize, draft & analyze',
    color: '#4F52B2',
  },
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-apollo',
    name: 'Apollo Cloud & AI Engineering',
    code: 'AC',
    avatarBg: 'bg-indigo-700',
    description: 'Core platform infrastructure, agent architectures, and autonomous workflows.',
    channels: [
      {
        id: 'chan-general',
        teamId: 'team-apollo',
        name: 'general',
        description: 'General announcements and team coordination',
        isPrivate: false,
        unreadCount: 0,
        category: 'general',
        pinned: true,
      },
      {
        id: 'chan-architecture',
        teamId: 'team-apollo',
        name: 'architecture-sync',
        description: 'System design, Three.js graphics pipeline & cloud reliability',
        isPrivate: false,
        unreadCount: 2,
        category: 'dev',
        pinned: true,
      },
      {
        id: 'chan-incident',
        teamId: 'team-apollo',
        name: 'incident-response',
        description: 'Monitored by automated escalation bots ⚡',
        isPrivate: false,
        unreadCount: 1,
        category: 'incident',
      },
      {
        id: 'chan-copilot',
        teamId: 'team-apollo',
        name: 'copilot-experiments',
        description: 'Testing Gemini 3.8 flash models and prompt automation',
        isPrivate: false,
        unreadCount: 0,
        category: 'ai',
      },
    ],
  },
  {
    id: 'team-design',
    name: 'Design Systems & Mesh 3D',
    code: 'DS',
    avatarBg: 'bg-purple-700',
    description: 'Immersive spaces, procedural 3D environments, and Microsoft Fluent design.',
    channels: [
      {
        id: 'chan-mesh-spaces',
        teamId: 'team-design',
        name: 'mesh-virtual-spaces',
        description: 'Virtual boardrooms, avatar lighting, and spatial audio',
        isPrivate: false,
        unreadCount: 0,
        category: 'design',
        pinned: true,
      },
      {
        id: 'chan-critique',
        teamId: 'team-design',
        name: 'design-critique',
        description: 'Weekly reviews of UI components and interactions',
        isPrivate: false,
        unreadCount: 0,
        category: 'design',
      },
    ],
  },
  {
    id: 'team-leadership',
    name: 'Executive Strategy & Ops',
    code: 'ES',
    avatarBg: 'bg-blue-800',
    description: 'Company-wide quarterly targets and executive briefings.',
    channels: [
      {
        id: 'chan-strategy',
        teamId: 'team-leadership',
        name: 'q4-strategy',
        description: 'Strategic initiatives and organizational alignment',
        isPrivate: true,
        unreadCount: 0,
        category: 'general',
      },
    ],
  },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  'chan-general': [
    {
      id: 'msg-1',
      channelId: 'chan-general',
      sender: TEAM_MEMBERS[1], // Sarah Chen
      timestamp: 'Today at 09:15 AM',
      subject: '🚀 Welcome to the new Microsoft Teams with Mesh 3D & AI Automation',
      content: `Good morning team! We've completed the rollout of our **Immersive Mesh 3D Spaces** and the new **Power Automate workflow engine**. 

Key highlights available now:
- **Mesh 3D Boardroom**: Click the *Mesh 3D* tab in the left rail or use *Meet Now* to step into our procedural executive meeting space.
- **AI Copilot**: Ask Copilot to summarize this channel, draft action items, or rephrase messages with one click.
- **Automated Workflows**: Production alerts containing keywords like \`urgent\` or \`down\` now trigger instantaneous incident triage and bot notifications.

Let's test out the features in today's demo meeting at 11:00 AM!`,
      reactions: [
        { emoji: '👍', count: 5, users: ['Alex Mercer', 'Marcus Brody', 'Elena Rostova', 'David Kim'] },
        { emoji: '🚀', count: 4, users: ['Alex Mercer', 'David Kim', 'Elena Rostova'] },
        { emoji: '❤️', count: 3, users: ['Elena Rostova', 'Marcus Brody'] },
      ],
      replies: [
        {
          id: 'reply-1',
          channelId: 'chan-general',
          sender: CURRENT_USER,
          timestamp: 'Today at 09:22 AM',
          content: 'Fantastic work everyone! The Three.js PBR lighting and procedural avatars in the Mesh room look remarkably realistic.',
          reactions: [{ emoji: '👏', count: 3, users: ['Sarah Chen', 'Elena Rostova'] }],
        },
        {
          id: 'reply-2',
          channelId: 'chan-general',
          sender: TEAM_MEMBERS[3], // Elena Rostova
          timestamp: 'Today at 09:30 AM',
          content: 'I loaded the new Q4 presentation deck onto the virtual screen in the Mesh 3D room. You can cycle the slides directly in 3D during our sync!',
          reactions: [{ emoji: '🎉', count: 2, users: ['Sarah Chen', 'Alex Mercer'] }],
        },
      ],
    },
    {
      id: 'msg-2',
      channelId: 'chan-general',
      sender: TEAM_MEMBERS[2], // Marcus Brody
      timestamp: 'Today at 10:05 AM',
      content: 'Quick note on infrastructure: All Kubernetes nodes are running at < 35% CPU utilization. The automated scale-to-zero routines are performing within SLA.',
      reactions: [{ emoji: '📊', count: 2, users: ['Alex Mercer', 'Sarah Chen'] }],
    },
  ],
  'chan-architecture': [
    {
      id: 'msg-arch-1',
      channelId: 'chan-architecture',
      sender: CURRENT_USER,
      timestamp: 'Today at 08:45 AM',
      subject: 'Three.js PBR Rendering & Studio Pipeline Architecture',
      content: `Here is the architectural specification for our Mesh 3D scenes:
1. **Procedural Geometry**: 3-12 component procedural models for all furniture and architectural elements (no single default primitives).
2. **Lighting**: ACESFilmicToneMapping with RoomEnvironment via PMREMGenerator for realistic metalness/roughness reflections.
3. **Pacing**: Software-WebGL guard detection with damped camera movement.
4. **Ergonomic HUD**: Collapsible bottom dock occupying <= 15% viewport footprint with zero backdrop-filter over WebGL.

\`\`\`typescript
// Studio environment reflection initialization
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
pmremGenerator.dispose();
\`\`\``,
      reactions: [
        { emoji: '💡', count: 4, users: ['David Kim', 'Elena Rostova', 'Marcus Brody'] },
        { emoji: '👏', count: 3, users: ['Sarah Chen', 'Elena Rostova'] },
      ],
    },
    {
      id: 'msg-arch-2',
      channelId: 'chan-architecture',
      sender: TEAM_MEMBERS[3], // Elena Rostova
      timestamp: 'Today at 09:40 AM',
      content: 'I verified the raycasting layer separation. Clicking empty seats now glides the user camera to the executive chairs without any stutter. Ready for production.',
      reactions: [{ emoji: '👍', count: 3, users: ['Alex Mercer', 'Marcus Brody'] }],
    },
  ],
  'chan-incident': [
    {
      id: 'msg-inc-1',
      channelId: 'chan-incident',
      sender: TEAM_MEMBERS[2], // Marcus Brody
      timestamp: 'Yesterday at 04:30 PM',
      subject: 'Resolved: Database read replica failover test',
      content: 'Completed scheduled chaos drill on secondary PostgreSQL cluster. Replica seamlessly promoted in 1.4 seconds. Incident ticket #INC-3891 closed.',
      reactions: [{ emoji: '✅', count: 4, users: ['Alex Mercer', 'Sarah Chen', 'David Kim'] }],
    },
    {
      id: 'msg-inc-2',
      channelId: 'chan-incident',
      sender: TEAM_MEMBERS[5], // Power Automate Bot
      timestamp: 'Yesterday at 04:31 PM',
      isAutomated: true,
      botSource: 'Power Automate: Chaos Drill Logger',
      content: `⚡ **Automated Workflow Run**: Chaos drill metrics logged to Azure Monitor. Uptime maintained: 100%. Ticket #INC-3891 archived.`,
      reactions: [{ emoji: '🤖', count: 3, users: ['Marcus Brody', 'Alex Mercer'] }],
    },
  ],
  'chan-copilot': [
    {
      id: 'msg-copilot-1',
      channelId: 'chan-copilot',
      sender: CURRENT_USER,
      timestamp: 'Today at 07:50 AM',
      subject: 'Gemini 3.8 Flash Enterprise Integration',
      content: `We connected our server-side API proxy to \`gemini-3.8-flash\` using \`@google/genai\`.
It handles:
- Channel conversation summarization
- Action item extraction with assignee suggestions
- Tone adjustments (Professional, Concise, Casual)
- Automated incident classification and bot replies

Try asking Copilot questions in the drawer on the right!`,
      reactions: [
        { emoji: '🚀', count: 4, users: ['Sarah Chen', 'David Kim', 'Elena Rostova'] },
        { emoji: '✨', count: 3, users: ['Sarah Chen', 'Elena Rostova'] },
      ],
    },
  ],
  'chan-mesh-spaces': [
    {
      id: 'msg-mesh-1',
      channelId: 'chan-mesh-spaces',
      sender: TEAM_MEMBERS[3], // Elena Rostova
      timestamp: 'Today at 10:12 AM',
      subject: 'Mesh 3D Boardroom Features & Avatar Reactions',
      content: `The 3D Mesh room now supports:
- Interactive Screen: Walk up or click to advance presentation slides
- Spatial Audio Aura: Visual glow around avatars when speaking
- 3D Emoji Particle Bursts: Send claps, hearts, or rocket reactions in the 3D space
- Chair Navigation: Click any empty conference chair to sit down
- Zen Cinema Mode: Press 'H' or click Hide Controls for clean full-bleed view.`,
      reactions: [
        { emoji: '❤️', count: 5, users: ['Alex Mercer', 'Sarah Chen', 'Marcus Brody', 'David Kim'] },
        { emoji: '🎉', count: 4, users: ['Alex Mercer', 'David Kim'] },
      ],
    },
  ],
};

export const INITIAL_DIRECT_CHATS: DirectChat[] = [
  {
    id: 'chat-sarah',
    participantIds: ['user-current', 'user-sarah'],
    participants: [CURRENT_USER, TEAM_MEMBERS[1]],
    lastMessage: {
      text: "See you in the Mesh 3D meeting room for the Q4 demo!",
      timestamp: '10:45 AM',
      senderName: 'Sarah Chen',
    },
    unreadCount: 1,
  },
  {
    id: 'chat-marcus',
    participantIds: ['user-current', 'user-marcus'],
    participants: [CURRENT_USER, TEAM_MEMBERS[2]],
    lastMessage: {
      text: "The automation rule for urgent keywords passed all test cases.",
      timestamp: '09:55 AM',
      senderName: 'Marcus Brody',
    },
    unreadCount: 0,
  },
  {
    id: 'chat-elena',
    participantIds: ['user-current', 'user-elena'],
    participants: [CURRENT_USER, TEAM_MEMBERS[3]],
    lastMessage: {
      text: "Uploaded the revised presentation slide textures for the 3D screen.",
      timestamp: '09:20 AM',
      senderName: 'Elena Rostova',
    },
    unreadCount: 0,
  },
  {
    id: 'chat-pod',
    participantIds: ['user-current', 'user-sarah', 'user-elena', 'user-marcus'],
    participants: [CURRENT_USER, TEAM_MEMBERS[1], TEAM_MEMBERS[3], TEAM_MEMBERS[2]],
    isGroup: true,
    groupName: 'Q4 Mesh Launch Pod',
    lastMessage: {
      text: "Elena: Deck is finalized and pre-loaded onto the Mesh screen.",
      timestamp: '08:15 AM',
      senderName: 'Elena Rostova',
    },
    unreadCount: 0,
  },
];

export const INITIAL_AUTOMATIONS: AutomationWorkflow[] = [
  {
    id: 'wf-urgent-escalation',
    name: 'Critical Incident & Urgent Keyword Escalation',
    description: 'Scans all messages for critical indicators (urgent, down, critical, error). Instantly dispatches a priority alert bot reply and registers an incident log.',
    icon: '⚡',
    isEnabled: true,
    trigger: {
      type: 'on_urgent',
      label: 'When message contains urgent keywords',
      description: 'Triggered by "urgent", "down", "outage", "broken", "critical"',
      config: {
        keywords: ['urgent', 'down', 'outage', 'broken', 'critical', 'fatal'],
      },
    },
    action: {
      type: 'escalate_alert',
      label: 'Notify On-Call & Post Automated Incident Reply',
      description: 'Posts a formatted incident response message in the channel and notifies on-call engineer.',
      config: {
        replyTemplate: '⚡ Automated Incident Triage: Alert detected and dispatched to on-call engineers.',
        notifyUser: 'Marcus Brody (SRE)',
      },
    },
    stats: {
      totalRuns: 28,
      lastTriggered: '10 minutes ago',
    },
    logs: [
      {
        id: 'log-1',
        timestamp: '10 minutes ago',
        triggerEvent: 'Keyword "urgent" detected in #general',
        actionExecuted: 'Dispatched automated incident reply & tagged Marcus Brody',
        status: 'success',
        channelName: 'general',
        details: 'Evaluated by Gemini AI: Sentiment Negative, Severity High, Incident #INC-4092 created.',
      },
      {
        id: 'log-2',
        timestamp: 'Yesterday at 3:15 PM',
        triggerEvent: 'Keyword "down" detected in #incident-response',
        actionExecuted: 'Auto-responded with health status link',
        status: 'success',
        channelName: 'incident-response',
        details: 'Evaluated by Gemini AI: Severity Medium, health check verified replica status.',
      },
    ],
  },
  {
    id: 'wf-daily-standup',
    name: 'Daily Standup AI Digest Generator',
    description: 'Uses Gemini 3.8 to synthesize team posts into a structured daily standup report with blockers and priorities.',
    icon: '📋',
    isEnabled: true,
    trigger: {
      type: 'scheduled',
      label: 'Scheduled Daily at 09:00 AM',
      description: 'Cron schedule (0 9 * * 1-5) or manual on-demand execution',
      config: {
        cronExpression: '0 9 * * 1-5',
      },
    },
    action: {
      type: 'ai_summary',
      label: 'Generate & Post AI Executive Standup',
      description: 'Calls Gemini AI to summarize yesterday\'s conversations into bulleted milestones.',
      config: {
        targetChannel: 'general',
      },
    },
    stats: {
      totalRuns: 64,
      lastTriggered: 'Today at 09:00 AM',
    },
    logs: [
      {
        id: 'log-standup-1',
        timestamp: 'Today at 09:00 AM',
        triggerEvent: 'Cron trigger fired (0 9 * * 1-5)',
        actionExecuted: 'Generated AI Standup Summary for #general',
        status: 'success',
        channelName: 'general',
        details: 'Synthesized 18 messages across 3 channels. Identified 4 key deliverables.',
      },
    ],
  },
  {
    id: 'wf-mesh-meeting-reserve',
    name: 'Mesh 3D Room Auto-Prep & Agenda Sync',
    description: 'When a meeting is scheduled with Immersive Space enabled, automatically initializes the 3D room, configures presentation slides, and seats attendees.',
    icon: '🌐',
    isEnabled: true,
    trigger: {
      type: 'on_message',
      label: 'When meeting is scheduled in Mesh 3D',
      description: 'Triggered when a calendar sync or #mesh-virtual-spaces meeting is declared',
      config: {
        channelId: 'chan-mesh-spaces',
      },
    },
    action: {
      type: 'post_reply',
      label: 'Synchronize 3D Presentation Deck & Virtual Stage',
      description: 'Pre-loads slide deck onto 3D auditorium screen and reserves seats for participants.',
      config: {
        replyTemplate: '🌐 Mesh 3D space prepared. Presentation screen loaded with current deck.',
      },
    },
    stats: {
      totalRuns: 19,
      lastTriggered: '1 hour ago',
    },
    logs: [
      {
        id: 'log-mesh-1',
        timestamp: '1 hour ago',
        triggerEvent: 'Q4 Product Demo scheduled for Mesh 3D',
        actionExecuted: 'Pre-warmed WebGL shaders & loaded 4-slide corporate deck',
        status: 'success',
        channelName: 'mesh-virtual-spaces',
        details: 'Room capacity set to 12. Spatial audio zones enabled.',
      },
    ],
  },
  {
    id: 'wf-task-extractor',
    name: 'Copilot Action Item Auto-Extractor',
    description: 'Monitors discussions and automatically creates actionable task cards whenever a message contains commitments like "I will", "TODO", or "@assign".',
    icon: '✅',
    isEnabled: true,
    trigger: {
      type: 'keyword',
      label: 'When commitments or TODOs are mentioned',
      description: 'Triggered by phrases "TODO", "I will", "Action item", "Assigned to"',
      config: {
        keywords: ['TODO', 'I will', 'action item', 'deliver by'],
      },
    },
    action: {
      type: 'assign_task',
      label: 'Extract Task & Log to Productivity Stream',
      description: 'Extracts task description, assignee, and target due date.',
      config: {
        targetChannel: 'general',
      },
    },
    stats: {
      totalRuns: 42,
      lastTriggered: 'Today at 08:45 AM',
    },
    logs: [
      {
        id: 'log-task-1',
        timestamp: 'Today at 08:45 AM',
        triggerEvent: 'Task commitment detected in #architecture-sync',
        actionExecuted: 'Extracted task: "Complete Mesh 3D Spatial Audit" assigned to Alex Mercer',
        status: 'success',
        channelName: 'architecture-sync',
        details: 'Parsed task deadline: Tomorrow 5 PM.',
      },
    ],
  },
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-mesh-q4',
    title: 'Q4 Product Demo & Immersive Mesh Showcase',
    startTime: 'Now (In Progress)',
    endTime: '11:45 AM',
    durationMinutes: 45,
    organizer: TEAM_MEMBERS[1], // Sarah Chen
    participants: [CURRENT_USER, TEAM_MEMBERS[1], TEAM_MEMBERS[2], TEAM_MEMBERS[3], TEAM_MEMBERS[4]],
    isLive: true,
    meshRoomId: 'mesh-boardroom-1',
    channelName: 'general',
    agenda: 'Executive review of Microsoft Teams 3D Mesh features, procedural scene fidelity, and Power Automate workflow execution.',
  },
  {
    id: 'meet-arch-council',
    title: 'Architecture Council: AI Agents & Reliability',
    startTime: 'Today, 2:30 PM',
    endTime: '3:30 PM',
    durationMinutes: 60,
    organizer: CURRENT_USER,
    participants: [CURRENT_USER, TEAM_MEMBERS[2], TEAM_MEMBERS[4]],
    isLive: false,
    channelName: 'architecture-sync',
    agenda: 'Deep dive into Gemini 3.8 Flash latency metrics and event-driven automation triggers.',
  },
  {
    id: 'meet-design-sync',
    title: 'Weekly Fluent UI & Spatial Design Review',
    startTime: 'Tomorrow, 10:00 AM',
    endTime: '10:45 AM',
    durationMinutes: 45,
    organizer: TEAM_MEMBERS[3], // Elena Rostova
    participants: [CURRENT_USER, TEAM_MEMBERS[1], TEAM_MEMBERS[3]],
    isLive: false,
    meshRoomId: 'mesh-boardroom-1',
    channelName: 'mesh-virtual-spaces',
    agenda: 'Critique of 3D procedural textures, lighting balance, and bottom dock ergonomics.',
  },
];

export const MESH_ROOM_CONFIG: MeshRoomConfig = {
  id: 'mesh-boardroom-1',
  name: 'Executive Boardroom - Horizon Tower',
  theme: 'boardroom',
  capacity: 12,
  currentSlide: 0,
  slides: [
    {
      title: 'Microsoft Teams Next-Gen',
      subtitle: 'Spatial Collaboration & Autonomous Workflows',
      bullets: [
        'Immersive Mesh 3D spaces with PBR lighting & procedural furniture',
        'Built-in Power Automate bot engine with real-time incident escalation',
        'Intelligent Copilot summaries powered by Gemini 3.8 Flash',
        'Seamless transition between 2D video grid and 3D spatial auditorium',
      ],
      metric: { label: 'Active Enterprise Nodes', value: '14,200+' },
    },
    {
      title: 'Three.js 3D Procedural Craft',
      subtitle: 'Production Realism & Zero 404 Assets',
      bullets: [
        'Composite 3–12 part procedural models for boardroom table & ergonomic chairs',
        'ACESFilmicToneMapping & RoomEnvironment via PMREMGenerator',
        'Warm key light balanced against cool sky/ground HemisphereLight fill',
        'Hardware-accelerated 60fps loop with exponential camera damping',
      ],
      metric: { label: 'Render Target Frame Rate', value: '60 FPS' },
    },
    {
      title: 'Power Automate & Intelligent AI',
      subtitle: 'Zero-Latency Workflow Automation',
      bullets: [
        'Keyword triage: instant escalation for urgent production issues',
        'Daily standup synthesis: automatically compiles asynchronous progress',
        'Context-aware Copilot: draft executive responses & extract action items',
        'Audit logging with execution timestamps and severity classification',
      ],
      metric: { label: 'Automated Runs Today', value: '153 Runs' },
    },
    {
      title: 'Quarterly Milestones & Rollout',
      subtitle: 'Roadmap & Enterprise Readiness',
      bullets: [
        'Q1: Global Mesh 3D rollout for all enterprise tenants',
        'Q2: Autonomous AI agents for sprint triage & PR reviews',
        'Q3: Interactive spatial whiteboards and 3D diagramming',
        'Q4: Full cross-platform VR/desktop parity',
      ],
      metric: { label: 'Enterprise SLA Uptime', value: '99.99%' },
    },
  ],
};

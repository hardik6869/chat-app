import { CURRENT_USER_ID as ME } from './users';

/** One scripted line: who, what, how long ago, and optional reply/reactions (by line index). */
interface ScriptLine {
  from: string;
  text: string;
  minutesAgo: number;
  replyTo?: number;
  reactions?: Record<string, string[]>;
}

export interface ConversationScript {
  id: string;
  type: 'direct' | 'group';
  memberIds: string[];
  unreadCount: number;
  name?: string;
  description?: string;
  adminIds?: string[];
  lines: ScriptLine[];
}

const DAY = 24 * 60;

export const conversationScripts: ConversationScript[] = [
  {
    id: 'c-ava',
    type: 'direct',
    memberIds: [ME, 'ava'],
    unreadCount: 2,
    lines: [
      {
        from: 'ava',
        text: 'Morning! Did you get a chance to look at the onboarding flow?',
        minutesAgo: DAY + 120,
      },
      {
        from: ME,
        text: 'Yes, left a few comments in Figma. Mostly copy tweaks.',
        minutesAgo: DAY + 95,
      },
      { from: 'ava', text: 'Perfect, thanks 🙌', minutesAgo: DAY + 90, reactions: { '❤️': [ME] } },
      { from: ME, text: 'Can we sync on the empty states before Friday?', minutesAgo: 75 },
      { from: 'ava', text: 'Sure — does 3 PM work?', minutesAgo: 12, replyTo: 3 },
      { from: 'ava', text: "I'll bring the updated illustrations.", minutesAgo: 11 },
    ],
  },
  {
    id: 'c-design',
    type: 'group',
    name: 'Design Team',
    description: 'Product design, reviews and critiques.',
    memberIds: [ME, 'ava', 'sofia', 'mia', 'priya'],
    adminIds: [ME, 'ava'],
    unreadCount: 3,
    lines: [
      {
        from: 'sofia',
        text: 'Shared the new color tokens in the library.',
        minutesAgo: DAY * 2 + 40,
      },
      {
        from: 'mia',
        text: 'The dark theme looks so much calmer now.',
        minutesAgo: DAY * 2 + 30,
        reactions: { '👍': ['sofia', ME] },
      },
      { from: ME, text: 'Agreed. Contrast checks all pass AA too.', minutesAgo: DAY * 2 + 20 },
      {
        from: 'priya',
        text: 'Critique at 11 today — bring one thing you are stuck on.',
        minutesAgo: 180,
      },
      { from: ME, text: "I'll show the message actions menu.", minutesAgo: 170, replyTo: 3 },
      { from: 'ava', text: 'Running 5 min late, start without me!', minutesAgo: 25 },
      {
        from: 'sofia',
        text: 'No worries, grabbing coffee ☕',
        minutesAgo: 24,
        reactions: { '😂': ['mia'] },
      },
      { from: 'mia', text: 'Notes from today are in the doc.', minutesAgo: 6 },
    ],
  },
  {
    id: 'c-liam',
    type: 'direct',
    memberIds: [ME, 'liam'],
    unreadCount: 0,
    lines: [
      { from: 'liam', text: 'The release build is green ✅', minutesAgo: DAY + 300 },
      { from: ME, text: 'Nice! Any blockers for tomorrow?', minutesAgo: DAY + 290 },
      { from: 'liam', text: 'Just the migration script. Should be quick.', minutesAgo: DAY + 280 },
      { from: ME, text: 'Ping me if you need a review.', minutesAgo: DAY + 60 },
    ],
  },
  {
    id: 'c-priya',
    type: 'direct',
    memberIds: [ME, 'priya'],
    unreadCount: 1,
    lines: [
      { from: ME, text: 'Thanks for the research summary, super helpful.', minutesAgo: 400 },
      {
        from: 'priya',
        text: 'Glad it helped! Want me to set up the next round of interviews?',
        minutesAgo: 95,
      },
    ],
  },
  {
    id: 'c-sofia',
    type: 'direct',
    memberIds: [ME, 'sofia'],
    unreadCount: 0,
    lines: [
      {
        from: 'sofia',
        text: 'Are you joining the team lunch on Thursday?',
        minutesAgo: DAY * 3 + 200,
      },
      {
        from: ME,
        text: "Wouldn't miss it 🍜",
        minutesAgo: DAY * 3 + 180,
        reactions: { '🎉': ['sofia'] },
      },
    ],
  },
  {
    id: 'c-noah',
    type: 'direct',
    memberIds: [ME, 'noah'],
    unreadCount: 0,
    lines: [
      {
        from: 'noah',
        text: 'Here is the API contract for the search endpoint.',
        minutesAgo: DAY * 9,
      },
      {
        from: ME,
        text: 'Looks good. One question about pagination cursors.',
        minutesAgo: DAY * 9 - 30,
      },
      {
        from: 'noah',
        text: 'We return `nextCursor`; null means no more pages.',
        minutesAgo: DAY * 9 - 45,
      },
    ],
  },
  {
    id: 'c-trip',
    type: 'group',
    name: 'Weekend Trip',
    description: 'Planning the hiking weekend.',
    memberIds: [ME, 'mia', 'ethan', 'lucas'],
    adminIds: ['mia'],
    unreadCount: 0,
    lines: [
      { from: 'mia', text: 'Cabin is booked for the 22nd!', minutesAgo: DAY * 15 },
      { from: 'ethan', text: "I'll bring the camping stove.", minutesAgo: DAY * 15 - 20 },
      { from: 'lucas', text: 'Who is driving?', minutesAgo: DAY * 15 - 25 },
      { from: ME, text: 'I can take 3 people.', minutesAgo: DAY * 15 - 40, replyTo: 2 },
    ],
  },
];

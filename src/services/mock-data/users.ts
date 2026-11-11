import type { User } from '@/entities';

export const CURRENT_USER_ID = 'me';

const photo = (id: number) => `https://i.pravatar.cc/150?img=${id}`;

/** `lastSeenMinutesAgo` is turned into a timestamp relative to "now" by the seed. */
export const seedUsers: (Omit<User, 'lastSeenAt'> & { lastSeenMinutesAgo?: number })[] = [
  { id: CURRENT_USER_ID, name: 'Jordan Lee', avatarUrl: photo(12), isOnline: true },
  { id: 'ava', name: 'Ava Patel', avatarUrl: photo(47), isOnline: true },
  { id: 'liam', name: 'Liam Chen', avatarUrl: photo(59), isOnline: false, lastSeenMinutesAgo: 42 },
  { id: 'sofia', name: 'Sofia Garcia', avatarUrl: photo(45), isOnline: true },
  { id: 'noah', name: 'Noah Williams', isOnline: false, lastSeenMinutesAgo: 60 * 26 },
  { id: 'mia', name: 'Mia Johnson', avatarUrl: photo(32), isOnline: true },
  {
    id: 'ethan',
    name: 'Ethan Brown',
    avatarUrl: photo(53),
    isOnline: false,
    lastSeenMinutesAgo: 8,
  },
  { id: 'priya', name: 'Priya Sharma', isOnline: true },
  {
    id: 'lucas',
    name: 'Lucas Martin',
    avatarUrl: photo(68),
    isOnline: false,
    lastSeenMinutesAgo: 300,
  },
];

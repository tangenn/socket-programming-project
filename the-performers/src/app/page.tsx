import { GroupChatsPanel } from "@/components/HomePageComponents/GroupChatsPanel";
import { UsersPanel } from "@/components/HomePageComponents/UserPanel";


// Mock Data
export type User = {
  name: string;
  avatarId?: number;
};

// Group type for GroupChatsPanel
export type Group = {
  name: string;
  members: User[];
};

// --- Mock Users ---
export const currentUser: User = {
  name: "Tan",
  avatarId: 1,
};

export const connectedUsers: User[] = [
  { name: "Aea", avatarId: 2 },
  { name: "Zagif", avatarId: 3 },
  { name: "Mhee", avatarId: 4 },
  { name: "Mee", avatarId: 0 },
  { name: "Ksi", avatarId: 20 },
];

// --- Mock Groups ---
export const joinedGroups: Group[] = [
  {
    name: "Sermsak",
    members: [
      { name: "MHEE", avatarId: 1 },
      { name: "AEA", avatarId: 2 },
      { name: "TAN", avatarId: 3 },
    ],
  },
  {
    name: "4code",
    members: [
      { name: "KSI1", avatarId: 4 },
      { name: "AEA1", avatarId: 5 },
    ],
  },
];

export const otherGroups: Group[] = [
  {
    name: "shiba1",
    members: [
      { name: "MHEE", avatarId: 1 },
      { name: "AEA", avatarId: 2 },
    ],
  },
  {
    name: "shiba2",
    members: [],
  },
];


export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      
      {/* Background */}
      <div
        className="absolute inset-0 bg-[url('/backgrounds/background_Dramatic.jpg')] bg-cover bg-center bg-fixed"
      />

      {/* Optional dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex justify-center gap-10 pt-20 px-6">
        <UsersPanel currentUser={currentUser} connectedUsers={connectedUsers} />
        <GroupChatsPanel joinedGroups={joinedGroups} otherGroups={otherGroups} />
      </div>
    </div>
  );
}

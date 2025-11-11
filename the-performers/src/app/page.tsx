import { GroupChatsPanel } from "@/components/HomePageComponents/GroupChatsPanel";
import { UsersPanel } from "@/components/HomePageComponents/UserPanel";

export default function HomePage() {
  const mockUser = { name: "MHEE" };
  const mockConnectedUsers = [
    { name: "AEA" },
    { name: "TAN" },
    { name: "KSI1" },
    { name: "AEA1" },
    { name: "TAN1" },
    { name: "KSI2" },
    { name: "AEA2" },
    { name: "TAN2" },
    { name: "KSI3" },
  ];

  const mockJoinedGroups = [
    { name: "Sermsak", members: ["Aea", "Zagif", "Tan"] },
    { name: "Sermsak1", members: ["Aea", "Zagif", "Tan"] },
    { name: "Sermsak2", members: ["Aea", "Zagif", "Tan"] },
  ];

  const mockOtherGroups = [
    { name: "THOI", members: ["Mee"] },
  ];

  return (
    <div className="min-h-screen bg-gray-300 flex justify-center gap-10 pt-20 px-6">
      <UsersPanel currentUser={mockUser} connectedUsers={mockConnectedUsers} />
      <GroupChatsPanel joinedGroups={mockJoinedGroups} otherGroups={mockOtherGroups} />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";

type Group = {
  name: string;
  members: string[];
};

type GroupChatsPanelProps = {
  joinedGroups: Group[];
  otherGroups: Group[];
};

export function GroupChatsPanel({ joinedGroups, otherGroups }: GroupChatsPanelProps) {
  const router = useRouter();

  return (
    <div className="bg-gray-200/60 rounded-3xl shadow-md p-8 w-full max-w-md max-h-[70vh] overflow-y-auto">

      {/* Joined Groups */}
      <h2 className="font-semibold mb-4">Joined Group Chats</h2>

      {joinedGroups.map((g) => (
        <div key={g.name} className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex items-center mb-2">
            <span className="font-semibold flex-1 text-lg">{g.name}</span>

            <button
              onClick={() => router.push(`/group/${encodeURIComponent(g.name)}`)}
              className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition font-medium"
            >
              Chat
            </button>
          </div>

          <p className="text-sm text-gray-600">
            Members: {g.members.join(", ")}
          </p>
        </div>
      ))}

      {/* Other Groups */}
      <h2 className="font-semibold mb-4">Other Group Chats</h2>

      {otherGroups.map((g) => (
        <div key={g.name} className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex items-center mb-2">
            <span className="font-semibold flex-1 text-lg">{g.name}</span>

            <button
              onClick={() => router.push(`/group/${encodeURIComponent(g.name)}`)}
              className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition font-medium"
            >
              Join
            </button>
          </div>

          <p className="text-sm text-gray-600">
            Members: {g.members.join(", ")}
          </p>
        </div>
      ))}

      {/* Create group */}
      <button
        onClick={() => router.push("/createGroup")}
        className="bg-white px-4 py-2 rounded-md shadow-sm font-semibold hover:bg-gray-100 transition"
      >
        Create a new group
      </button>
    </div>
  );
}
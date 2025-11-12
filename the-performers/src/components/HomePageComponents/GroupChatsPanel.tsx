"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { socket } from "@/socket";

type Group = {
  name: string;
  members: string[];
};

export function GroupChatsPanel() {
  const router = useRouter();
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string>("");

  useEffect(() => {
    // Get current username from localStorage
    const username = localStorage.getItem('username') || "";
    setCurrentUsername(username);

    // Request available groups from server
    socket.emit('get_available_groups');

    // Listen for available groups response
    function onAvailableGroups(data: { groups: any[] }) {
      console.log("Received groups:", data.groups);
      
      // Transform the data from the server format to our Group format
      const groups: Group[] = data.groups.map((group: any) => ({
        name: group.name || group.group_name || "",
        members: group.members || []
      }));
      
      setAvailableGroups(groups);
    }

    socket.on('available_groups', onAvailableGroups);

    // Refresh groups when a new group is created
    function onCreateGroupSuccess() {
      socket.emit('get_available_groups');
    }

    socket.on('create_group_success', onCreateGroupSuccess);

    return () => {
      socket.off('available_groups', onAvailableGroups);
      socket.off('create_group_success', onCreateGroupSuccess);
    };
  }, []);

  // Separate groups into joined and other
  const joinedGroups = availableGroups.filter(g => g.members.includes(currentUsername));
  const otherGroups = availableGroups.filter(g => !g.members.includes(currentUsername));

  return (
    <div className="bg-gray-200/60 rounded-3xl shadow-md p-8 w-full max-w-md max-h-[70vh] overflow-y-auto">

      {/* Joined Groups */}
      <h2 className="font-semibold mb-4">Joined Group Chats</h2>

      {joinedGroups.length === 0 ? (
        <p className="text-gray-500 text-sm mb-6">You haven&apos;t joined any groups yet.</p>
      ) : (
        joinedGroups.map((g) => (
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
        ))
      )}

      {/* Other Groups */}
      <h2 className="font-semibold mb-4">Other Group Chats</h2>

      {otherGroups.length === 0 ? (
        <p className="text-gray-500 text-sm mb-6">No other groups available.</p>
      ) : (
        otherGroups.map((g) => (
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
        ))
      )}

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
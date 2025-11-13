"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { socket } from "@/socket";
import { getAvatar } from "@/utils/avatarMap";

type Member = { name: string; avatarId?: number };
type Group = { name: string; members: Member[] };

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

  const toggleGroup = (g: string) =>
    setOpenGroup((prev) => (prev === g ? null : g));

  const renderGroup = (g: Group, action: string) => (
    <div
      key={g.name}
      className="
        bg-white p-4 rounded-xl mb-4
        border-4 border-black
        shadow-[4px_4px_0px_#000]
      "
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => toggleGroup(g.name)}
      >
        <span className="font-bold text-lg">{g.name}</span>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/group/${encodeURIComponent(g.name)}`);
            }}
            className="
              px-3 py-1 bg-white rounded-lg 
              border-2 border-black shadow-[2px_2px_0px_#000] 
              font-bold hover:translate-y-0.5 transition
            "
          >
            {action}
          </button>

          <span
            className={`
              transition-transform duration-300 font-bold
              ${openGroup === g.name ? "rotate-180" : ""}
            `}
          >
            ▼
          </span>
        </div>
      </div>

      {openGroup === g.name && (
        <div className="mt-3 border-t-2 border-black pt-3">
          <p className="font-bold mb-2 text-sm">Members:</p>

          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {g.members.length ? (
              g.members.map((m, idx) => (
                <div
                  key={idx}
                  className="
                    flex items-center gap-3 p-2 rounded-lg
                    bg-white border-2 border-black shadow-[3px_3px_0px_#000]
                  "
                >
                  <img
                    src={getAvatar(m.avatarId)}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium">{m.name}</span>
                </div>
              ))
            ) : (
              <p className="italic text-gray-600">No members yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="
        bg-white/90 rounded-[32px] p-8 
        border-4 border-black
        shadow-[8px_8px_0px_#000]
        w-full max-w-md max-h-[70vh] overflow-y-auto
      "
    >
      <h2
        className="text-xl font-bold mb-4"
        style={{ fontFamily: "'Bangers', sans-serif" }}
      >
        JOINED GROUP CHATS
      </h2>
      {joinedGroups.map((g) => renderGroup(g, "Chat"))}

      <h2
        className="text-xl font-bold mt-6 mb-4"
        style={{ fontFamily: "'Bangers', sans-serif" }}
      >
        OTHER GROUPS
      </h2>
      {otherGroups.map((g) => renderGroup(g, "Join"))}

      <button
        onClick={() => router.push("/createGroup")}
        className="
          bg-white mt-6 py-2 px-4 rounded-xl 
          border-4 border-black shadow-[4px_4px_0px_#000]
          font-bold hover:translate-y-1 transition w-full
        "
      >
        Create a New Group
      </button>
    </div>
  );
}

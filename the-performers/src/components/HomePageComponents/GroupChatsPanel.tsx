"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAvatar } from "@/utils/avatarMap";

type Member = {
  name: string;
  avatarId?: number;
};

type Group = {
  name: string;
  members: Member[];
};

type GroupChatsPanelProps = {
  joinedGroups: Group[];
  otherGroups: Group[];
};

export function GroupChatsPanel({ joinedGroups, otherGroups }: GroupChatsPanelProps) {
  const router = useRouter();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleGroup = (groupName: string) => {
    setOpenGroup((prev) => (prev === groupName ? null : groupName));
  };

  const renderGroup = (g: Group, action: string) => (
    <div key={g.name} className="bg-white p-4 rounded-xl shadow mb-4">
      {/* Group Header */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => toggleGroup(g.name)}
      >
        <span className="font-semibold text-lg">{g.name}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/group/${encodeURIComponent(g.name)}`);
            }}
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition font-medium"
          >
            {action}
          </button>
          <span
            className={`transition-transform duration-300 ${
              openGroup === g.name ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </div>
      </div>

      {/* Members Dropdown */}
      {openGroup === g.name && (
        <div className="mt-3 border-t border-gray-200 pt-3 transition-all duration-300">
          <p className="text-sm text-gray-500 mb-2 font-semibold">Members:</p>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
            {g.members.length > 0 ? (
              g.members.map((m, idx) => (
                <div
                  key={`${g.name}-${m.name}-${idx}`}
                  className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition p-2 rounded-lg shadow-sm"
                >
                  <img
                    src={getAvatar(m.avatarId)}
                    alt={m.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <span className="text-gray-800 font-medium truncate">{m.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic pl-1">No members yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-200/60 rounded-3xl shadow-md p-8 w-full max-w-md max-h-[70vh] overflow-y-auto">
      <h2 className="font-semibold mb-4">Joined Group Chats</h2>
      {joinedGroups.map((g) => renderGroup(g, "Chat"))}

      <h2 className="font-semibold mb-4 mt-6">Other Group Chats</h2>
      {otherGroups.map((g) => renderGroup(g, "Join"))}

      <button
        onClick={() => router.push("/createGroup")}
        className="bg-white px-4 py-2 rounded-md shadow-sm font-semibold hover:bg-gray-100 transition mt-6"
      >
        Create a new group
      </button>
    </div>
  );
}
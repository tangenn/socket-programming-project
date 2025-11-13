"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getAvatar } from "@/utils/avatarMap";

type User = {
  name: string;
  avatarId?: number;
};

type UsersPanelProps = {
  currentUser: User;
  connectedUsers: User[];
};

export function UsersPanel({ currentUser, connectedUsers }: UsersPanelProps) {
  const router = useRouter();

  return (
    <div
      className="
        bg-white/90 rounded-[32px] p-8 
        border-4 border-black
        shadow-[8px_8px_0px_#000]
        w-full max-w-md max-h-[70vh] overflow-y-auto
      "
    >
      {/* Current User */}
      <div
        className="
          flex items-center gap-3 bg-white 
          p-4 rounded-xl mb-4
          border-4 border-black
          shadow-[4px_4px_0px_#000]
        "
      >
        <img
          src={getAvatar(currentUser.avatarId)}
          alt="pfp"
          className="w-12 h-12 rounded-full object-cover"
        />
        <span className="font-semibold flex-1 text-lg">
          {currentUser.name}
        </span>
      </div>

      {/* Change Avatar */}
      <button
        onClick={() => router.push("/avatarSelection")}
        className="
          w-full bg-white py-2 rounded-xl 
          border-4 border-black shadow-[4px_4px_0px_#000]
          font-bold hover:translate-y-1 transition
        "
      >
        Change Avatar
      </button>

      {/* Connected Users header */}
      <h2
        className="mt-6 mb-3 text-xl font-bold tracking-wide"
        style={{ fontFamily: "'Bangers', sans-serif" }}
      >
        CONNECTED USERS
      </h2>

      {/* User List */}
      {connectedUsers.map((u) => (
        <div
          key={u.name}
          className="
            flex items-center gap-3 p-3 mb-3 
            bg-white rounded-xl
            border-4 border-black shadow-[4px_4px_0px_#000]
          "
        >
          <img
            src={getAvatar(u.avatarId)}
            alt={u.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="font-semibold flex-1">{u.name}</span>

          <button
            onClick={() =>
              router.push(`/private/${encodeURIComponent(u.name)}`)
            }
            className="
              px-3 py-1 bg-white rounded-lg 
              border-2 border-black shadow-[2px_2px_0px_#000]
              font-bold hover:translate-y-0.5 transition
            "
          >
            Chat
          </button>
        </div>
      ))}
    </div>
  );
}

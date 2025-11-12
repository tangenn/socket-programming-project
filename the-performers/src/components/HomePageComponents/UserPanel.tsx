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
    <div className="bg-gray-200/60 rounded-3xl shadow-md p-8 w-full max-w-md max-h-[70vh] overflow-y-auto">
      {/* Current User */}
      <div className="bg-white w-full p-4 rounded-xl shadow flex items-center mb-3">
        <img
          src={getAvatar(currentUser.avatarId)}
          alt="pfp"
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <span className="font-semibold flex-1">{currentUser.name}</span>
      </div>

      {/* Change Avatar */}
      <button
        onClick={() => router.push("/avatarSelection")}
        className="bg-white px-4 py-2 rounded-md shadow-sm mb-6 font-semibold hover:bg-gray-100 transition"
      >
        Change your avatar
      </button>

      <h2 className="font-semibold mb-3">Connected Users</h2>

      {/* Connected Users */}
      {connectedUsers.map((u) => (
        <div
          key={u.name}
          className="bg-white w-full p-4 mb-3 rounded-xl shadow flex items-center"
        >
          <img
            src={getAvatar(u.avatarId)}
            alt="pfp"
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <span className="font-semibold flex-1">{u.name}</span>

          <button
            onClick={() => router.push(`/private/${encodeURIComponent(u.name)}`)}
            className="px-3 py-1 bg-gray-200 rounded-md font-medium hover:bg-gray-300 transition"
          >
            Chat
          </button>
        </div>
      ))}
    </div>
  );
}
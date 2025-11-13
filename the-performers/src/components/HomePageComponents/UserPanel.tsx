"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/socket";
import { getAvatar } from "@/utils/avatarMap";

type User = {
  name: string;
  avatarId?: number;
};

type UsersPanelProps = {
  currentUser: User;
};

export function UsersPanel({ currentUser }: UsersPanelProps) {
  const router = useRouter();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    // Request online users when component mounts
    socket.emit("online_users");

    // Listen for online users updates
    function handleOnlineUsers(data: { users: string[] }) {
      // Filter out the current user from the list
      const filteredUsers = data.users.filter(user => user !== currentUser.name);
      setOnlineUsers(filteredUsers);
    }

    socket.on("online_users", handleOnlineUsers);

    // Set up interval to periodically request online users
    const interval = setInterval(() => {
      socket.emit("online_users");
    }, 5000); // Update every 5 seconds

    return () => {
      socket.off("online_users", handleOnlineUsers);
      clearInterval(interval);
    };
  }, [currentUser.name]);

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

      <h2 className="font-semibold mb-3">
        Online Users ({onlineUsers.length})
      </h2>

      {/* Online Users */}
      {onlineUsers.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No other users online
      {/* Connected Users header */}
<!--       <h2
        className="mt-6 mb-3 text-xl font-bold tracking-wide"
        style={{ fontFamily: "'Bangers', sans-serif" }}
      >
        CONNECTED USERS
      </h2>
 -->
      {/* User List */}
<!--       {connectedUsers.map((u) => (
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
          <span className="font-semibold flex-1">{u.name}</span> -->

        </div>
      ) : (
        onlineUsers.map((username) => (
          <div
            key={username}
            className="bg-white w-full p-4 mb-3 rounded-xl shadow flex items-center"
          >
            <div className="relative mr-3">
              <img
                src="/fallback.png"
                alt="pfp"
                className="w-10 h-10 rounded-full object-cover"
              />
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="font-semibold flex-1">{username}</span>

            <button
              onClick={() => router.push(`/private/${encodeURIComponent(username)}`)}
              className="px-3 py-1 bg-gray-200 rounded-md font-medium hover:bg-gray-300 transition"
            >
              Chat
            </button>
          </div>
        ))
      )}
    </div>
  );
}

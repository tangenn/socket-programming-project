"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/socket";

type User = {
  name: string;
  avatar?: string;
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
    <div className="bg-gray-200/60 rounded-3xl shadow-md p-8 w-full max-w-md max-h-[70vh] overflow-y-auto">

      {/* Current User */}
      <div className="bg-white w-full p-4 rounded-xl shadow flex items-center mb-3">
        <img
          src={currentUser.avatar ?? "/fallback.png"}
          alt="pfp"
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <span className="font-semibold flex-1">{currentUser.name}</span>
      </div>

      {/* Change avatar */}
      <button
        onClick={() => router.push("/avatarSelection")}
        className="bg-white px-4 py-2 rounded-md shadow-sm mb-6 font-semibold hover:bg-gray-100 transition"
      >
        Change your avatar
      </button>

      <h2 className="font-semibold mb-3">
        Online Users ({onlineUsers.length})
      </h2>

      {/* Online Users */}
      {onlineUsers.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No other users online
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
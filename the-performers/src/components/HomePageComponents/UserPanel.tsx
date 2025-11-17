"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/socket";
import { getAvatar } from "@/utils/avatarMap";

type User = {
  name: string;
  avatarId?: number;
};

type OnlineUser = {
  username: string;
  avatarId?: number;
};

type UsersPanelProps = {
  currentUser: User;
};

export function UsersPanel({ currentUser }: UsersPanelProps) {
  const router = useRouter();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    // Request online users when component mounts
    socket.emit("online_users");

    // Listen for online users updates
    function handleOnlineUsers(data: { users: Array<{ username: string; avatarId?: number }> }) {
      // Filter out the current user from the list
      const filteredUsers = data.users.filter(
        (user) => user.username !== currentUser.name
      );
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
        bg-[#ffffffdd]
        border-4 border-black
        shadow-[8px_8px_0px_#000]
        rounded-[32px]
        p-6 
        w-full max-w-md
        max-h-[70vh]
        overflow-y-auto
      "
    >
      {/* Current User */}
      <div
        className="
          flex items-center gap-3 
          bg-white
          border-4 border-black
          rounded-2xl
          px-4 py-3
          shadow-[4px_4px_0px_#000]
          mb-6
        "
      >
        <img
          src={getAvatar(currentUser.avatarId)}
          alt="pfp"
          className="w-12 h-12 rounded-full border-2 border-black object-cover"
        />
        <span className="font-bold flex-1 text-lg">{currentUser.name}</span>
      </div>

      {/* Change Avatar Button */}
      <button
        onClick={() => router.push("/avatarSelection")}
        className="
          w-full 
          bg-yellow-400 
          text-black 
          font-bold 
          py-3
          rounded-xl 
          border-4 border-black 
          shadow-[4px_4px_0px_#000]
          hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000]
          active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]
          transition-all
          mb-6
        "
      >
        CHANGE AVATAR
      </button>

      {/* Connected Users Header */}
      <h2
        className="
          mb-4 
          text-xl 
          font-bold 
          tracking-wide
        "
        style={{ fontFamily: "'Bangers', sans-serif" }}
      >
        ONLINE USERS ({onlineUsers.length})
      </h2>

      {/* Online Users List */}
      <div className="flex flex-col gap-4">
        {onlineUsers.length === 0 ? (
          <div
            className="
              text-gray-500 
              text-center 
              py-8
              bg-white
              border-2 border-black
              rounded-2xl
              shadow-[4px_4px_0px_#000]
            "
          >
            No other users online
          </div>
        ) : (
          onlineUsers.map((user) => (
            <div
              key={user.username}
              className="
                hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000]
                active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]
                transition-all
                flex items-center gap-3 
                bg-white
                border-2 border-black
                rounded-2xl
                px-4 py-3
                shadow-[4px_4px_0px_#000]
              "
            >
              <div className="relative">
                <img
                  src={getAvatar(user.avatarId)}
                  alt={user.username}
                  className="
                    w-10 h-10 
                    rounded-full 
                    border-2 border-black
                    object-cover
                  "
                />
                {/* Online indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
              </div>

              <span className="font-semibold flex-1 text-gray-800">
                {user.username}
              </span>

              <button
                onClick={() =>
                  router.push(`/private/${encodeURIComponent(user.username)}`)
                }
                className="
                  px-4 py-2
                  bg-blue-400
                  text-black
                  font-bold
                  rounded-lg
                  border-2 border-black
                  shadow-[3px_3px_0px_#000]
                  hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000]
                  active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000]
                  transition-all
                "
              >
                Chat
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { socket } from "@/socket";
import { GroupChatsPanel } from "@/components/HomePageComponents/GroupChatsPanel";
import { UsersPanel } from "@/components/HomePageComponents/UserPanel";
import Link from "next/link";
import { setAuth, getUsername } from "@/lib/auth";

// Mock Data
export type User = {
  name: string;
  avatarId?: number;
};

// Group type for GroupChatsPanel
export type Group = {
  name: string;
  members: User[];
};

// --- Mock Users ---
export const currentUser: User = {
  name: "Tan",
  avatarId: 1,
};

export const connectedUsers: User[] = [
  { name: "Aea", avatarId: 2 },
  { name: "Zagif", avatarId: 3 },
  { name: "Mhee", avatarId: 4 },
  { name: "Mee", avatarId: 0 },
  { name: "Ksi", avatarId: 20 },
];

// --- Mock Groups ---
export const joinedGroups: Group[] = [
  {
    name: "Sermsak",
    members: [
      { name: "MHEE", avatarId: 1 },
      { name: "AEA", avatarId: 2 },
      { name: "TAN", avatarId: 3 },
    ],
  },
  {
    name: "4code",
    members: [
      { name: "KSI1", avatarId: 4 },
      { name: "AEA1", avatarId: 5 },
    ],
  },
];

export const otherGroups: Group[] = [
  {
    name: "shiba1",
    members: [
      { name: "MHEE", avatarId: 1 },
      { name: "AEA", avatarId: 2 },
    ],
  },
  {
    name: "shiba2",
    members: [],
  },
];

export default function HomePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<number | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Request current user from server
    socket.emit("getMe");

    // Listen for 'me' event from server
    function onMe(data: { username: string | null; avatarId?: number }) {
      if (data.username) {
        setUsername(data.username);
        setAvatarId(data.avatarId);
      }
    }

    // Listen for login success
    function onLoginSuccess(data: { username: string }) {
      setUsername(data.username);
      setAuth(data.username);
      // Request user data again to get avatar
      socket.emit("getMe");
    }

    // Listen for avatar updates
    function onAvatarSelected(data: { avatarId: number }) {
      setAvatarId(data.avatarId);
    }

    socket.on("me", onMe);
    socket.on("login_success", onLoginSuccess);
    socket.on("avatar_selected", onAvatarSelected);

    return () => {
      socket.off("me", onMe);
      socket.off("login_success", onLoginSuccess);
      socket.off("avatar_selected", onAvatarSelected);
    };
  }, []);

  // Don't render anything until mounted to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  // Show login prompt if not logged in
  if (!username) {
    return (
      // <div className="min-h-screen bg-gray-300 flex items-center justify-center">
      //   <div className="text-center">
      //     <h1 className="text-4xl font-bold mb-4 text-gray-800">
      //       Welcome to PRF
      //     </h1>
      //     <p className="text-xl text-gray-600 mb-6">Please login to continue</p>
      //     <Link
      //       href="/login"
      //       className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
      //     >
      //       Go to Login
      //     </Link>
      //   </div>
      // </div>
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 bg-[url('/backgrounds/background_Dramatic.jpg')] bg-cover bg-center bg-fixed" />

        {/* Optional dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div
          className="
            relative w-full max-w-md mx-4
            bg-white/90
            backdrop-blur-md
            rounded-[32px]
            border-4 border-black
            shadow-[12px_12px_0px_#000]
            p-12
            flex flex-col items-center gap-6
          "
        >
          <h1 className="text-4xl font-bold text-gray-800 text-center">
            Welcome to PRF
          </h1>
          <p className="text-xl text-gray-600 text-center">Please login to continue</p>
          <Link
            href="/login"
            className="
              px-5 py-2
              bg-yellow-200 text-black font-bold
              rounded-xl
              border-4 border-black
              shadow-[4px_4px_0px_#000]
              hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000]
            active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]
            transition-all
            "
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const mockUser = { name: username, avatarId: avatarId };

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/backgrounds/background_Dramatic.jpg')] bg-cover bg-center bg-fixed" />

      {/* Optional dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex justify-center gap-10 pt-40 px-6">
        <UsersPanel currentUser={mockUser} />
        <GroupChatsPanel />
      </div>
    </div>
  );
}

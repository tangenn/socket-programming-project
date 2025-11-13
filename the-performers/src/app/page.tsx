"use client";

import { useState, useEffect } from "react";
import { socket } from "@/socket";
import { GroupChatsPanel } from "@/components/HomePageComponents/GroupChatsPanel";
import { UsersPanel } from "@/components/HomePageComponents/UserPanel";
import Link from "next/link";
import { setAuth, getUsername } from "@/lib/auth";

export default function HomePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check for existing username from localStorage or cookie
    const storedUsername = getUsername();
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Listen for login success
    function onLoginSuccess(data: { username: string }) {
      setUsername(data.username);
      setAuth(data.username);
    }

    socket.on('login_success', onLoginSuccess);

    return () => {
      socket.off('login_success', onLoginSuccess);
    };
  }, []);

  // Don't render anything until mounted to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  // Show login prompt if not logged in
  if (!username) {
    return (
      <div className="min-h-screen bg-gray-300 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome to PRF</h1>
          <p className="text-xl text-gray-600 mb-6">Please login to continue</p>
          <Link 
            href="/login"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const mockUser = { name: username };

  return (
    <div className="min-h-screen bg-gray-300 flex justify-center gap-10 pt-20 px-6">
      <UsersPanel currentUser={mockUser} />
      <GroupChatsPanel />
    </div>
  );
}

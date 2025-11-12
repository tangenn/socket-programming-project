"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { socket } from "@/socket";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    setIsConnected(socket.connected);
    
    // --- Listen for built-in socket events ---
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    // Listen for login success to update username
    function onLoginSuccess(data: { username: string }) {
      setUsername(data.username);
    }

    // Add the listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('login_success', onLoginSuccess);
    
  // --- Cleanup function ---
    return () => {
      // Remove the listeners when the component unmounts
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('login_success', onLoginSuccess);
    };
  }, []); // The empty array [] means this effect runs only once

  const handleLogout = () => {
    // Disconnect the socket - server will handle cleanup on disconnect
    socket.disconnect();
    // Clear username
    setUsername(null);
    // Redirect to home
    router.push('/');
  };

  return (
    <nav className="w-full bg-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
      <h1 className="text-3xl font-black">PRF</h1>

      <div className="flex items-center gap-6 font-semibold">
        <Link href="/" className="hover:opacity-70 transition">Home</Link>
        <Link href="/about" className="hover:opacity-70 transition">About</Link>
        {username ? (
          <button 
            onClick={handleLogout}
            className="hover:opacity-70 transition"
          >
            Log out of {username}
          </button>
        ) : (
          <Link href="/login" className="hover:opacity-70 transition">Login</Link>
        )}
      </div>

      {/* --- Status Dot --- */}
      {isMounted && (
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'
            }`}
          ></div>
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      )}
    </nav>
  );
}

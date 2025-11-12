"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { socket } from "@/socket";

export default function Navbar() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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

    // Add the listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
  // --- Cleanup function ---
    return () => {
      // Remove the listeners when the component unmounts
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []); // The empty array [] means this effect runs only once

  return (
    <nav className="w-full bg-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
      <h1 className="text-3xl font-black">PRF</h1>

      <div className="flex items-center gap-6 font-semibold">
        <Link href="/" className="hover:opacity-70 transition">Home</Link>
        <Link href="/about" className="hover:opacity-70 transition">About</Link>
        <Link href="/login" className="hover:opacity-70 transition">Login</Link>
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

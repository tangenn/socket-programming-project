"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { socket } from "@/socket";
import { useRouter } from "next/navigation";
import { clearAuth, getUsername, setAuth } from "@/lib/auth";

export default function Navbar() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    setIsConnected(socket.connected);

    const storedUsername = getUsername();
    if (storedUsername) setUsername(storedUsername);

    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }
    function onLoginSuccess(data: { username: string }) {
      setUsername(data.username);
      setAuth(data.username);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("login_success", onLoginSuccess);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("login_success", onLoginSuccess);
    };
  }, []);

  const handleLogout = () => {
    socket.disconnect();
    setUsername(null);
    clearAuth();
    router.push("/");
    window.location.reload();
  };

  return (
    <nav
      className="
      fixed top-0 left-0 w-full z-50 
      bg-white/90 
      border-b-4 border-black 
      shadow-[0_6px_0px_#000]
      px-8 py-4 flex items-center justify-between
      "
    >
      {/* Left Logo */}
      <h1
        className="text-4xl font-extrabold"
        style={{ fontFamily: "'Bangers', sans-serif" }}
      >
        PRF
      </h1>

      {/* Right Controls */}
      <div className="flex items-center gap-8 text-lg font-bold"
        style={{ fontFamily: "'Bangers', sans-serif" }}
      >
        {/* HOME */}
        <Link
          href="/"
          className="
            px-4 py-1 
            border-4 border-black rounded-xl 
            bg-yellow-300 hover:bg-yellow-400
            shadow-[3px_3px_0px_#000]
            transition
          "
        >
          Home
        </Link>

        {/* LOGIN / LOGOUT */}
        {username ? (
          <button
            onClick={handleLogout}
            className="
              px-4 py-1 
              border-4 border-black rounded-xl 
              bg-red-300 hover:bg-red-400
              shadow-[3px_3px_0px_#000]
              transition
            "
          >
            Log Out Of {username}
          </button>
        ) : (
          <Link
            href="/login"
            className="
              px-4 py-1 
              border-4 border-black rounded-xl 
              bg-green-300 hover:bg-green-400
              shadow-[3px_3px_0px_#000]
              transition
            "
          >
            Login
          </Link>
        )}

        {/* Status Dot */}
        {isMounted && (
          <div
            className={`w-4 h-4 rounded-full border-2 border-black shadow 
              ${isConnected ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
          ></div>
        )}
      </div>
    </nav>
  );
}
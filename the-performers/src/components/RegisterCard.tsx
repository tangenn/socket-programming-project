"use client";
import React from "react";
import { socket } from "@/socket";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterCard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Store messages from the server
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- Socket.IO Listeners ---
  // This useEffect sets up listeners when the component mounts
  const router = useRouter();

  useEffect(() => {
    socket.connect();
    console.log("Socket connected:", socket.connected);

    let redirectTimeout: NodeJS.Timeout | undefined;

    // The 'data' parameter is now strongly typed!
    function onRegisterSuccess(data: { message: string }) {
      console.log("Registration successful:", data);
      setSuccessMessage(data.message);
      setErrorMessage("");
      redirectTimeout = setTimeout(() => {
        router.push("/login");
      }, 1200);
    }

    // 'data' is also typed here
    function onRegisterError(data: { message: string }) {
      console.error("Registration error:", data);
      setErrorMessage(data.message);
      setSuccessMessage("");
    }

    // Add the listeners
    socket.on("register_success", onRegisterSuccess);
    socket.on("register_error", onRegisterError);

    // --- Cleanup function ---
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
      socket.off("register_success", onRegisterSuccess);
      socket.off("register_error", onRegisterError);
    };
  }, [router]); // Include router due to navigation on success

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!username || !password) {
      setErrorMessage("Username and password are required");
      return;
    }

    // Emit the 'register' event
    // TypeScript will check that the data object matches
    // the 'register' type in ClientToServerEvents
    socket.emit("register", {
      username: username,
      password: password,
      avatarId: 1,
    });
  };

  return (
    <div className="w-full flex justify-center items-center py-20">
      <form
        onSubmit={handleRegister}
        className="
          relative w-full max-w-md mx-4
          bg-white/90
          backdrop-blur-md
          rounded-[32px]
          border-4 border-black
          shadow-[12px_12px_0px_#000]
          p-12
          flex flex-col items-center gap-2
        "
      >
        <h1 className="text-3xl font-semibold mb-8">Create Account</h1>

        {errorMessage && (
          <div className="w-full p-3 mb-4 rounded-md text-red-700 bg-red-100 border border-red-300 text-center">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="w-full p-3 mb-4 rounded-md text-green-700 bg-green-100 border border-green-300 text-center">
            {successMessage}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-md bg-white text-black shadow-sm focus:outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-2 rounded-md bg-white text-black shadow-sm focus:outline-none"
        />

        <button
          type="submit"
          className="cursor-pointer px-5 py-2
              bg-yellow-200 text-black font-bold
              rounded-xl
              border-4 border-black
              shadow-[4px_4px_0px_#000]
              hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000]
            active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]
            transition-all
            "
        >
          SIGN UP
        </button>
      </form>
    </div>
  );
}

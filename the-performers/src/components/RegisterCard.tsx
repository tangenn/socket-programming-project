"use client";
import React from "react";
import { socket } from "@/socket";
import { useState, useEffect } from "react";

export default function RegisterCard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Store messages from the server
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- Socket.IO Listeners ---
  // This useEffect sets up listeners when the component mounts
  useEffect(() => {
    socket.connect();
    console.log("Socket connected:", socket.connected);

    // The 'data' parameter is now strongly typed!
    function onRegisterSuccess(data: { message: string }) {
      console.log("Registration successful:", data);
      setSuccessMessage(data.message);
      setErrorMessage("");
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
      socket.off("register_success", onRegisterSuccess);
      socket.off("register_error", onRegisterError);
    };
  }, []); // The empty array [] means this effect runs only once

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
    });
  };

  return (
    <div className="w-full flex justify-center items-center py-20">
      <form onSubmit={handleRegister} className="bg-gray-200/60 backdrop-blur-sm rounded-3xl shadow-md p-10 w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-semibold mb-8">Create Account</h1>

        {/* Display Server Messages */}
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

        <button type="submit" className="w-full py-2 rounded-md bg-white font-semibold shadow-sm hover:bg-gray-100 transition cursor-pointer">
          SIGN UP
        </button>
      </form>
    </div>
  );
}

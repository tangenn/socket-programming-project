// This is required because we use React Hooks (useState, useEffect)
"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";

// Connect to your Python server's URL
// This runs once when the file is loaded
const socket = io("http://localhost:8000"); // Make sure this port matches your Uvicorn server

export default function ConnectionStatus() {
  // Create a state variable to hold the connection status
  const [isConnected, setIsConnected] = useState(false);

  // This effect runs once when the component is first mounted
  useEffect(() => {
    // Helper function to update state when we connect
    function onConnect() {
      console.log("Connected to server!");
      setIsConnected(true);
    }

    // Helper function to update state when we disconnect
    function onDisconnect() {
      console.log("Disconnected from server.");
      setIsConnected(false);
    }

    // Bind the events
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Optional: Check if we're already connected (e.g., page refresh)
    setIsConnected(socket.connected);

    // This is a cleanup function
    // It runs when the component is "unmounted" (e.g., you navigate to another page)
    return () => {
      // Unbind the events to prevent memory leaks
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []); // The empty array [] means this effect only runs once

  // Render the text based on the isConnected state
  return (
    <div>
      <h2>Connection Status</h2>
      <p>
        Status:{" "}
        {isConnected ? (
          <strong style={{ color: "green" }}>Connected</strong>
        ) : (
          <strong style={{ color: "red" }}>Disconnected</strong>
        )}
      </p>
    </div>
  );
}
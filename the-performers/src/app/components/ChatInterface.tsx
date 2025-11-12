// This is required for hooks (useState, etc.) and event handlers (onClick)
"use client";

import { useState, useEffect } from "react";

export default function ChatInterface() {
  // --- State Variables ---
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [messages, setMessages] = useState([]); // For DMs or group messages
  const [currentMessage, setCurrentMessage] = useState("");

  // This state would be for the "receiver" or "group_name"
  // For simplicity, let's hardcode it for a group chat
  const groupName = "general";

  // --- Effects ---
  useEffect(() => {
    // --- Basic Connection Events ---
    function onConnect() {
      console.log("Connected!");
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("Disconnected.");
      setIsConnected(false);
    }

    // --- Custom App Events ---
    // Listen for incoming group messages
    function onGroupMessage(data) {
      console.log("Message received:", data);
      // Add the new message to our message list
      setMessages((prevMessages) => [...prevMessages, data]);
    }

    // Listen for any errors from the server
    function onLoginError(data) {
      alert(data.message);
    }

    function onLoginSuccess(data) {
      console.log(`Successfully logged in as ${data.username}`);
      
      // NOW that we are logged in, we can join the group
      socket.emit("join_group", { group_name: groupName });
      
      // And set our UI state
      setIsLoggedIn(true);
      console.log(`Joined group ${groupName}`);
    }

    // Register all our event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("group_message", onGroupMessage); // From your server
    socket.on("login_error", onLoginError); // From your server
    socket.on("login_success", onLoginSuccess)

    setIsConnected(socket.connected);

    // Cleanup function to remove listeners when component unmounts
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("group_message", onGroupMessage);
      socket.off("login_error", onLoginError);
      socket.off("login_success", onLoginSuccess);
    };
  }, []); // Empty array means this runs only once

  // --- Event Handlers ---
  const handleLogin = () => {
    if (username.trim()) {
      // We don't have a 'login_success' event in this example,
      // but in a real app, you'd wait for a server response.
      // For now, we'll just emit 'login' and assume it works
      // if the server doesn't send a 'login_error'.

      // Note: Your server doesn't check password here, just username
      socket.emit("login", { username: username, password: "password" });

      // We also need to join a group to see messages
    //   socket.emit("join_group", { group_name: groupName });

    //   setIsLoggedIn(true);
      console.log(`Logged in as ${username} and joined ${groupName}`);
    }
  };

  const handleSendMessage = () => {
    if (currentMessage.trim() && isLoggedIn) {
      const messageData = {
        group_name: groupName,
        content: currentMessage,
      };

      // Emit the message to the server
      socket.emit("group_message", messageData);

      // We don't add the message to our own list here.
      // We wait for the server to broadcast it back to us
      // via the 'group_message' event listener.
      // This confirms the server received it.

      setCurrentMessage(""); // Clear the input box
    }
  };

  // --- Render Logic ---

  // Show a login form if not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-xl">Login to Chat</h3>
        <div className="flex">
            <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleLogin()}

          className="bg-blue-100/50 focus:outline-none focus:ring-2 focus:ring-blue-200 p-2 rounded w-3/4 mr-2"
        />
        <button onClick={handleLogin} className="hover:bg-amber-200 bg-amber-100 px-4 p-2 rounded-full cursor-pointer">Login</button>
        </div>
        
        <p>Status: {isConnected ? (
          <strong style={{ color: "green" }}>Connected</strong>
        ) : (
          <strong style={{ color: "red" }}>Disconnected</strong>
        )}</p>
      </div>
    );
  }

  // Show the chat interface if logged in
  return (
    <div>
      <h3>Welcome, {username}!</h3>
      <p>
        Chatting in group: <strong>{groupName}</strong>
      </p>

      {/* Message Display Area */}
      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.from || "User"}:</strong> {msg.content}
          </div>
        ))}
      </div>

      {/* Message Input Area */}
      <input
        type="text"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}

        className="bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 p-2 rounded w-3/4 mr-2"
      />
      <button
        onClick={handleSendMessage}
        className="bg-amber-200 cursor-pointer py-2 px-4 rounded-full hover:bg-amber-300 focus:border-amber-400 active:bg-amber-400"
      >
        Send
      </button>
    </div>
  );
}

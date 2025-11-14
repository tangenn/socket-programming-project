"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/socket";
import { CreateGroupCard } from "@/components/CreateGroupCard";

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  const sanitizeGroupName = (name: string): string => {
    return name.replace(/[^\w]/g, "");
  };

  useEffect(() => {
    // Make sure socket is connected
    socket.connect();

    // Request current user from server
    socket.emit("getMe");

    // Listen for 'me' event to check authentication
    const onMe = (data: { username: string | null }) => {
      if (!data.username) {
        router.push('/login');
        return;
      }
      setIsCheckingAuth(false);
    };

    // Listen for create_group_success event
    const onCreateGroupSuccess = (data: { message: string; group_name: string }) => {
      console.log("Group created successfully:", data.group_name);
      setSuccessMessage(data.message);
      setErrorMessage('');
      
      // Redirect to the group chat after a short delay
      setTimeout(() => {
        router.push(`/group/${data.group_name}`);
      }, 1500);
    };

    // Listen for create_group_error event
    const onCreateGroupError = (data: { message: string }) => {
      console.error("Group creation error:", data.message);
      setErrorMessage(data.message);
      setSuccessMessage('');
    };

    // Add the listeners
    socket.on("me", onMe);
    socket.on("create_group_success", onCreateGroupSuccess);
    socket.on("create_group_error", onCreateGroupError);

    // Cleanup function
    return () => {
      socket.off("me", onMe);
      socket.off("create_group_success", onCreateGroupSuccess);
      socket.off("create_group_error", onCreateGroupError);
    };
  }, [router]);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleCreateGroup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate group name
    if (!groupName.trim()) {
      setErrorMessage('Group name cannot be empty');
      return;
    }

    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');

    // Emit create_group event to server
    socket.emit('create_group', { group_name: groupName.trim() });
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 bg-[url('/backgrounds/background_Dramatic.jpg')] bg-cover bg-center bg-fixed" />
      <div className="absolute inset-0 bg-black/40" />

      <main className="relative z-10 flex flex-col flex-grow items-center justify-center px-4 py-10">
        <CreateGroupCard
          groupName={groupName}
          onGroupNameChange={(value) => setGroupName(sanitizeGroupName(value))}
          onSubmit={handleCreateGroup}
          onCancel={() => router.push("/")}
          errorMessage={errorMessage}
          successMessage={successMessage}
        />
      </main>
    </div>
  );
}

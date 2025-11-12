"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/socket';

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const username = localStorage.getItem('username');
    if (!username) {
      router.push('/login');
      return;
    }

    // Make sure socket is connected
    socket.connect();

    // Listen for create_group_success event
    const onCreateGroupSuccess = (data: { message: string; group_name: string }) => {
      console.log('Group created successfully:', data.group_name);
      setSuccessMessage(data.message);
      setErrorMessage('');
      
      // Redirect to the group chat after a short delay
      setTimeout(() => {
        router.push(`/group/${data.group_name}`);
      }, 1500);
    };

    // Listen for create_group_error event
    const onCreateGroupError = (data: { message: string }) => {
      console.error('Group creation error:', data.message);
      setErrorMessage(data.message);
      setSuccessMessage('');
    };

    // Add the listeners
    socket.on('create_group_success', onCreateGroupSuccess);
    socket.on('create_group_error', onCreateGroupError);

    // Cleanup function
    return () => {
      socket.off('create_group_success', onCreateGroupSuccess);
      socket.off('create_group_error', onCreateGroupError);
    };
  }, [router]);

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
    <div className="min-h-screen bg-gray-300 flex items-center justify-center px-6">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Create New Group</h1>

        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter group name"
              autoFocus
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errorMessage}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            className="cursor-pointer w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Create Group
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="cursor-pointer w-full bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

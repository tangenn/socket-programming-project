import React from "react";

type User = {
  name: string;
  avatar?: string;
};

type UsersPanelProps = {
  currentUser: User;
  connectedUsers: User[];
};

export function UsersPanel({ currentUser, connectedUsers }: UsersPanelProps) {
  return (
    <div className="bg-gray-200/60 rounded-3xl shadow-md p-8 w-full max-w-md max-h-[70vh] overflow-y-auto max-h-[70vh] overflow-y-auto">
      <div className="bg-white w-full p-4 rounded-xl shadow flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
        <span className="font-semibold flex-1">{currentUser.name}</span>
      </div>

      <button className="bg-white px-4 py-2 rounded-md shadow-sm mb-6 font-semibold hover:bg-gray-100 transition">
        Change your avatar
      </button>

      <h2 className="font-semibold mb-3">Connected Users</h2>

      {connectedUsers.map((u) => (
        <div key={u.name} className="bg-white w-full p-4 mb-3 rounded-xl shadow flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
          <span className="font-semibold flex-1">{u.name}</span>
          <button className="px-3 py-1 bg-gray-200 rounded-md font-medium hover:bg-gray-300 transition">Chat</button>
        </div>
      ))}
    </div>
  );
}
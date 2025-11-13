'use client'
import { ChatInput } from "./ChatInput";
import { ChatMessages, MessageType } from "./ChatMessages";
import { RPSSelector } from "./RPSSelector";
import React from "react";
import { getAvatar } from "@/utils/avatarMap";

type PrivateChatProps = {
  user: { name: string; avatarId?: number };
  messages: MessageType[];
};

export function PrivateChatLayout({ user, messages }: PrivateChatProps) {
  const [showRPS, setShowRPS] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-300 p-10 flex flex-col items-center gap-6">
      <div className="flex items-center gap-3 w-full max-w-3xl">
        <img
          className="w-12 h-12 rounded-full object-cover"
          src={getAvatar(user.avatarId)}
          alt="pfp"
        />
        <h1 className="text-xl font-semibold">{user.name}</h1>
      </div>

      <div className="w-full max-w-3xl">
        <ChatMessages messages={messages} isGroup={false} shrink={showRPS} />
        <div className="mt-4">
          <RPSSelector open={showRPS} />
          <ChatInput onToggleRPS={() => setShowRPS(v => !v)} />
        </div>
      </div>
    </div>
  );
}

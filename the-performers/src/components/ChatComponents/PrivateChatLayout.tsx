"use client";
import { ChatInput } from "./ChatInput";
import { ChatMessages, MessageType } from "./ChatMessages";
import { RPSSelector } from "./RPSSelector";
import React from "react";
import { getAvatar } from "@/utils/avatarMap";

type PrivateChatProps = {
  user: { name: string; avatarId?: number };
  messages: MessageType[];
  onSendMessage?: (content: string) => void;
};

export function PrivateChatLayout({
  user,
  messages,
  onSendMessage,
}: PrivateChatProps) {
  const [showRPS, setShowRPS] = React.useState(false);

  return (

    <div className="min-h-screen relative flex justify-center items-start p-10">
      {/* --- Background Comic Wallpaper --- */}
      <div className="absolute inset-0 bg-[url('/backgrounds/background_Noir.jpg')] bg-cover bg-center bg-fixed opacity-90" />

      {/* --- Main Comic Panel --- */}
      <div
        className="
          relative w-full max-w-6xl
          bg-white/75
          backdrop-blur 
          rounded-[32px]
          border-4 border-black
          shadow-[12px_12px_0px_#000]
          p-10 
        "
      >
        {/* Header (Avatar + Name) */}
        <div className="w-full flex items-center gap-4 mb-6">
          <img
            className="w-18 h-18 rounded-full border-5 border-black"
            src={getAvatar(user.avatarId)}
            alt={user.name}
          />

          <h1
            className="text-4xl font-extrabold tracking-wide"
            style={{ fontFamily: "'Bangers', sans-serif" }}
          >
            {user.name}
          </h1>
        </div>

        {/* Chat Section */}
        <div className="flex flex-col w-full">
          <ChatMessages messages={messages} isGroup={false} shrink={showRPS} />

          <div className="mt-4">
            <RPSSelector open={showRPS} />
            <ChatInput
              onToggleRPS={() => setShowRPS((v) => !v)}
              onSendMessage={onSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

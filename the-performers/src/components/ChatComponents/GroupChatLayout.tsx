'use client';

import { MemberList } from "./MemberList";
import { ChatInput } from "./ChatInput";
import { ChatMessages, MessageType } from "./ChatMessages";
import { RPSSelector } from "./RPSSelector";
import React from "react";

export function GroupChatLayout({
  groupName,
  members,
  messages,
}: {
  groupName: string;
  members: { name: string; avatarId: number }[];
  messages: MessageType[];
}) {
  const [showRPS, setShowRPS] = React.useState(false);

  return (
    <div className="min-h-screen relative flex justify-center items-start p-10">

      {/* --- Background Comic Wallpaper --- */}
      <div className="absolute inset-0 bg-[url('/backgrounds/background_Noir.jpg')] bg-cover bg-center bg-fixed opacity-90" />

      {/* --- Main Card --- */}
      <div
        className="
          relative w-full max-w-6xl 
          bg-white/95 
          rounded-[32px]
          border-4 border-black
          shadow-[12px_12px_0px_#000]
          p-10 
        "
      >

        {/* Top Bar */}
        <div className="w-full flex justify-between items-center mb-6">

          <h1
            className="text-3xl font-extrabold tracking-wide"
            style={{ fontFamily: "'Bangers', sans-serif" }}
          >
            {groupName}
          </h1>

          <button
            className="
              px-5 py-2
              bg-red-500 text-white
              rounded-xl
              border-4 border-black
              shadow-[4px_4px_0px_#000]
              active:translate-x-[2px] active:translate-y-[2px]
              hover:bg-red-600 transition
            "
            onClick={() => alert("Delete group clicked")}
          >
            Delete Group
          </button>
        </div>

        {/* Layout Columns */}
        <div className="flex gap-8 w-full">

          {/* --- Chat + Input Section --- */}
          <div className="flex-1">

            <ChatMessages messages={messages} isGroup shrink={showRPS} />

            <div className="mt-4">
              <RPSSelector open={showRPS} />

              <ChatInput onToggleRPS={() => setShowRPS((v) => !v)} />
            </div>

          </div>

          {/* --- Member List --- */}
          <div>
            <MemberList members={members} />
          </div>
        </div>
      </div>
    </div>
  );
}
'use client'
import { MemberList } from "./MemberList";
import { ChatInput } from "./ChatInput";
import { ChatMessages, MessageType } from "./ChatMessages";
import { RPSSelector } from "./RPSSelector";
import React from "react";
export function GroupChatLayout({ groupName, members, messages }: { groupName: string; members: string[]; messages: MessageType[] }) {
  const [showRPS, setShowRPS] = React.useState(false);
  return (
    <div className="min-h-screen bg-gray-300 p-10 flex justify-center">
      <div className="w-full max-w-6xl flex flex-col items-start gap-6">
        <h1 className="text-xl font-semibold">{groupName}</h1>

        <div className="flex gap-6 w-full">
          <div className="flex-1">
            <ChatMessages messages={messages} isGroup={true} shrink={showRPS} />
            <div className="mt-4">
          <RPSSelector open={showRPS} />
          <ChatInput onToggleRPS={() => setShowRPS(v => !v)} />
            </div>
          </div>

          <MemberList members={members} />
        </div>
      </div>
    </div>
  );
}
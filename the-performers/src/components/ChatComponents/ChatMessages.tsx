"use client";
import { useState, useEffect, useRef } from "react";
import { getAvatar } from "@/utils/avatarMap";

export type MessageType = {
  id: string;
  sender: string;
  avatarId?: number;
  timestamp: string;
  isSelf: boolean;
  type: "text" | "challenge" | "challenge_accepted" | "challenge_result";
  text?: string;
  opponent?: string;
  participants?: string[];
};

export function ChatMessages({
  messages,
  isGroup,
  shrink,
}: {
  messages: MessageType[];
  isGroup: boolean;
  shrink?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const [waitingChoice, setWaitingChoice] = useState<string | null>(null);
  const handleChoice = (choice: string) => setWaitingChoice(choice);

  return (
    <div
      ref={scrollRef}
      className={`
        flex flex-col gap-6 p-6 
        rounded-3xl overflow-y-auto 
        comic-panel bg-white/70 backdrop-blur 
        transition-all duration-300 
        ${shrink ? "h-[50vh]" : "h-[60vh]"}
      `}
    >
      {messages.map((m) => {
        // ----------------------------
        // 🔥 Challenge banner UI
        // ----------------------------
        // 🔥 Challenge banner (START)
if (m.type === "challenge") {
  const challengeText = isGroup
    ? m.isSelf
      ? "You challenge others!"
      : `${m.sender} challenges you!`
    : m.isSelf
    ? `You challenge ${m.opponent}!`
    : `${m.sender} challenges you!`;

  return (
    <div key={m.id} className="flex justify-center w-full">
      <div className="comic-card max-w-xl w-full text-center">

        {/* Action Header */}
        <div className="comic-banner-title mb-2">
          ⚡ Challenge Incoming!
        </div>

        <p className="font-semibold text-lg mb-4">{challengeText}</p>

        {!m.isSelf && (
          <div className="flex justify-center gap-4 mt-2">
            {waitingChoice ? (
              <p className="italic text-gray-600">Waiting for your move…</p>
            ) : (
              ["Rock", "Paper", "Scissor"].map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleChoice(choice)}
                  className="comic-btn bg-yellow-200"
                >
                  {choice}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

        // ----------------------------
        // 🔥 Challenge accepted
        // ----------------------------
// 🔥 Challenge accepted banner
if (m.type === "challenge_accepted") {
  let text =
    isGroup && m.participants?.length === 2
      ? `${m.participants[0]} accepted ${m.participants[1]}'s challenge!`
      : m.isSelf
      ? `You accepted ${m.opponent}'s challenge!`
      : `${m.sender} accepted your challenge!`;

  return (
    <div key={m.id} className="flex justify-center w-full">
      <div className="comic-card bg-blue-100 max-w-xl w-full text-center">
        <div className="comic-banner-title text-blue-900 mb-2">
          💥 Challenge Accepted!
        </div>
        <p className="font-bold text-blue-900 text-lg">{text}</p>
      </div>
    </div>
  );
}

        // ----------------------------
        // 🔥 Challenge result
        // ----------------------------
// 🔥 Challenge result banner
if (m.type === "challenge_result") {
  const parts = m.participants ?? [];
  const isDraw = parts.length === 0;

  let text = isDraw
    ? "It's a draw!"
    : parts[0] === "You"
    ? `You won! ${parts[1]} lost.`
    : parts[1] === "You"
    ? `You lost. ${parts[0]} won.`
    : `${parts[0]} defeated ${parts[1]}!`;

  const color = isDraw
    ? "bg-yellow-200"
    : parts[0] === "You"
    ? "bg-green-200"
    : parts[1] === "You"
    ? "bg-red-200"
    : "bg-white";

  return (
    <div key={m.id} className="flex justify-center w-full">
      <div className={`comic-card ${color} max-w-xl w-full text-center`}>
        <div className="comic-banner-title mb-2">
          {isDraw ? "😮 It's a Draw!" : "🔥 Battle Result!"}
        </div>
        <p className="font-bold text-lg">{text}</p>
      </div>
    </div>
  );
}

        // ----------------------------
        // 🔥 Normal incoming message
        // ----------------------------
        if (m.type === "text" && !m.isSelf) {
          return (
            <div key={m.id} className="flex items-start gap-3">
              <img
                src={getAvatar(m.avatarId ?? 1)}
                alt={m.sender}
                className="w-10 h-10 rounded-full comic-img"
              />

              <div className="flex flex-col max-w-[70%]">
                {isGroup && (
                  <span className="font-bold text-sm mb-1 comic-text-strong">
                    {m.sender}
                  </span>
                )}

                <div className="flex gap-2 items-end">
                  <div className="comic-bubble bg-white text-gray-900 px-4 py-2">
                    {m.text}
                  </div>

                  <span className="text-xs text-gray-600">{m.timestamp}</span>
                </div>
              </div>
            </div>
          );
        }

        // ----------------------------
        // 🔥 Normal outgoing message
        // ----------------------------
        if (m.type === "text" && m.isSelf) {
          return (
            <div key={m.id} className="flex justify-end items-start">
              <div className="flex flex-col max-w-[70%] items-end">
                <div className="flex gap-2 items-end">
                  <span className="text-xs text-gray-600">{m.timestamp}</span>

                  <div className="comic-bubble bg-green-100 text-gray-900 px-4 py-2">
                    {m.text}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
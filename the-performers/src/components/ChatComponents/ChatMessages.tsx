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
  challenger_sid?: string; // Add this
};

export function ChatMessages({
  messages,
  isGroup,
  shrink,
  onAcceptChallenge,
}: {
  messages: MessageType[];
  isGroup: boolean;
  shrink?: boolean;
  onAcceptChallenge?: (challengerId: string, selectedRPS: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Track which challenges have been accepted (by message id)
  const [acceptedChallenges, setAcceptedChallenges] = useState<Set<string>>(new Set());

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Update accepted challenges when challenge_accepted messages arrive
  useEffect(() => {
    messages.forEach((m) => {
      if (m.type === "challenge_accepted" || m.type === "challenge_result") {
        // Find the original challenge message and mark it as accepted
        const challengeMsg = messages.find(
          (msg) => msg.type === "challenge" && 
          (msg.sender === m.participants?.[1] || msg.sender === m.participants?.[0])
        );
        if (challengeMsg) {
          setAcceptedChallenges((prev) => new Set(prev).add(challengeMsg.id));
        }
      }
    });
  }, [messages]);

  const handleChoice = (choice: string, challengerId?: string, messageId?: string) => {
    if (!challengerId || !onAcceptChallenge || !messageId) return;
    
    // Prevent double-clicking
    if (acceptedChallenges.has(messageId)) return;
    
    // Map UI choice to backend format
    const rpsMap: Record<string, string> = {
      "✊🏿 ROCK": "rock",
      "🖐🏿 PAPER": "paper",
      "✌🏿 SCISSOR": "scissors",
    };
    
    const selectedRPS = rpsMap[choice] || choice.toLowerCase();
    onAcceptChallenge(challengerId, selectedRPS);
    setAcceptedChallenges((prev) => new Set(prev).add(messageId));
  };

  return (
    <div
      ref={scrollRef}
      className={`
        flex flex-col gap-8 p-6 rounded-3xl overflow-y-auto
        comic-panel bg-white/70 backdrop-blur
        transition-all duration-300
        ${shrink ? "h-[50vh]" : "h-[60vh]"}
      `}
    >
      {messages.map((m, index) => {
        const keyBase = m.id || `${m.sender}-${m.timestamp}`;
        const messageKey = `${keyBase}-${index}`;
        /* ================================
           🔥  CHALLENGE BANNER
        ================================= */
        if (m.type === "challenge") {
          const challengeText = isGroup
            ? m.isSelf
              ? "You challenge others!"
              : `${m.sender} challenges you!`
            : m.isSelf
            ? `You challenge ${m.opponent || (m as any).receiver || "them"}!`  // Fix: use receiver as fallback
            : `${m.sender} challenges you!`;

          const isAccepted = acceptedChallenges.has(m.id);

          return (
            <div key={messageKey} className="flex justify-center w-full">
              <div
                className="comic-card max-w-2xl w-full text-center p-6 bg-white-100/70"
              >
                <div className="comic-banner-title text-yellow-700 mb-3">
                  ⚡ Challenge Incoming!
                </div>

                <p className="font-semibold text-lg mb-4 text-gray-900">{challengeText}</p>

                {!m.isSelf && !isAccepted && (
                  <div className="flex justify-center gap-4">
                    {["✊🏿 ROCK", "🖐🏿 PAPER", "✌🏿 SCISSOR"].map((choice) => (
                      <button
                        key={choice}
                        onClick={() => handleChoice(choice, (m as any).challenger_sid, m.id)}
                        className="comic-choice-btn text-10xl comic-text-strong"
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}
                
                {!m.isSelf && isAccepted && (
                  <p className="italic text-gray-600">
                    Challenge accepted! Waiting for result...
                  </p>
                )}
              </div>
            </div>
          );
        }

        /* ================================
           🔵  CHALLENGE ACCEPTED BANNER
        ================================= */
        if (m.type === "challenge_accepted") {
          let text =
            isGroup && m.participants?.length === 2
              ? `${m.participants[0]} accepted ${m.participants[1]}'s challenge!`
              : m.isSelf
              ? `You accepted ${m.opponent}'s challenge!`
              : `${m.sender} accepted your challenge!`;

          return (
            <div key={messageKey} className="flex justify-center w-full">
              <div
                className="comic-card bg-blue-100/80 max-w-2xl w-full text-center p-6"
              >
                <div className="comic-banner-title text-blue-900 mb-3">
                  💥 Challenge Accepted!
                </div>
                <p className="font-bold text-black-900 text-lg">{text}</p>
              </div>
            </div>
          );
        }

        /* ================================
           🔥  CHALLENGE RESULT BANNER
        ================================= */
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
            ? "bg-yellow-100/80"
            : parts[0] === "You"
            ? "bg-green-200/80"
            : parts[1] === "You"
            ? "bg-red-200/80"
            : "bg-white";

          return (
            <div key={messageKey} className="flex justify-center w-full">
              <div className={`comic-card ${color} max-w-2xl w-full text-center p-6`}>
                <div className="comic-banner-title mb-3">
                  {isDraw ? "😮 It's a Draw!" : "🔥 Battle Result!"}
                </div>
                <p className="font-bold text-lg">{text}</p>
              </div>
            </div>
          );
        }

        /* ================================
           TEXT MESSAGES — INCOMING
        ================================= */
        if (m.type === "text" && !m.isSelf) {
          return (
            <div key={messageKey} className="flex items-start gap-3">
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

        /* ================================
           TEXT MESSAGES — OUTGOING
        ================================= */
        if (m.type === "text" && m.isSelf) {
          return (
            <div key={messageKey} className="flex justify-end items-start">
              <div className="flex flex-col max-w-[70%] items-end">
                <div className="flex gap-2 items-end">
                  <span className="text-xs text-gray-600">{m.timestamp}</span>
                  <div className="comic-bubble bg-red-100 text-gray-900 px-4 py-2">
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
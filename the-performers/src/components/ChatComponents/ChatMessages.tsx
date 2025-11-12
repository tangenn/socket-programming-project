"use client";
import { useState } from "react";
import { avatarMap } from "@/utils/avatarMap";

export type MessageType = {
  id: string;
  sender: string;
  avatarId?: number;
  timestamp: string;
  isSelf: boolean;
  type: "text" | "challenge" | "challenge_accepted" | "challenge_result";
  text?: string;
  opponent?: string;
  participants?: string[]; // winner first, loser second; [] for draw
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
  const [waitingChoice, setWaitingChoice] = useState<string | null>(null);

  const handleChoice = (choice: string) => {
    setWaitingChoice(choice);
    console.log(`Selected ${choice}`);
    // TODO: send to backend
  };

  return (
    <div
      className={`flex flex-col gap-4 p-6 bg-gray-200/60 rounded-3xl overflow-y-auto transition-all duration-300 ${
        shrink ? "h-[50vh]" : "h-[60vh]"
      }`}
    >
      {messages.map((m) => {
        // 🧱 Challenge initiated (now includes self too, but no buttons)
        if (m.type === "challenge") {
          const challengeText = isGroup
            ? m.isSelf
              ? "You challenge others"
              : `${m.sender} challenges you`
            : m.isSelf
              ? `You challenge ${m.opponent}`
              : `${m.sender} challenges you`;

          return (
            <div key={m.id} className="w-full flex justify-center my-4">
              <div className="bg-white px-8 py-6 rounded-2xl shadow text-center max-w-lg w-full">
                <p className="font-semibold text-gray-800 mb-3">{challengeText}</p>
                {!m.isSelf && (
                  <div className="flex justify-center gap-4">
                    {waitingChoice ? (
                      <p className="text-gray-500 font-medium">Waiting...</p>
                    ) : (
                      ["Rock", "Paper", "Scissor"].map((choice) => (
                        <button
                          key={choice}
                          onClick={() => handleChoice(choice)}
                          className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition"
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

        // 🧩 Challenge accepted
        if (m.type === "challenge_accepted") {
          let acceptText;
          if (isGroup) {
            acceptText =
              m.participants && m.participants.length === 2
                ? `${m.participants[0]} accepted ${m.participants[1]}'s challenge`
                : `${m.sender} accepted a challenge`;
          } else {
            acceptText = m.isSelf
              ? `You accepted ${m.opponent}'s challenge`
              : `${m.sender} accepted your challenge`;
          }

          return (
            <div key={m.id} className="w-full flex justify-center my-4">
              <div className="bg-blue-100 text-blue-800 px-8 py-6 rounded-2xl shadow text-center max-w-lg w-full">
                <p className="font-semibold">{acceptText}</p>
              </div>
            </div>
          );
        }

        // 🏆 Challenge result
        if (m.type === "challenge_result") {
          const participants = m.participants ?? [];
          const isDraw = participants.length === 0;
          const winner = participants[0];
          const loser = participants[1];

          const isSpectator = !isDraw && !participants.includes("You");
          const youWin = winner === "You";
          const youLose = loser === "You";

          let resultText = "";
          if (isDraw) resultText = "It's a draw!";
          else if (isSpectator) resultText = `${winner} won against ${loser}.`;
          else if (youWin) resultText = `You won. ${loser} lost.`;
          else if (youLose) resultText = `You lost. ${winner} won.`;

          const colorClass = isDraw
            ? "bg-yellow-100 text-yellow-800"
            : youWin
            ? "bg-green-100 text-green-800"
            : youLose
            ? "bg-red-100 text-red-800"
            : "bg-white text-gray-700";

          return (
            <div key={m.id} className="w-full flex justify-center my-4">
              <div
                className={`${colorClass} px-8 py-6 rounded-2xl shadow text-center max-w-lg w-full font-semibold`}
              >
                {resultText}
              </div>
            </div>
          );
        }

        // 💬 Normal messages
        if (m.type === "text") {
          return (
            <div
              key={m.id}
              className={`flex items-start ${
                m.isSelf ? "justify-end" : "justify-start"
              }`}
            >
              {/* Other user's message */}
              {!m.isSelf && (
                <>
                  <img
                    src={avatarMap[m.avatarId ?? 1]}
                    alt={m.sender}
                    className="w-8 h-8 rounded-full mr-3 self-end"
                  />
                  <div className="flex flex-col items-start">
                    {isGroup && (
                      <span className="text-sm text-gray-700 font-semibold mb-1">
                        {m.sender}
                      </span>
                    )}
                    <div className="flex flex-col items-start max-w-[70%]">
                      <div className="px-4 py-2 rounded-xl shadow bg-white text-gray-800 min-w-[3rem]">
                        <p className="break-words">{m.text}</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Self message */}
              {m.isSelf && (
                <>
                  <div className="flex flex-col items-end max-w-[70%]">
                    <div className="px-4 py-2 rounded-xl shadow bg-blue-500 text-white min-w-[3rem]">
                      <p className="break-words">{m.text}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {m.timestamp}
                    </span>
                  </div>
                  <img
                    src={avatarMap[m.avatarId ?? 1]}
                    alt={m.sender}
                    className="w-8 h-8 rounded-full ml-3 self-end"
                  />
                </>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

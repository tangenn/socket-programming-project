// MessageType Types
export type MessageType = {
  id: string;
  sender: string;
  avatar?: string;
  timestamp: string;
  isSelf: boolean;
  type: "text" | "rps" | "challenge" | "challenge_result";
  text?: string;
  rps?: "rock" | "paper" | "scissor";
  challengeStatus?: "waiting" | "accepted";
  result?: "win" | "lose" | "draw";
};

// Scrollable chat list
export function ChatMessages({ messages, isGroup }: { messages: MessageType[]; isGroup: boolean }) {
  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-200/60 rounded-3xl h-[60vh] overflow-y-auto">
      {messages.map((m) => (
        <div key={m.id} className={`flex ${m.isSelf ? "justify-end" : "justify-start"}`}>
          <div className="max-w-xs">
            {/* Group chat sender info */}
            {isGroup && !m.isSelf && (
              <div className="flex items-center mb-1 gap-2 text-sm">
                <img className="w-6 h-6 rounded-full object-cover" src={m.avatar ?? "/fallback.png"} alt="pfp" />
                <span className="font-semibold">{m.sender}</span>
              </div>
            )}

            {/* MessageType bubbles */}
            {m.type === "text" && (
              <div className="bg-white px-4 py-2 rounded-xl shadow">{m.text}</div>
            )}

            {m.type === "rps" && (
              <div className="bg-white px-4 py-2 rounded-xl shadow font-semibold capitalize">{m.rps}</div>
            )}

            {m.type === "challenge" && (
              <div className="bg-white px-4 py-2 rounded-xl shadow">
                {m.isSelf ? "Challenge created. Waiting for an opponent." : `${m.sender} challenges you.`}
              </div>
            )}

            {m.type === "challenge_result" && (
              <div className="bg-white px-4 py-2 rounded-xl shadow font-semibold">
                {m.challengeStatus === "accepted" && `${m.sender} accepts your challenge.`}
                {m.result === "win" && <div className="mt-2">You won.</div>}
                {m.result === "lose" && <div className="mt-2">You lost.</div>}
                {m.result === "draw" && <div className="mt-2">Draw.</div>}
              </div>
            )}

            <div className={`text-xs mt-1 ${m.isSelf ? "text-right" : "text-left"}`}>{m.timestamp}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
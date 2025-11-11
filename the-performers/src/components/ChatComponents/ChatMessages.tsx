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
export function ChatMessages({ messages, isGroup, shrink }: { messages: MessageType[]; isGroup: boolean; shrink?: boolean }) {
  return (
    <div className={`flex flex-col gap-6 p-6 bg-gray-200/60 rounded-3xl overflow-y-auto transition-all duration-300 ${shrink ? "h-[50vh]" : "h-[60vh]"}`}>
      {messages.map((m) => {
        if (isGroup) {
          return (
            <div key={m.id} className={`flex ${m.isSelf ? "justify-end" : "justify-start"}`}>
              {!m.isSelf && (
                <img className="w-10 h-10 rounded-full object-cover mr-3 mt-1" src={m.avatar ?? "/fallback.png"} alt="pfp" />
              )}
              <div className={`flex ${m.isSelf ? "flex-row-reverse" : "flex-row"} items-start gap-3 max-w-[75%]`}>
                <div className="flex flex-col">
                  <span className="font-semibold mb-1">{m.sender}</span>
                  <div className="bg-white px-4 py-2 rounded-xl shadow">
                    {m.type === "text" && m.text}
                    {m.type === "rps" && <span className="font-semibold capitalize">{m.rps}</span>}
                    {m.type === "challenge" && (
                      <span>{m.isSelf ? "Challenge created. Waiting for an opponent." : `${m.sender} challenges you.`}</span>
                    )}
                    {m.type === "challenge_result" && (
                      <span className="font-semibold">
                        {m.challengeStatus === "accepted" ? `${m.sender} accepts your challenge.` : ""}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm leading-6 mt-7">{m.timestamp}</span>
              </div>
              {m.isSelf && (
                <img className="w-10 h-10 rounded-full object-cover ml-3 mt-1" src={m.avatar ?? "/fallback.png"} alt="pfp" />
              )}
            </div>
          );
        }
        return (
          <div key={m.id} className={`flex ${m.isSelf ? "justify-end" : "justify-start"}`}>
            <div className={`flex ${m.isSelf ? "flex-row-reverse" : "flex-row"} items-center gap-3 max-w-[75%]`}>
              <div className="bg-white px-4 py-2 rounded-xl shadow">
                {m.type === "text" && m.text}
                {m.type === "rps" && <span className="font-semibold capitalize">{m.rps}</span>}
                {m.type === "challenge" && (
                  <span>{m.isSelf ? "Challenge created. Waiting for an opponent." : `${m.sender} challenges you.`}</span>
                )}
                {m.type === "challenge_result" && (
                  <span className="font-semibold">
                    {m.challengeStatus === "accepted" ? `${m.sender} accepts your challenge.` : ""}
                  </span>
                )}
              </div>
              <span className="text-sm">{m.timestamp}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
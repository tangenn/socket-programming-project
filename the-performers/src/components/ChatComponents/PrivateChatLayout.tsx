import { ChatInput } from "./ChatInput";
import { ChatMessages, MessageType } from "./ChatMessages";
import { RPSSelector } from "./RPSSelector";

type PrivateChatProps = {
  user: { name: string; avatar?: string };
  messages: MessageType[];
};

export function PrivateChatLayout({ user, messages }: PrivateChatProps) {
  return (
    <div className="min-h-screen bg-gray-300 p-10 flex flex-col items-center gap-6">
      <div className="flex items-center gap-3 w-full max-w-3xl">
        <img className="w-12 h-12 rounded-full object-cover" src={user.avatar ?? "/fallback.png"} alt="pfp" />
        <h1 className="text-xl font-semibold">{user.name}</h1>
      </div>

      <div className="w-full max-w-3xl">
        <RPSSelector open={false} />
        <ChatMessages messages={messages} isGroup={false} />
        <div className="mt-4">
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
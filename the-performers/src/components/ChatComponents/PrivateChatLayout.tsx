import { ChatInput } from "./ChatInput";
import { ChatMessages, MessageType } from "./ChatMessages";
import { RPSSelector } from "./RPSSelector";

export function PrivateChatLayout({ user, messages }: { user: { name: string }; messages: MessageType[] }) {
  return (
    <div className="min-h-screen bg-gray-300 p-10 flex flex-col items-start gap-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-300" />
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
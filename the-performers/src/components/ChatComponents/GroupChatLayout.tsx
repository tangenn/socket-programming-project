import { MemberList } from "./MemberList";
import { ChatInput } from "./ChatInput";
import { ChatMessages, MessageType } from "./ChatMessages";
import { RPSSelector } from "./RPSSelector";

export function GroupChatLayout({ groupName, members, messages }: { groupName: string; members: string[]; messages: MessageType[] }) {
  return (
    <div className="min-h-screen bg-gray-300 p-10 flex justify-center">
      <div className="w-full max-w-6xl flex flex-col items-start gap-6">
        <h1 className="text-xl font-semibold">{groupName}</h1>

        <div className="flex gap-6 w-full">
          <div className="flex-1">
            <RPSSelector open={false} />
            <ChatMessages messages={messages} isGroup={true} />
            <div className="mt-4">
              <ChatInput />
            </div>
          </div>

          <MemberList members={members} />
        </div>
      </div>
    </div>
  );
}

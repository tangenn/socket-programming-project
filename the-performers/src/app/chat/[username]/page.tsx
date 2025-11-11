import { PrivateChatLayout } from "@/components/ChatComponents/PrivateChatLayout";
import { ChatMessages, MessageType } from "@/components/ChatComponents/ChatMessages";

export default function Page({ params }: { params: { username: string } }) {
  const { username } = params;

  // later you'll fetch:
  // const messages = await getChat(username)

  const mockMessages: MessageType[] = [
  {
    id: "1",
    sender: "Aea",
    timestamp: "11.11",
    isSelf: false,
    type: "text",
    text: "CUH",
  },
];

  return <PrivateChatLayout user={{ name: username }} messages={mockMessages} />;
}
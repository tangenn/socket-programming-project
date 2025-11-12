import { PrivateChatLayout } from "@/components/ChatComponents/PrivateChatLayout";
import { MessageType } from "@/components/ChatComponents/ChatMessages";

// Mock Data
const privateChatMessages: MessageType[] = [
  {
    id: "1",
    sender: "Aea",
    avatarId: 1,
    timestamp: "11:01",
    isSelf: false,
    type: "text",
    text: "Hey! want to play RPS?",
  },
  {
    id: "2",
    sender: "You",
    avatarId: 2,
    timestamp: "11:02",
    isSelf: true,
    type: "challenge",
    opponent: "Aea",
  },
  {
    id: "3",
    sender: "Aea",
    avatarId: 1,
    timestamp: "11:03",
    isSelf: false,
    type: "challenge_accepted",
    opponent: "You",
  },
  {
    id: "4",
    sender: "System",
    timestamp: "11:04",
    isSelf: false,
    type: "challenge_result",
    opponent: "Aea",
  },
  {
    id: "5",
    sender: "Aea",
    avatarId: 1,
    timestamp: "11:05",
    isSelf: false,
    type: "text",
    text: "gg",
  },
];


export default function Page({ params }: { params: { username: string } }) {
  const { username } = params;

 

  return <PrivateChatLayout user={{ name: username }} messages={privateChatMessages} />;
}
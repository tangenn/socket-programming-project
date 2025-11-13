import { PrivateChatLayout } from "@/components/ChatComponents/PrivateChatLayout";
import { MessageType } from "@/components/ChatComponents/ChatMessages";

// Mock Data
const privateChatMessages: MessageType[] = [
  {
    id: "21",
    sender: "KSI",
    avatarId: 15,
    timestamp: "11:01",
    isSelf: false,
    type: "text",
    text: "long message test to see how the message box handles it when the text is really long and needs to wrap around to the next line properly without breaking the layout or causing any overflow issues in the chat interface.",
  },
  {
    id: "22",
    sender: "You",
    avatarId: 10,
    timestamp: "11:01",
    isSelf: true,
    type: "text",
    text: "long message test to see how the message box handles it when the text is really long and needs to wrap around to the next line properly without breaking the layout or causing any overflow issues in the chat interface.",
  },
  {
    id: "1",
    sender: "KSI",
    avatarId: 15,
    timestamp: "11:01",
    isSelf: false,
    type: "text",
    text: "Hey! want to play RPS?",
  },
  {
    id: "11",
    sender: "You",
    avatarId: 10,
    timestamp: "11:01",
    isSelf: true,
    type: "text",
    text: "Let's do it!",
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
    avatarId: 15,
    timestamp: "11:05",
    isSelf: false,
    type: "text",
    text: "gg",
  },
  {
    id: "2",
    sender: "Aea",
    avatarId: 2,
    timestamp: "11:02",
    isSelf: false,
    type: "challenge",
    opponent: "You",
  },
  {
    id: "12",
    sender: "You",
    avatarId: 2,
    timestamp: "11:02",
    isSelf: true,
    type: "challenge",
    opponent: "Aea",
  },
];

const userAvatarId = 15;


export default function Page({ params }: { params: { username: string } }) {
  const { username } = params;

 

  return <PrivateChatLayout user={{ name: username, avatarId: userAvatarId}} messages={privateChatMessages} />;
}
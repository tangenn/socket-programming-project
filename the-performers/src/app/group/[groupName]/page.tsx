import { GroupChatLayout } from "@/components/ChatComponents/GroupChatLayout";
import { MessageType } from "@/components/ChatComponents/ChatMessages";

// Mock Data
const groupMessages: MessageType[] = [
  {
    id: "1",
    sender: "Tan",
    avatarId: 1,
    timestamp: "11:00",
    isSelf: false,
    type: "text",
    text: "Anyone up for RPS?",
  },
  {
    id: "3",
    sender: "Aea",
    avatarId: 8,
    timestamp: "11:03",
    isSelf: false,
    type: "challenge_accepted",
    participants: ["Aea", "Tan"],
  },
  {
    id: "4",
    sender: "System",
    timestamp: "11:04",
    isSelf: false,
    type: "challenge_result",
    participants: [],
  },
  {
    id: "5",
    sender: "You",
    avatarId: 2,
    timestamp: "11:05",
    isSelf: true,
    type: "text",
    text: "Let's do more",
  },
  {
    id: "6",
    sender: "Tan",
    avatarId: 1,
    timestamp: "11:05",
    isSelf: false,
    type: "text",
    text: "Sure thing!",
  },
  {
    id: "7",
    sender: "Aea",
    avatarId: 8,
    timestamp: "11:06",
    isSelf: false,
    type: "challenge_accepted",
    participants: ["Tan", "You"],
  },
  {
    id: "8",
    sender: "System",
    timestamp: "11:06",
    isSelf: true,
    type: "challenge_result",
    participants: ["Tan", "You"],
  },
  {
    id: "9",
    sender: "Tan",
    avatarId: 1,
    timestamp: "11:06",
    isSelf: false,
    type: "text",
    text: "ez",
  },
  {
    id: "10",
    sender: "You",
    avatarId: 2,
    timestamp: "11:06",
    isSelf: true,
    type: "text",
    text: "again",
  },
  {
    id: "11",
    sender: "You",
    avatarId: 2,
    timestamp: "11:06",
    isSelf: true,
    type: "challenge",
  },
  {
    id: "12",
    sender: "Mhee",
    avatarId: 2,
    timestamp: "11:06",
    isSelf: false,
    type: "challenge",
  },
  {
    id: "13",
    sender: "You",
    avatarId: 2,
    timestamp: "11:16",
    isSelf: true,
    type: "text",
    text: "long text to test wrapping behavior in the chat message bubble. Let's see how it looks when the text is really long and needs to wrap onto multiple lines.",
  },
  {
    id: "14",
    sender: "Aea",
    avatarId: 8,
    timestamp: "11:16",
    isSelf: false,
    type: "text",
    text: "long text to test wrapping behavior in the chat message bubble. Let's see how it looks when the text is really long and needs to wrap onto multiple lines.",
  },
  {
    id: "15",
    sender: "Mhee",
    avatarId: 0,
    timestamp: "11:17",
    isSelf: false,
    type: "text",
    text: "long text to test wrapping behavior in the chat message bubble. Let's see how it looks when the text is really long and needs to wrap onto multiple lines. Adding even more text to ensure it wraps correctly across multiple lines in the chat interface.",
  },
  {
    id: "16",
    sender: "You",
    avatarId: 2,
    timestamp: "11:17",
    isSelf: true,
    type: "text",
    text: "long text to test wrapping behavior in the chat message bubble. Let's see how it looks when the text is really long and needs to wrap onto multiple lines. Adding even more text to ensure it wraps correctly across multiple lines in the chat interface.",
  },
];

const groupMembers = [
  { name: "Tan1", avatarId: 1 },
  { name: "Tan2", avatarId: 2 },
  { name: "Tan3", avatarId: 3 },
  { name: "Tan4", avatarId: 4 },
  { name: "Tan5", avatarId: 5 },
  { name: "Tan6", avatarId: 6 },
  { name: "Tan7", avatarId: 7 },
  { name: "Aea", avatarId: 8 },
  { name: "Tan9", avatarId: 9 },
  { name: "Tan10", avatarId: 10 },
  { name: "Tan11", avatarId: 11 },
  { name: "Tan12", avatarId: 12 },
  { name: "Tan13", avatarId: 13 },
  { name: "Tan14", avatarId: 14 },
  { name: "Tan15", avatarId: 15 }, 
  { name: "Tan16", avatarId: 16 },
  { name: "Tan17", avatarId: 17 },
  { name: "Tan18", avatarId: 18 },
  { name: "Tan19", avatarId: 19 },
  { name: "Tan20", avatarId: 20 },
  { name: "Tan21", avatarId: 21 },
  { name: "Tan22", avatarId: 22 },
  { name: "Tan23", avatarId: 23 },
  { name: "Tan24", avatarId: 24 },
  { name: "Tan25", avatarId: 25 },
];

export default function Page({ params }: { params: { groupName: string } }) {
  const { groupName } = params;


  return (
    <GroupChatLayout
      groupName={groupName}
      members={groupMembers}
      messages={groupMessages}
    />
  );
}
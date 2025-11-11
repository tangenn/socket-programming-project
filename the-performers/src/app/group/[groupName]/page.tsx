import { GroupChatLayout } from "@/components/ChatComponents/GroupChatLayout";
import { ChatMessages, MessageType } from "@/components/ChatComponents/ChatMessages";

export default function Page({ params }: { params: { groupName: string } }) {
  const { groupName } = params;

  const mockMessages: MessageType[] = [
  {
    id: "1",
    sender: "Aea",
    timestamp: "11.11",
    isSelf: false,
    type: "text",
    text: "CUH",
  },
  {
    id: "2",
    sender: "Aea",
    timestamp: "11.11",
    isSelf: false,
    type: "text",
    text: "CUH",
  },
  {
    id: "3",
    sender: "Aea",
    timestamp: "11.11",
    isSelf: false,
    type: "text",
    text: "CUH",
  },
  {
    id: "4",
    sender: "Aea",
    timestamp: "11.11",
    isSelf: true,
    type: "text",
    text: "CUH",
  },
  {
    id: "6",
    sender: "Aea",
    timestamp: "11.11",
    isSelf: true,
    type: "text",
    text: "CUH",
  },
];

  return (
    <GroupChatLayout
      groupName={groupName}
      members={["SYBAU1", "SYBAU2", "SYBAU3", "SYBAU4", "SYBAU5", "SYBAU6", "SYBAU7", "SYBAU8", "SYBAU9", "SYBAU10", "SYBAU11", "SYBAU12", "SYBAU13", "SYBAU14", "SYBAU15"]}
      messages={mockMessages}
    />
  );
}
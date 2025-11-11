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
      members={["Aea", "SYBAU", "Zagif"]}
      messages={mockMessages}
    />
  );
}
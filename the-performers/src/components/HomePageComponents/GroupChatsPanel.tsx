type Group = {
  name: string;
  members: string[];
};

type GroupChatsPanelProps = {
  joinedGroups: Group[];
  otherGroups: Group[];
};

export function GroupChatsPanel({ joinedGroups, otherGroups }: GroupChatsPanelProps) {
  return (
    <div className="bg-gray-200/60 rounded-3xl shadow-md p-8 w-full max-w-md max-h-[70vh] overflow-y-auto">
      <h2 className="font-semibold mb-4">Joined Group Chats</h2>

      {joinedGroups.map((g) => (
        <div key={g.name} className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
            <span className="font-semibold flex-1">{g.name}</span>
            <button className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition font-medium">Chat</button>
          </div>
          <p className="text-sm">Members: {g.members.join(", ")}</p>
        </div>
      ))}

      <h2 className="font-semibold mb-4">Other Group Chats</h2>

      {otherGroups.map((g) => (
        <div key={g.name} className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
            <span className="font-semibold flex-1">{g.name}</span>
            <button className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition font-medium">Join</button>
          </div>
          <p className="text-sm">Members: {g.members.join(", ")}</p>
        </div>
      ))}

      <button className="bg-white px-4 py-2 rounded-md shadow-sm font-semibold hover:bg-gray-100 transition">Create a new group</button>
    </div>
  );
}
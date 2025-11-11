export function MemberList({ members }: { members: string[] }) {
  return (
    <div className="bg-gray-200/60 rounded-3xl shadow-md p-6 w-48 h-[60vh] overflow-y-auto">
      <h2 className="font-semibold mb-4">Members</h2>
      {members.map((m) => (
        <p key={m} className="mb-2">{m}</p>
      ))}
    </div>
  );
}
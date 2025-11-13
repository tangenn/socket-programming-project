import { getAvatar } from "@/utils/avatarMap";

export function MemberList({
  members,
}: {
  members: { name: string; avatarId: number }[];
}) {
  return (
    <div className="bg-gray-200/60 rounded-3xl shadow-md p-6 w-56 h-[60vh] overflow-y-auto">
      <h2 className="font-semibold mb-4">Members</h2>

      <div className="flex flex-col gap-3">
        {members.map((m) => (
          <div key={m.name} className="flex items-center gap-3">
            <img
              src={getAvatar(m.avatarId)}
              alt={m.name}
              className="w-10 h-10 rounded-full"
            />
            <span className="text-gray-800">{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
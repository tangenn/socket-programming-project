import { getAvatar } from "@/utils/avatarMap";

export function MemberList({
  members,
}: {
  members: { name: string; avatarId: number }[];
}) {
  return (
    <div
      className="
        bg-[#ffffffdd]
        border-4 border-black
        shadow-[8px_8px_0px_#000]
        rounded-[32px]
        p-6 
        w-64
        h-[60vh]
        overflow-y-auto
      "
    >
      <h2
        className="
          mb-4 
          text-xl 
          font-bold 
          tracking-wide
        "
        style={{ fontFamily: "'Bangers', sans-serif" }}
      >
        MEMBERS
      </h2>

      <div className="flex flex-col gap-4">
        {members.map((m) => (
          <div
            key={m.name}
            className="
              flex items-center gap-3 
              bg-white
              border-2 border-black
              rounded-2xl
              px-3 py-2
              shadow-[4px_4px_0px_#000]
            "
          >
            <img
              src={getAvatar(m.avatarId)}
              alt={m.name}
              className="
                w-10 h-10 
                rounded-full 
                border-2 border-black
                object-cover
              "
            />
            <span className="font-medium text-gray-800">{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
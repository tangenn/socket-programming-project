"use client";

import { avatarMap } from "@/utils/avatarMap";

export function AvatarSelectionCard() {
  const avatars = Object.entries(avatarMap);

  return (
    <div
      className="
        max-w-3xl mx-auto p-10
        rounded-[32px]
        bg-white/90
        border-4 border-black
        shadow-[10px_10px_0px_#000]
      "
    >
      <h1
        className="
          text-4xl text-center mb-10 font-bold comic-title
          tracking-wide
        "
      >
        SELECT YOUR AVATAR
      </h1>

      <div className="grid grid-cols-5 gap-8 justify-items-center">
        {avatars.map(([id, src]) => (
          <button
            key={id}
            className="
              p-1 rounded-full
              border-4 border-black
              bg-white
              shadow-[4px_4px_0px_#000]
              transition-transform
              hover:scale-110 active:scale-95
            "
          >
            <img src={src} className="w-20 h-20 rounded-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
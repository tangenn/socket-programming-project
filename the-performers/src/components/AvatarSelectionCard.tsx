"use client";

import { avatarMap } from "@/utils/avatarMap";

export function AvatarSelectionCard() {
  const avatars = Object.entries(avatarMap);

  return (
    <div className="bg-gray-200/60 p-10 rounded-3xl shadow-md w-full max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">Select your avatar</h1>
      <div className="grid grid-cols-5 gap-6 justify-items-center">
        {avatars.map(([id, src]) => (
          <button
            key={id}
            className="focus:outline-none hover:scale-105 transition-transform"
            onClick={() => {
              // TODO: handle avatar selection later
              console.log(`Selected avatar: ${id}`);
            }}
          >
            <img
              src={src}
              alt={`Avatar ${id}`}
              className="w-20 h-20 rounded-full object-cover border-2 border-transparent hover:border-gray-400"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
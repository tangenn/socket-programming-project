"use client";

import { avatarMap } from "@/utils/avatarMap";
import { socket } from "@/socket";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function AvatarSelectionCard() {
  const avatars = Object.entries(avatarMap);
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Listen for avatar selection confirmation from server
    const handleAvatarSelected = (data: { avatarId: number }) => {
      console.log("Avatar selected successfully:", data.avatarId);
      setIsSubmitting(false);
      // Navigate to chat page after successful avatar selection
      router.push("/");
    };

    socket.on("avatar_selected", handleAvatarSelected);

    return () => {
      socket.off("avatar_selected", handleAvatarSelected);
    };
  }, [router]);

  const handleAvatarClick = (id: string) => {
    const avatarId = parseInt(id);
    setSelectedAvatar(avatarId);
    setIsSubmitting(true);
    
    // Emit avatar selection to backend
    socket.emit("select_avatar", { avatarId });
  };

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
            onClick={() => handleAvatarClick(id)}
            disabled={isSubmitting}
            className={`
              p-1 rounded-full
              border-4 border-black
              bg-white
              shadow-[4px_4px_0px_#000]
              transition-transform
              hover:scale-110 active:scale-95
              ${selectedAvatar === parseInt(id) ? "ring-4 ring-blue-500" : ""}
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <img src={src} className="w-20 h-20 rounded-full object-cover" />
          </button>
        ))}
      </div>

      {isSubmitting && (
        <p className="text-center mt-6 text-gray-600">Saving avatar...</p>
      )}
    </div>
  );
}
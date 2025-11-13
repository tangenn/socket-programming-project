export function ChatInput({ onToggleRPS }: { onToggleRPS: () => void }) {
  return (
    <div className="flex items-center w-full gap-3 mt-2">

      {/* TEXT INPUT BUBBLE */}
      <div
        className="
          flex items-center flex-1 
          bg-white 
          border-4 border-black 
          rounded-full 
          px-4 py-2 
          shadow-[4px_4px_0px_#000]
        "
      >
        <input
          className="flex-1 outline-none text-gray-900 font-medium"
          placeholder="Enter a message"
        />

        <button
          className="
            w-9 h-9 
            rounded-full 
            bg-yellow-200 
            border-4 border-black 
            flex items-center justify-center 
            font-bold 
            shadow-[3px_3px_0px_#000]
            hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000]
            active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]
            transition-all
          "
        >
          ▶
        </button>
      </div>

      {/* RPS BUTTON */}
      <button
        onClick={onToggleRPS}
        className="
          w-12 h-12 
          rounded-full 
          bg-red-200 
          border-4 border-black 
          flex items-center justify-center 
          text-2xl 
          shadow-[4px_4px_0px_#000]
          hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[6px_6px_0px_#000]
          active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]
          transition-all
        "
      >
        🎮
      </button>

    </div>
  );
}
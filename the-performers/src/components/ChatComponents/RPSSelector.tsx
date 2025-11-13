export function RPSSelector({ open }: { open: boolean }) {
  if (!open) return null;

  return (
    <div
      className="
        flex gap-10 justify-center
        bg-white comic-bubble
        px-4 py-3 mb-4 w-full
      "
    >
      <button className="comic-choice-btn text-2xl comic-text-strong">
        ✊🏿 Rock
      </button>

      <button className="comic-choice-btn text-2xl comic-text-strong">
        🖐🏿 Paper
      </button>

      <button className="comic-choice-btn text-2xl comic-text-strong">
        ✌🏿 Scissors
      </button>
    </div>
  );
}
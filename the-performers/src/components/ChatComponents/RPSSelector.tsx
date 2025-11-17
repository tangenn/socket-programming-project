export function RPSSelector({ 
  open, 
  onSendChallenge 
}: { 
  open: boolean;
  onSendChallenge?: (selectedRPS: string) => void;
}) {
  const handleSelect = (choice: string) => {
    if (onSendChallenge) {
      onSendChallenge(choice);
    }
  };

  if (!open) return null;
  
  return (
    <div className="flex gap-3 bg-white px-4 py-3 rounded-xl shadow mb-4 w-full justify-center border-4 border-black">
      <button 
        className="px-6 py-3 bg-gray-200 rounded-md font-semibold border-2 border-black hover:bg-gray-300 transition-colors"
        onClick={() => handleSelect('rock')}
      >
        ✊🏿 Rock
      </button>
      <button 
        className="px-6 py-3 bg-gray-200 rounded-md font-semibold border-2 border-black hover:bg-gray-300 transition-colors"
        onClick={() => handleSelect('paper')}
      >
        🖐🏿 Paper
      </button>
      <button 
        className="px-6 py-3 bg-gray-200 rounded-md font-semibold border-2 border-black hover:bg-gray-300 transition-colors"
        onClick={() => handleSelect('scissors')}
      >
        ✌🏿 Scissors
      </button>
    </div>
  );
}
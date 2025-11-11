export function RPSSelector({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div className="flex gap-3 bg-white px-4 py-3 rounded-xl shadow mb-4 w-full justify-center">
      <button className="px-4 py-2 bg-gray-200 rounded-md font-semibold">Rock</button>
      <button className="px-4 py-2 bg-gray-200 rounded-md font-semibold">Paper</button>
      <button className="px-4 py-2 bg-gray-200 rounded-md font-semibold">Scissor</button>
    </div>
  );
}
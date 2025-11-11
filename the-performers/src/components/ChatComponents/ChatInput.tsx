export function ChatInput() {
  return (
    <div className="flex items-center gap-3 w-full">
      <input className="flex-1 bg-white px-4 py-2 rounded-md shadow" placeholder="Type..." />
      <button className="bg-white w-10 h-10 rounded-full shadow flex items-center justify-center">▶</button>
      <button className="bg-white w-10 h-10 rounded-full shadow flex items-center justify-center" />
    </div>
  );
}
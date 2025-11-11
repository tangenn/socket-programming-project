export function ChatInput({ onToggleRPS }: { onToggleRPS: () => void }) {
  return (
    <div className="flex items-center w-full gap-3">
      <div className="flex items-center flex-1 bg-white rounded-full shadow px-4 py-2">
        <input className="flex-1 outline-none" placeholder="Enter a message" />
        <button className="w-8 h-8 rounded-full flex items-center justify-center">▶</button>
      </div>
      <button onClick={onToggleRPS} className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center" />
    </div>
  );
}
import { useState } from "react";

export function ChatInput({ 
  onToggleRPS, 
  onSendMessage 
}: { 
  onToggleRPS: () => void;
  onSendMessage?: (content: string) => void;
}) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center w-full gap-3">
      <div className="flex items-center flex-1 bg-white rounded-full shadow px-4 py-2">
        <input 
          className="flex-1 outline-none" 
          placeholder="Enter a message" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
          onClick={handleSend}
        >
          ▶
        </button>
      </div>
      <button 
        onClick={onToggleRPS} 
        className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100 transition" 
      />
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { socket } from "@/socket";
import { PrivateChatLayout } from "@/components/ChatComponents/PrivateChatLayout";
import { MessageType } from "@/components/ChatComponents/ChatMessages";

export default function PrivateChatPage() {
  const params = useParams();
  const receiverUsername = params.username as string;
  const router = useRouter();
  
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current user
    socket.emit('getMe');

    const onMe = (data: { username: string | null }) => {
      if (!data.username) {
        router.push('/login');
        return;
      }
      setCurrentUser(data.username);
      
      // Request DM history once we know who we are
      socket.emit('dm_history', { receiver: receiverUsername });
      setIsLoading(false);
    };

    // Listen for DM history
    const onDmHistory = (data: { history: any[] }) => {
      console.log('Received DM history:', data.history);
      
      // Transform backend format to MessageType format
      const transformedMessages: MessageType[] = data.history.map((msg: any, index: number) => ({
        id: msg._id || String(index),
        sender: msg.sender,
        avatarId: msg.avatarId || 0,
        timestamp: new Date(msg.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isSelf: msg.sender === currentUser,
        type: "text",
        text: msg.content || msg.text,
      }));
      
      setMessages(transformedMessages);
    };

    // Listen for incoming DMs
    const onDm = (data: { sender: string; receiver: string; content: string; timestamp: string }) => {
      console.log('Received DM:', data);
      
      // Only add message if it's from/to the current chat partner
      if (data.sender === receiverUsername || data.receiver === receiverUsername) {
        const newMessage: MessageType = {
          id: Date.now().toString(),
          sender: data.sender,
          avatarId: 0,
          timestamp: new Date(data.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isSelf: data.sender === currentUser,
          type: "text",
          text: data.content,
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
    };

    // Listen for server messages (e.g., "User is offline")
    const onServerMessage = (message: string) => {
      console.log('Server message:', message);
      // Optionally display as a system message in chat
    };

    const onDmError = (data: { message: string }) => {
      console.error('DM Error:', data.message);
      alert(data.message);
    };

    socket.on('me', onMe);
    socket.on('dm_history', onDmHistory);
    socket.on('dm', onDm);
    socket.on('server_message', onServerMessage);
    socket.on('dm_error', onDmError);

    return () => {
      socket.off('me', onMe);
      socket.off('dm_history', onDmHistory);
      socket.off('dm', onDm);
      socket.off('server_message', onServerMessage);
      socket.off('dm_error', onDmError);
    };
  }, [receiverUsername, currentUser, router]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    console.log('Sending DM:', { receiver: receiverUsername, content });
    socket.emit('dm', {
      receiver: receiverUsername,
      content: content.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <PrivateChatLayout 
      user={{ name: receiverUsername, avatarId: 0 }} 
      messages={messages}
      onSendMessage={handleSendMessage}
    />
  );
}

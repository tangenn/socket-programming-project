"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [currentUserAvatarId, setCurrentUserAvatarId] = useState<number | undefined>(undefined);
  const [receiverAvatarId, setReceiverAvatarId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserRef = useRef<string | null>(null);
  const receiverAvatarRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    receiverAvatarRef.current = receiverAvatarId;
  }, [receiverAvatarId]);

  const formatTimestamp = useCallback((value?: string) => {
    if (!value) return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }, []);

  const normalizeMessage = useCallback((payload: any): MessageType => {
    const sender = payload.sender ?? payload.from ?? "Server";
    const rawType = payload.type;
    const supportedTypes: MessageType["type"][] = ["text", "challenge", "challenge_accepted", "challenge_result"];
    const messageType = supportedTypes.includes(rawType) ? rawType : "text";
    
    // Debug: log if we're getting challenge_accepted without proper type
    if (payload.text?.includes("accepted") && payload.text?.includes("challenge") && messageType === "text") {
      console.warn("Challenge accepted message missing type field:", payload);
    }

    const isSelf = sender === currentUserRef.current;

    return {
      id: payload.id || payload._id || `${sender}-${Date.now()}`,
      sender,
      avatarId: payload.avatarId ?? payload.sender_avatar ?? (isSelf ? currentUserAvatarId : receiverAvatarRef.current),
      timestamp: formatTimestamp(payload.timestamp),
      isSelf,
      type: messageType,
      text: payload.text ?? "",
      opponent: payload.opponent,
      participants: payload.participants,
      challenger_sid: payload.challenger_sid,
    };
  }, [formatTimestamp, currentUserAvatarId]);

  useEffect(() => {
    socket.emit('getMe');
    socket.emit('online_users');

    const onMe = (data: { username: string | null; avatarId?: number }) => {
      if (!data.username) {
        router.push('/login');
        return;
      }
      setCurrentUser(data.username);
      setCurrentUserAvatarId(data.avatarId);
      socket.emit('dm_history', { receiver: receiverUsername });
      setIsLoading(false);
    };

    const onOnlineUsers = (data: { users: Array<{ username: string; avatarId?: number }> }) => {
      const receiver = data.users.find(u => u.username === receiverUsername);
      if (receiver && receiver.avatarId !== undefined) {
        setReceiverAvatarId(receiver.avatarId);
      }
    };

    const onDmHistory = (data: { history: any[] }) => {
      const transformedMessages: MessageType[] = data.history.map((msg: any) => {
        return normalizeMessage({
          ...msg,
          sender_avatar: msg.sender_avatar,
          avatarId: msg.sender_avatar,
        });
      });
      setMessages(transformedMessages);
    };

    const onDm = (data: any) => {
      if (data.sender === receiverUsername || data.receiver === receiverUsername) {
        const newMessage = normalizeMessage(data);
        setMessages(prev => [...prev, newMessage]);
        
        // Update receiver's avatar if we receive it, but NOT for challenge-related messages
        const isChallengeMessage = data.type === "challenge" || 
                                   data.type === "challenge_accepted" || 
                                   data.type === "challenge_result";
        if (!newMessage.isSelf && data.avatarId !== undefined && !isChallengeMessage) {
          setReceiverAvatarId(data.avatarId);
        }
      }
    };

    const onServerMessage = (message: string) => {
      console.log('Server message:', message);
    };

    const onDmError = (data: { message: string }) => {
      console.error('DM Error:', data.message);
      alert(data.message);
    };

    const handleChallengeMessage = (payload: any) => {
      // Handle challenge messages sent via dm event
      if (payload.message) {
        onDm(payload.message);
      }
    };

    const handleChallengeExpired = (data: { id: string }) => {
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === data.id 
            ? { ...msg, type: "text", text: "Challenge expired" } 
            : msg
        )
      );
    };

    socket.on('me', onMe);
    socket.on('online_users', onOnlineUsers);
    socket.on('dm_history', onDmHistory);
    socket.on('dm', onDm);
    socket.on('server_message', onServerMessage);
    socket.on('dm_error', onDmError);
    socket.on('challenge_message', handleChallengeMessage);
    socket.on('challenge_expired', handleChallengeExpired);

    return () => {
      socket.off('me', onMe);
      socket.off('online_users', onOnlineUsers);
      socket.off('dm_history', onDmHistory);
      socket.off('dm', onDm);
      socket.off('server_message', onServerMessage);
      socket.off('dm_error', onDmError);
      socket.off('challenge_message', handleChallengeMessage);
      socket.off('challenge_expired', handleChallengeExpired);
    };
  }, [receiverUsername, router, normalizeMessage, formatTimestamp]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    socket.emit('dm', {
      receiver: receiverUsername,
      text: content.trim(),
    });
  };;

  const handleSendChallenge = useCallback((selectedRPS: string) => {
    if (!currentUser || !currentUserAvatarId) return;
    
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto 
      ? crypto.randomUUID() 
      : `${Date.now()}`;
    
    socket.emit("private_challengeV2" as any, {
      receiver: receiverUsername,
      id,
      avatarId: currentUserAvatarId,
      selectedRPS: selectedRPS.toLowerCase(),
    });
  }, [receiverUsername, currentUser, currentUserAvatarId]);

  const handleAcceptChallenge = useCallback((challengerId: string, selectedRPS: string) => {
    if (!currentUser || !currentUserAvatarId) return;
    
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto 
      ? crypto.randomUUID() 
      : `${Date.now()}`;
    
    socket.emit("private_challenge_responseV2" as any, {
      challenger_id: challengerId,
      id,
      avatarId: currentUserAvatarId,
      selectedRPS: selectedRPS.toLowerCase(),
      receiver: receiverUsername,
    });
  }, [receiverUsername, currentUser, currentUserAvatarId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <PrivateChatLayout 
      user={{ name: receiverUsername, avatarId: receiverAvatarId }} 
      messages={messages}
      onSendMessage={handleSendMessage}
      onSendChallenge={handleSendChallenge}
      onAcceptChallenge={handleAcceptChallenge}
    />
  );
}

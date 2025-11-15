
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { socket } from "@/socket";
import { GroupChatLayout } from "@/components/ChatComponents/GroupChatLayout";
import { MessageType } from "@/components/ChatComponents/ChatMessages";

type GroupMember = { name: string; avatarId: number };
type RawGroupMember = { username?: string; name?: string; avatarId?: number } | string;
type GroupMembersEvent = { group_name: string; members: RawGroupMember[] };
type OnlineUser = { username: string; avatarId?: number };

export default function GroupPage() {
  const params = useParams();
  const groupName = params.groupName as string;
  const router = useRouter();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentAvatarId, setCurrentAvatarId] = useState<number | undefined>();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [pendingChallenges, setPendingChallenges] = useState<Map<string, string>>(new Map());


  const membersRef = useRef<GroupMember[]>([]);
  const currentUserRef = useRef<string | null>(null);
  const currentAvatarRef = useRef<number | undefined>(undefined);
  const hasRequestedHistory = useRef(false);
  const onlineUsersRef = useRef<OnlineUser[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    currentAvatarRef.current = currentAvatarId;
  }, [currentAvatarId]);

  useEffect(() => {
    onlineUsersRef.current = onlineUsers;
  }, [onlineUsers]);

  const formatTimestamp = useCallback((value?: string) => {
    if (!value) return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }, []);

  const resolveAvatar = useCallback((sender?: string, explicit?: number) => {
    if (explicit !== undefined) return explicit;
    if (!sender) return undefined;
    if (sender === currentUserRef.current) return currentAvatarRef.current;
    const member = membersRef.current.find((m) => m.name === sender);
    return member?.avatarId;
  }, []);

  const normalizeMessage = useCallback(
    (payload: any): MessageType => {
      const sender = payload.sender ?? payload.from ?? "Server";
      const rawType = payload.type;
      const supportedTypes: MessageType["type"][] = ["text", "challenge", "challenge_accepted", "challenge_result"];
      const messageType = supportedTypes.includes(rawType) ? rawType : "text";

      return {
        id: payload.id || payload._id || `${sender}-${Date.now()}`,
        sender,
        avatarId: resolveAvatar(sender, payload.avatarId ?? payload.sender_avatar),
        timestamp: formatTimestamp(payload.timestamp),
        isSelf: sender === currentUserRef.current,
        type: messageType,
        text: payload.text ?? payload.content ?? "",
        opponent: payload.opponent,
        participants: payload.participants,
        challenger_sid: payload.challenger_sid,
      };
    },
    [formatTimestamp, resolveAvatar],
  );

  const requestMembers = useCallback(() => {
    socket.emit("get_group_members" as any, { group_name: groupName });
  }, [groupName]);

  const resolveMemberAvatar = useCallback((username?: string, explicit?: number) => {
    if (explicit !== undefined) return explicit;
    if (!username) return 1;

    const onlineMatch = onlineUsersRef.current.find((user) => user.username === username);
    if (onlineMatch && onlineMatch.avatarId !== undefined) {
      return onlineMatch.avatarId;
    }

    return 1;
  }, []);

  useEffect(() => {
    if (isInitialized.current === false) {
      socket.emit("getMe");
      socket.emit("join_group", { group_name: groupName });
      requestMembers();
      socket.emit("online_users");
  
      isInitialized.current = true; // Mark as initialized
    }

    const handleMe = (data: { username: string | null; avatarId?: number }) => {
      if (!data.username) {
        router.push("/login");
        return;
      }
      setCurrentUser(data.username);
      setCurrentAvatarId(data.avatarId);

      if (!hasRequestedHistory.current) {
        socket.emit("group_history", { group_name: groupName });
        hasRequestedHistory.current = true;
      }
    };

    const handleGroupMembers = (data: GroupMembersEvent) => {
      if (data.group_name !== groupName) return;
      const normalizedMembers: GroupMember[] = data.members.map((member) => {
        if (typeof member === "string") {
          return {
            name: member,
            avatarId: resolveMemberAvatar(member),
          };
        }

        const username = member.username ?? member.name ?? "Unknown";
        return {
          name: username,
          avatarId: resolveMemberAvatar(username, member.avatarId),
        };
      });
      setMembers(normalizedMembers);
    };

    const handleGroupHistory = (data: { history: any[] }) => {
      const normalized = data.history.map(normalizeMessage);
      setMessages(normalized);
    };

    const handleGroupMessage = (payload: any) => {
      if ((payload.to && payload.to !== groupName) || payload.group_name !== undefined && payload.group_name !== groupName) {
        return;
      }
      setMessages((prev) => [...prev, normalizeMessage(payload)]);
    };

    const handleServerMessage = (message: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `server-${Date.now()}-${Math.random()}`,
          sender: "Server",
          avatarId: 21,
          timestamp: formatTimestamp(new Date().toISOString()),
          isSelf: false,
          type: "text",
          text: message,
        },
      ]);

      const normalized = message.toLowerCase();
      if (
        normalized.includes("has joined the group") ||
        normalized.includes("has left the group") ||
        normalized.includes("you joined group")
      ) {
        requestMembers();
      }
    };

    const handleGroupMessageError = (data: { message: string }) => {
      window.alert(data.message);
    };

    const handleOnlineUsers = (data: { users: OnlineUser[] }) => {
      setOnlineUsers(data.users);
    };

    const handleChallengeMessage = (payload: any) => {
      if (payload.message?.group_name && payload.message.group_name !== groupName) {
        return;
      }
      setMessages((prev) => [...prev, normalizeMessage(payload.message)]);
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
    

    socket.on("me", handleMe);
    socket.on("group_members" as any, handleGroupMembers);
    socket.on("group_history", handleGroupHistory);
    socket.on("group_message", handleGroupMessage);
    socket.on("server_message", handleServerMessage);
    socket.on("group_message_error" as any, handleGroupMessageError);
    socket.on("online_users", handleOnlineUsers);
    socket.on("challenge_message", handleChallengeMessage);
    socket.on("challenge_expired", handleChallengeExpired);

    socket.emit("online_users");

    return () => {
      // socket.emit("leave_group", { group_name: groupName });
      socket.off("me", handleMe);
      socket.off("group_members" as any, handleGroupMembers);
      socket.off("group_history", handleGroupHistory);
      socket.off("group_message", handleGroupMessage);
      socket.off("server_message", handleServerMessage);
      socket.off("group_message_error" as any, handleGroupMessageError);
      socket.off("online_users", handleOnlineUsers);
      socket.off("challenge_message", handleChallengeMessage);
      socket.off("challenge_expired", handleChallengeExpired);
      hasRequestedHistory.current = false;
    };
  }, [groupName, normalizeMessage, router, formatTimestamp, requestMembers, resolveMemberAvatar]);

  const handleSendChallenge = useCallback((selectedRPS: string) => {
    if (!currentUser || !currentAvatarId) return;
    
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto 
      ? crypto.randomUUID() 
      : `${Date.now()}`;
    
    socket.emit("group_challengeV2", {
      group_name: groupName,
      id,
      avatarId: currentAvatarId,
      selectedRPS: selectedRPS.toLowerCase(),
    });
  }, [groupName, currentUser, currentAvatarId]);

  const handleAcceptChallenge = useCallback((challengerId: string, selectedRPS: string) => {
    if (!currentUser || !currentAvatarId) return;
    
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto 
      ? crypto.randomUUID() 
      : `${Date.now()}`;
    
    socket.emit("group_challenge_responseV2", {
      challenger_id: challengerId,
      id,
      avatarId: currentAvatarId,
      selectedRPS: selectedRPS.toLowerCase(),
      group_name: groupName,
    });
  }, [groupName, currentUser, currentAvatarId]);

  const handleSendMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const avatarId = currentAvatarId ?? 1;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;

    socket.emit("group_message", {
      group_name: groupName,
      id,
      avatarId,
      text: trimmed,
    });
  };

  const handleLeaveGroup = () => {
    socket.emit("leave_group", { group_name: groupName });
    router.push("/");
  };

  return (
    <GroupChatLayout
      groupName={groupName}
      members={members}
      messages={messages}
      onSendMessage={handleSendMessage}
      onSendChallenge={handleSendChallenge}
      onAcceptChallenge={handleAcceptChallenge}
      onLeaveGroup={handleLeaveGroup}
    />
  );
}

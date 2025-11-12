import { io, Socket } from "socket.io-client";

// Define the types for events your server *sends* to the client
interface ServerToClientEvents {
  connect: () => void;
  disconnect: () => void;
  register_success: (data: { message: string }) => void;
  register_error: (data: { message: string }) => void;
  login_success: (data: { username: string }) => void;
  login_error: (data: { message: string }) => void;
  dm: (data: any) => void; // Define 'any' or a proper type
  dm_history: (data: { history: any[] }) => void;
  server_message: (message: string) => void;
  group_message: (data: any) => void;
  group_history: (data: { history: any[] }) => void;
}

// Define the types for events your client *sends* to the server
interface ClientToServerEvents {
  register: (data: { username: string; password: string }) => void;
  login: (data: { username: string; password: string }) => void;
  dm: (data: { receiver: string; content: string }) => void;
  dm_history: (data: { receiver: string }) => void;
  join_group: (data: { group_name: string }) => void;
  leave_group: (data: { group_name: string }) => void;
  create_group: (data: { group_name: string }) => void;
  group_message: (data: { group_name: string; content: string }) => void;
  group_history: (data: { group_name: string }) => void;
}

// Replace with your server's URL

// Note the explicit typing: Socket<ServerToClientEvents, ClientToServerEvents>
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000",
);

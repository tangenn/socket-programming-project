import { io, Socket } from "socket.io-client";

// Define the types for events your server *sends* to the client
interface ServerToClientEvents {
  connect: () => void;
  disconnect: () => void;
  register_success: (data: { message: string }) => void;
  register_error: (data: { message: string }) => void;
  login_success: (data: { username: string }) => void;
  login_error: (data: { message: string }) => void;
  avatar_selected: (data: { avatarId: number }) => void;
  create_group_success: (data: { message: string; group_name: string }) => void;
  create_group_error: (data: { message: string }) => void;
  dm: (data: { sender: string; receiver: string; text: string; timestamp: string; avatarId?: number }) => void;
  dm_history: (data: { history: any[] }) => void;
  dm_error: (data: { message: string }) => void;
  server_message: (message: string) => void;
  group_message: (data: any) => void;
  group_history: (data: { history: any[] }) => void;
  online_users: (data: { users: Array<{ username: string; avatarId?: number }> }) => void;
  available_groups: (data: { groups: any[] }) => void;
  me: (data: { username: string | null; avatarId?: number }) => void;
  challenge_message: (data: any) => void;
  challenge_expired: (data: { id: string }) => void;
  game_started: (data: { game_room: string; players: string[] }) => void;
  opponent_selected: (data: {}) => void;
  game_result: (data: { result: any; player_one_selected: string; player_two_selected: string }) => void;
}

// Define the types for events your client *sends* to the server
interface ClientToServerEvents {
  register: (data: { username: string; password: string; avatarId?: number }) => void;
  login: (data: { username: string; password: string }) => void;
  select_avatar: (data: { avatarId: number }) => void;
  dm: (data: { receiver: string; text: string }) => void;
  dm_history: (data: { receiver: string }) => void;
  join_group: (data: { group_name: string }) => void;
  leave_group: (data: { group_name: string }) => void;
  create_group: (data: { group_name: string }) => void;
  group_message: (data: { group_name: string; id: string; avatarId: number; text: string }) => void;
  group_history: (data: { group_name: string }) => void;
  online_users: () => void;
  get_available_groups: () => void;
  getMe: () => void;
  group_challengeV2: (data: { group_name: string; id: string; avatarId: number; selectedRPS: string }) => void;
  group_challenge_responseV2: (data: { challenger_id: string; id: string; avatarId: number; selectedRPS: string; group_name: string }) => void;
  private_challengeV2: (data: { receiver: string; id: string; avatarId: number; selectedRPS: string }) => void;
  private_challenge_responseV2: (data: { challenger_id: string; id: string; avatarId: number; selectedRPS: string; receiver: string }) => void;
}

// Replace with your server's URL

// Note the explicit typing: Socket<ServerToClientEvents, ClientToServerEvents>
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000",
);


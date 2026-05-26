import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config/api";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinAssignmentRoom(assignmentId: string): void {
  const s = getSocket();
  s.emit("join:assignment", assignmentId);
}

export function leaveAssignmentRoom(assignmentId: string): void {
  const s = getSocket();
  s.emit("leave:assignment", assignmentId);
}

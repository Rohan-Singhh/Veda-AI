import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { config } from "../utils/config";

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.frontendUrl,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Client joins a room for a specific assignment
    socket.on("join:assignment", (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
      console.log(`📋 Client ${socket.id} joined room assignment:${assignmentId}`);
    });

    socket.on("leave:assignment", (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  console.log("✅ Socket.IO initialized");
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}

// Helper to emit events to a specific assignment room
export function emitToAssignment(
  assignmentId: string,
  event: string,
  data: unknown
): void {
  if (io) {
    io.to(`assignment:${assignmentId}`).emit(event, data);
  }
}

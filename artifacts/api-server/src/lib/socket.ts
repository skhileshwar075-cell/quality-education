import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

let io: Server;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    path: "/api/socket.io",
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (_socket) => {});

  return io;
}

export function emitNotification(event: string, data: object) {
  if (io) io.emit(event, data);
}

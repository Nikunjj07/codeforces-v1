import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env';

let io: SocketIOServer;

export const initSocket = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    // Join a contest room to receive leaderboard updates
    socket.on('join:contest', (contestId: string) => {
      socket.join(`contest:${contestId}`);
    });

    socket.on('leave:contest', (contestId: string) => {
      socket.leave(`contest:${contestId}`);
    });

    socket.on('disconnect', () => {
      // Cleanup handled by Socket.IO automatically
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

export const emitLeaderboardUpdate = (contestId: string, rankings: any[]): void => {
  try {
    getIO().to(`contest:${contestId}`).emit('leaderboard:update', { contestId, rankings });
  } catch {
    // Socket not initialized yet
  }
};

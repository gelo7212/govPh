import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { RoomManager } from './room.manager';
import { PresenceManager } from './presence.manager';
import { socketAuthMiddleware } from '../middleware/socketAuth.middleware';

/**
 * Initialize Socket.IO server with configuration and middleware
 */
export const initializeSocketIO = (httpServer: any, socketIOConfig: any): Server => {
  const io = new Server(httpServer, socketIOConfig);

  // Authentication middleware
  io.use((socket: any, next: any) => {
    socketAuthMiddleware(socket, next);
  });

  // Connection event
  io.on('connection', (socket: Socket) => {
    logger.info('Client connected', {
      socketId: socket.id,
      userId: (socket as any).userId,
    });

    // Initialize managers
    const roomManager = new RoomManager(io);
    const presenceManager = new PresenceManager(io);

    // Store managers on socket for access in event handlers
    (socket as any).roomManager = roomManager;
    (socket as any).presenceManager = presenceManager;

    // Register disconnect handler
    socket.on('disconnect', async () => {
      logger.info('Client disconnected', {
        socketId: socket.id,
        userId: (socket as any).userId,
      });

      await presenceManager.removeUserPresence((socket as any).userId);
    });
    
    // Debug: Log all outgoing events to this socket
    const originalEmit = socket.emit.bind(socket);
    socket.emit = function(eventName: string, ...args: any[]) {
      if (eventName !== 'heartbeat:ack') {
        console.log(`📤 Emitting to socket ${socket.id}:`, eventName, args[0]);
      }
      return originalEmit(eventName, ...args);
    };
  });

  return io;
};

export default initializeSocketIO;

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { eventEmitter, SOSEvent } from '../services/eventEmitter';

let io: SocketIOServer;

export const setupWebSocket = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Client can join room based on SOS ID to receive updates
    socket.on('join-sos', (sosId: string) => {
      socket.join(`sos_${sosId}`);
      console.log(`Client joined SOS room: sos_${sosId}`);
    });

    socket.on('leave-sos', (sosId: string) => {
      socket.leave(`sos_${sosId}`);
      console.log(`Client left SOS room: sos_${sosId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  /**
   * Wire domain events to socket.io broadcasts
   * Controllers emit domain events, socket listens and broadcasts
   */
  wireEventsToBroadcast(io);

  return io;
};

/**
 * Connect domain events to socket broadcasts
 * Events are published in controllers, sockets listen and broadcast to clients
 */
function wireEventsToBroadcast(io: SocketIOServer): void {
  // SOS Created
  eventEmitter.onSOSCreated((event: SOSEvent) => {
    io.emit('sos:created', {
      sosId: event.sosId,
      timestamp: event.timestamp,
      data: event.data,
    });
  });

  // Location Updated
  eventEmitter.onLocationUpdated((event: SOSEvent) => {
    io.to(`sos_${event.sosId}`).emit('location:updated', {
      sosId: event.sosId,
      timestamp: event.timestamp,
      data: event.data,
    });
  });

  // Message Sent
  eventEmitter.onMessageSent((event: SOSEvent) => {
    io.to(`sos_${event.sosId}`).emit('message:sent', {
      sosId: event.sosId,
      timestamp: event.timestamp,
      data: event.data,
    });
  });

  // Status Changed
  eventEmitter.onStatusChanged((event: SOSEvent) => {
    io.to(`sos_${event.sosId}`).emit('sos:status-changed', {
      sosId: event.sosId,
      timestamp: event.timestamp,
      data: event.data,
    });
    // Also broadcast to admin dashboard
    io.emit('sos:status-changed', {
      sosId: event.sosId,
      timestamp: event.timestamp,
      data: event.data,
    });
  });

  // Rescuer Assigned
  eventEmitter.onRescuerAssigned((event: SOSEvent) => {
    io.to(`sos_${event.sosId}`).emit('rescuer:assigned', {
      sosId: event.sosId,
      timestamp: event.timestamp,
      data: event.data,
    });
    // Notify the assigned rescuer
    io.emit('rescuer:assignment', {
      sosId: event.sosId,
      rescuerId: event.data.rescuerId,
      timestamp: event.timestamp,
    });
  });

  // SOS Cancelled
  eventEmitter.onSOSCancelled((event: SOSEvent) => {
    io.to(`sos_${event.sosId}`).emit('sos:cancelled', {
      sosId: event.sosId,
      timestamp: event.timestamp,
    });
  });

  // SOS Resolved
  eventEmitter.onSOSResolved((event: SOSEvent) => {
    io.to(`sos_${event.sosId}`).emit('sos:resolved', {
      sosId: event.sosId,
      timestamp: event.timestamp,
      data: event.data,
    });
  });

  console.log('Domain events wired to socket.io broadcasts');
}

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

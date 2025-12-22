import app from './app';
import { Server as HTTPServer, createServer } from 'http';
import { connectMongoDB, disconnectMongoDB } from './config/database';
import { setupWebSocket } from './config/socket';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

let server: HTTPServer | null = null;

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Create HTTP server with Express app
    server = createServer(app);

    // Setup WebSocket on HTTP server
    setupWebSocket(server);

    server.listen(PORT, () => {
      console.log(`SOS Service running on port ${PORT}`);
      console.log(`Socket.IO enabled for realtime events`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      await disconnectMongoDB();
      server?.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default server;

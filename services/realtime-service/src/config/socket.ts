import { SocketIOOptions } from '../types/socket.types';
import { config } from './env';

export const socketIOConfig: SocketIOOptions = {
  cors: {
    origin: Array.isArray(config.CORS_ORIGIN) ? config.CORS_ORIGIN : [config.CORS_ORIGIN],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 20000,
  maxHttpBufferSize: 1e6, // 1MB
  allowUpgrades: true,
  perMessageDeflate: {
    threshold: 1024,
  },
};

export default socketIOConfig;

import { Server as SocketServer } from 'socket.io';
import logger from '../utils/logger.js';

class SocketService {
  constructor() {
    this.io = null;
  }

  init(server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['*'],
        credentials: true
      },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      connectTimeout: 45000,
      pingTimeout: 30000,
      pingInterval: 25000
    });

    this.io.on('connection', (socket) => {
      logger.info(`✅ NODE CONNECTED: ${socket.id} from ${socket.handshake.address}`);
      
      socket.on('disconnect', () => {
        logger.info(`❌ NODE DISCONNECTED: ${socket.id}`);
      });
    });

    logger.info('✌️ Socket.io loaded!');
    return this.io;
  }

  getIO() {
    if (!this.io) {
      throw new Error('Socket.io not initialized!');
    }
    return this.io;
  }

  emit(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

const socketService = new SocketService();
export default socketService;

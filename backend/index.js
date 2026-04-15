import 'dotenv/config';
import createApp from './src/app.js';
import connectDB from './src/loaders/mongoose.js';
import socketService from './src/loaders/socket.js';
import logger from './src/utils/logger.js';
import { startPriceTracker } from './src/services/priceTracker.service.js';
import { startTelegramIntegration } from './src/modules/telegram/telegram.listener.js';
import priceWebSocket from './src/services/priceWebSocket.js';
import mockPriceService from './src/services/mockPriceService.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // 1. Initialize Database
    await connectDB();

    // 2. Initialize Fastify App
    const app = await createApp();

    // 3. Initialize Socket.io
    socketService.init(app.server);

    // 4. Start Live Services (Price Tracker, Telegram, etc.)
    startPriceTracker(socketService.getIO());
    await startTelegramIntegration();

    // 5. Initialize Price Services
    priceWebSocket.setSocketIO(socketService.getIO());
    mockPriceService.setSocketIO(socketService.getIO());
    
    // Start mock price service for testing
    mockPriceService.start();
    logger.info('📡 Mock price service started for testing');
    
    const feedToken = process.env.ANGEL_ONE_FEED_TOKEN;
    const jwt = process.env.ANGEL_ONE_JWT;
    const clientCode = process.env.ANGEL_ONE_CLIENT_CODE;
    
    // Angel One WebSocket temporarily disabled due to connection issues
    logger.info('📝 Angel One WebSocket temporarily disabled. Using mock price service for testing.');
    logger.info('� To enable real prices, fix Angel One API credentials and uncomment WebSocket connection code');

    // 6. Start Listening
    await app.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`🚀 Server ready at http://localhost:${PORT}`);
    
  } catch (err) {
    logger.error('💥 Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

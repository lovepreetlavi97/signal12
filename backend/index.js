import 'dotenv/config';
import createApp from './src/app.js';
import connectDB from './src/loaders/mongoose.js';
import socketService from './src/loaders/socket.js';
import logger from './src/utils/logger.js';
import { startPriceTracker } from './src/services/priceTracker.service.js';
import { startTelegramIntegration } from './src/modules/telegram/telegram.listener.js';

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

    // 5. Start Listening
    await app.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`🚀 Server ready at http://localhost:${PORT}`);
    
  } catch (err) {
    logger.error('💥 Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import errorMiddleware from './middlewares/errorMiddleware.js';
import signalsRoutes from './modules/signals/signals.routes.js';
import subscriptionRoutes from './modules/subscriptions/subscriptions.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
// Import other routes as they are created
// import authRoutes from './modules/auth/auth.routes.js';

const createApp = async () => {
  const fastify = Fastify({ 
    logger: { 
      transport: { 
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        }
      } 
    } 
  });

  // Plugins
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  // Routes
  await fastify.register(signalsRoutes, { prefix: '/api/v1/signals' });
  await fastify.register(subscriptionRoutes, { prefix: '/api/v1/subscriptions' });
  await fastify.register(adminRoutes, { prefix: '/api/v1/admin' });
  
  // Health check
  fastify.get('/health', async () => ({ status: 'UP', timestamp: new Date().toISOString() }));

  // Global Error Handler
  fastify.setErrorHandler(errorMiddleware);

  return fastify;
};

export default createApp;

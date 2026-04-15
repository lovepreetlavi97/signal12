import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import priceWebSocket from './src/services/priceWebSocket.js';
import { validateCredentials } from './src/services/angelOneLoginService.js';

const PORT = process.env.PORT || 4002;

const startRealtimeServer = async () => {
  try {
    console.log('🚀 Starting real-time server for Angel One data...');
    
    // Create HTTP server
    const httpServer = createServer();
    
    // Create Socket.io server
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    // Set up real Angel One WebSocket service only
    priceWebSocket.setSocketIO(io);
    
    // Validate credentials first
    if (!validateCredentials()) {
      console.log('❌ Angel One credentials not configured');
      console.log('Please configure SMARTAPI_KEY, CLIENT_CODE, TRADING_PIN, and TOTP_SECRET in .env');
      process.exit(1);
    }
    
    console.log('🔐 Connecting to Angel One WebSocket...');
    try {
      await priceWebSocket.connect();
      console.log('✅ Angel One WebSocket connected successfully');
    } catch (error) {
      console.log('❌ Failed to connect to Angel One WebSocket:', error.message);
      console.log('⚠️ No fallback data available - real Angel One connection required');
      process.exit(1);
    }
    
    // Socket.io connection
    io.on('connection', (socket) => {
      console.log('🔗 Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
      });
    });
    
    // HTTP request handler
    httpServer.on('request', (req, res) => {
      // Enable CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
      
      if (req.url === '/api/v1/market/prices' && req.method === 'GET') {
        // Only return real Angel One data
        const status = priceWebSocket.getConnectionStatus();
        
        if (status.isConnected) {
          const prices = priceWebSocket.getAllPrices();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            data: {
              prices,
              connection: {
                isConnected: true,
                timestamp: new Date().toISOString(),
                mode: 'angel_one_realtime'
              },
              timestamp: new Date().toISOString()
            }
          }));
        } else {
          // Return error if not connected
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Angel One WebSocket not connected',
            message: 'Real-time data unavailable - please check connection',
            connection: {
              isConnected: false,
              timestamp: new Date().toISOString(),
              mode: 'disconnected'
            }
          }));
        }
        return;
      }
      
      if (req.url === '/health' && req.method === 'GET') {
        const status = priceWebSocket.getConnectionStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: status.isConnected ? 'healthy' : 'unhealthy',
          connection: status,
          timestamp: new Date().toISOString()
        }));
        return;
      }
      
      // 404 for other routes
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    });
    
    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Real-time server ready at http://localhost:${PORT}`);
      console.log('🔗 Angel One WebSocket connected');
      console.log('📡 Real-time market data streaming');
      console.log('📝 API endpoints:');
      console.log(`   GET http://localhost:${PORT}/api/v1/market/prices`);
      console.log(`   GET http://localhost:${PORT}/health`);
    });
    
  } catch (err) {
    console.error('💥 Failed to start real-time server:', err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down real-time server...');
  priceWebSocket.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down real-time server...');
  priceWebSocket.disconnect();
  process.exit(0);
});

startRealtimeServer();

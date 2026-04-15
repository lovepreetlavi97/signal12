import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import priceWebSocket from './src/services/priceWebSocket.js';
import { validateCredentials } from './src/services/angelOneLoginService.js';

const PORT = process.env.PORT || 4002;

const startTestServer = async () => {
  try {
    console.log('🚀 Starting test server for price display...');
    
    // Create HTTP server
    const httpServer = createServer();
    
    // Create Socket.io server
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    // Set up real price service only
    priceWebSocket.setSocketIO(io);
    if (validateCredentials()) {
      console.log('🔐 Angel One credentials found, attempting real price connection...');
      try {
        await priceWebSocket.connect();
        console.log('✅ Angel One WebSocket connected successfully');
      } catch (error) {
        console.log('❌ Failed to connect to Angel One WebSocket:', error.message);
        console.log('⚠️ No fallback data available - please check Angel One credentials');
      }
    } else {
      console.log('📝 Angel One credentials not configured, please configure SMARTAPI_KEY, CLIENT_CODE, TRADING_PIN, and TOTP_SECRET in .env');
    }
    
    // Socket.io connection
    io.on('connection', (socket) => {
      console.log('🔗 Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
      });
    });
    
    // Basic API routes
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
        // Only use real Angel One data
        const realStatus = priceWebSocket.getConnectionStatus();
        let prices, status;
        
        if (realStatus.isConnected) {
          prices = priceWebSocket.getAllPrices();
          status = realStatus;
        } else {
          // Return empty data if not connected
          prices = {
            'NIFTY 50': { price: 0, timestamp: new Date().toISOString(), change: { value: 0, percentage: 0 } },
            'SENSEX': { price: 0, timestamp: new Date().toISOString(), change: { value: 0, percentage: 0 } },
            'NIFTY BANK': { price: 0, timestamp: new Date().toISOString(), change: { value: 0, percentage: 0 } },
            'INDIA VIX': { price: 0, timestamp: new Date().toISOString(), change: { value: 0, percentage: 0 } },
            'USD-INR': { price: 0, timestamp: new Date().toISOString(), change: { value: 0, percentage: 0 } }
          };
          status = {
            isConnected: false,
            timestamp: new Date().toISOString(),
            mode: 'disconnected',
            message: 'Angel One WebSocket not connected'
          };
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            prices,
            connection: status,
            timestamp: new Date().toISOString()
          }
        }));
        return;
      }
      
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'UP',
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
      console.log(`🚀 Test server ready at http://localhost:${PORT}`);
      console.log('🔗 Socket.io is ready for connections');
      console.log('📝 API endpoints:');
      console.log(`   GET http://localhost:${PORT}/api/v1/market/prices`);
      console.log(`   GET http://localhost:${PORT}/health`);
    });
    
  } catch (err) {
    console.error('💥 Failed to start test server:', err);
    process.exit(1);
  }
};

startTestServer();

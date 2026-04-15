import priceWebSocket from '../../services/priceWebSocket.js';
import mockPriceService from '../../services/mockPriceService.js';

const marketDataRoutes = async (fastify, options) => {
  
  // Get all current prices
  fastify.get('/prices', async (request, reply) => {
    try {
      // Use mock service if real WebSocket is not connected
      const realStatus = priceWebSocket.getConnectionStatus();
      let prices, status;
      
      if (realStatus.isConnected) {
        prices = priceWebSocket.getAllPrices();
        status = realStatus;
      } else {
        prices = mockPriceService.getAllPrices();
        status = mockPriceService.getConnectionStatus();
      }
      
      return {
        success: true,
        data: {
          prices,
          connection: status,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch prices',
        message: error.message
      };
    }
  });

  // Get specific instrument price
  fastify.get('/prices/:instrument', async (request, reply) => {
    try {
      const { instrument } = request.params;
      const prices = priceWebSocket.getAllPrices();
      
      if (!prices[instrument]) {
        reply.code(404);
        return {
          success: false,
          error: 'Instrument not found',
          availableInstruments: Object.keys(prices)
        };
      }
      
      return {
        success: true,
        data: {
          instrument,
          ...prices[instrument]
        }
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch price',
        message: error.message
      };
    }
  });

  // Get connection status
  fastify.get('/status', async (request, reply) => {
    try {
      const status = priceWebSocket.getConnectionStatus();
      
      return {
        success: true,
        data: status
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to get status',
        message: error.message
      };
    }
  });

  // Get available instruments
  fastify.get('/instruments', async (request, reply) => {
    try {
      const instruments = [
        { name: 'NIFTY 50', token: '26000', exchange: 'NSE' },
        { name: 'NIFTY BANK', token: '26001', exchange: 'NSE' },
        { name: 'SENSEX', token: '1', exchange: 'BSE' },
        { name: 'INDIA VIX', token: '260105', exchange: 'NSE' },
        { name: 'USD-INR', token: '999999', exchange: 'BSE' }
      ];
      
      return {
        success: true,
        data: instruments
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch instruments',
        message: error.message
      };
    }
  });

};

export default marketDataRoutes;

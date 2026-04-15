import WebSocket from "ws";
import dotenv from "dotenv";
import { loginToAngelOne, validateCredentials } from "./angelOneLoginService.js";

dotenv.config();
const { SMARTAPI_KEY, ANGEL_WS_URL } = process.env;

class PriceWebSocket {
  constructor() {
    this.ws = null;
    this.io = null;
    this.prices = {
      "NIFTY 50": null,
      "NIFTY BANK": null,
      "SENSEX": null,
      "INDIA VIX": null,
      "USD-INR": null
    };
    this.isConnected = false;
  }

  setSocketIO(io) {
    this.io = io;
  }

  async connect() {
    try {
      // Validate credentials first
      if (!validateCredentials()) {
        throw new Error('Invalid Angel One credentials');
      }

      // Login to get tokens
      const authData = await loginToAngelOne();
      const { feedToken, jwt, clientCode } = authData;
      
      const fullUrl = `${ANGEL_WS_URL}?clientCode=${clientCode}&feedToken=${feedToken}&apiKey=${SMARTAPI_KEY}`;
      
      console.log("🌐 Connecting to Angel One WebSocket for price data:", fullUrl);
      
      this.ws = new WebSocket(fullUrl);

    this.ws.on("open", () => {
      console.log("✅ WebSocket connected. Subscribing to market data...");
      
      const payload = {
        action: 1,
        params: {
          mode: 1, // LTP (Last Traded Price)
          tokenList: [
            {
              exchangeType: 1, // NSE
              tokens: ["26000", "26001", "260105"] // NIFTY 50, NIFTY BANK, INDIA VIX
            },
            {
              exchangeType: 2, // BSE
              tokens: ["1", "999999"] // SENSEX, USD-INR
            }
          ],
        },
      };
      
      this.ws.send(JSON.stringify(payload));
      this.isConnected = true;
      console.log("📡 Subscribed to market data feed...");
    });

    this.ws.on("message", (data) => {
      try {
        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
        
        // Read token ID
        const tokenStr = buffer.toString("ascii", 2, 7).replace(/\0/g, "");
        
        // Parse LTP (Little Endian integer)
        const ltpRaw = buffer.readInt32LE(43);
        const ltp = ltpRaw / 100;
        
        let instrumentName = "UNKNOWN";
        
        // Identify instrument by token
        switch(tokenStr) {
          case "26000":
            instrumentName = "NIFTY 50";
            break;
          case "26001":
            instrumentName = "NIFTY BANK";
            break;
          case "260105":
            instrumentName = "INDIA VIX";
            break;
          case "1":
            instrumentName = "SENSEX";
            break;
          case "999999":
            instrumentName = "USD-INR";
            break;
          default:
            return; // Skip unknown tokens
        }
        
        // Update price
        this.prices[instrumentName] = {
          price: ltp,
          timestamp: new Date().toISOString(),
          change: this.calculateChange(instrumentName, ltp)
        };
        
        console.log(`📈 ${instrumentName} | ₹${ltp.toFixed(2)} ⏱️ ${new Date().toLocaleTimeString()}`);
        
        // Emit to frontend via Socket.io
        if (this.io) {
          this.io.emit('price_update', {
            instrument: instrumentName,
            price: ltp,
            timestamp: this.prices[instrumentName].timestamp,
            change: this.prices[instrumentName].change
          });
        }
        
      } catch (err) {
        console.error("⚠️ Parse error:", err.message);
      }
    });

    this.ws.on("error", (err) => {
      console.error("❌ WebSocket Error:", err.message);
      this.isConnected = false;
      // Don't throw error, just log it
    });
    
    this.ws.on("close", (code, reason) => {
      console.log(`⚠️ WebSocket closed. Code: ${code}, Reason: ${reason}`);
      this.isConnected = false;
      
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        console.log("🔄 Attempting to reconnect...");
        this.connect();
      }, 5000);
    });

    // Keepalive ping
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ action: 0 }));
      }
    }, 30 * 1000);

    return this.ws;
    } catch (error) {
      console.error("❌ Failed to initialize WebSocket:", error.message);
      this.isConnected = false;
      throw error;
    }
  }

  calculateChange(instrumentName, currentPrice) {
    if (!this.previousPrices) {
      this.previousPrices = {};
    }
    
    const previousPrice = this.previousPrices[instrumentName];
    this.previousPrices[instrumentName] = currentPrice;
    
    if (!previousPrice) {
      return { value: 0, percentage: 0 };
    }
    
    const change = currentPrice - previousPrice;
    const percentage = (change / previousPrice) * 100;
    
    return {
      value: parseFloat(change.toFixed(2)),
      percentage: parseFloat(percentage.toFixed(2))
    };
  }

  getAllPrices() {
    return this.prices;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      timestamp: new Date().toISOString()
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.isConnected = false;
      console.log('🔌 Price WebSocket disconnected');
    }
  }
}

export default new PriceWebSocket();

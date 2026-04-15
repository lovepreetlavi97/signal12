import WebSocket from "ws";
import dotenv from "dotenv";
import { SwingStrategy } from "./swingStrategy.js";
import { TraderService } from "./traderService.js";

dotenv.config();
const { SMARTAPI_KEY } = process.env;

// 🧠 Initialize Trader and Strategy
const trader = new TraderService({
  startingBalance: 100000, // ₹1 lakh paper money
  riskPercent: 0.5, // risk 0.5% per trade
});

const strategy = new SwingStrategy({
  trader,
  shortPeriod: 9,
  longPeriod: 21,
  rsiPeriod: 14,
  atrPeriod: 14,
  atrMultiplier: 3,
});

// 🌐 WebSocket Connect Function
export async function connectWebSocket(feedToken, jwt, clientCode, wsUrl) {
  const fullUrl = `${wsUrl}?clientCode=${clientCode}&feedToken=${feedToken}&apiKey=${SMARTAPI_KEY}`;
  
  console.log("🌐 Connecting to Angel One WebSocket:", fullUrl);
  
  const ws = new WebSocket(fullUrl);

  ws.on("open", () => {
    console.log("✅ WebSocket connected. Subscribing to NIFTY 50, SENSEX, DOLLAR, and VIX...");
    
    const payload = {
      action: 1,
      params: {
        mode: 1, // LTP (Last Traded Price)
        tokenList: [
          {
            exchangeType: 1, // NSE
            tokens: [
              "26000", // NIFTY 50
              "26001", // NIFTY BANK
              "260105" // INDIA VIX
            ]
          },
          {
            exchangeType: 2, // BSE
            tokens: [
              "1",      // SENSEX
              "999999"  // USD-INR (if available)
            ]
          }
        ],
      },
    };
    
    ws.send(JSON.stringify(payload));
    console.log("📡 Subscribed to market data feed...");
  });

  ws.on("message", (data) => {
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
      
      console.log(`📈 ${instrumentName} | ₹${ltp.toFixed(2)} ⏱️ ${new Date().toLocaleTimeString()}`);
      
      // 🚀 Feed live tick to strategy (only for NIFTY 50 for trading)
      if (tokenStr === "26000") {
        strategy.onTick(ltp, {
          token: tokenStr,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (err) {
      console.error("⚠️ Parse error:", err.message);
    }
  });

  ws.on("error", (err) => console.error("❌ WebSocket Error:", err.message));
  
  ws.on("close", (code, reason) => {
    console.log(`⚠️ WebSocket closed. Code: ${code}, Reason: ${reason}`);
    
    // Auto-reconnect after 5 seconds
    setTimeout(() => {
      console.log("🔄 Attempting to reconnect...");
      connectWebSocket(feedToken, jwt, clientCode, wsUrl);
    }, 5000);
  });

  // 💓 Keepalive ping
  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 0 }));
    }
  }, 30 * 1000);

  return ws;
}

// 🎯 Get strategy state for API endpoints
export function getStrategyState() {
  return strategy.getStrategyState();
}

// 🎯 Get trader service for API endpoints
export function getTraderService() {
  return trader;
}

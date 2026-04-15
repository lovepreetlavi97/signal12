class MockPriceService {
  constructor() {
    this.io = null;
    this.prices = {
      "NIFTY 50": 24230.85,
      "NIFTY BANK": 56275.05,
      "SENSEX": 79040.36,
      "INDIA VIX": 18.60,
      "USD-INR": 84.58
    };
    this.previousPrices = { ...this.prices };
    this.interval = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  start() {
    console.log("🔄 Starting mock price service for testing...");
    
    // Send initial prices
    this.sendInitialPrices();
    
    // Update prices every 2 seconds
    this.interval = setInterval(() => {
      this.updatePrices();
    }, 2000);
  }

  sendInitialPrices() {
    if (this.io) {
      Object.keys(this.prices).forEach(instrument => {
        const change = this.calculateChange(instrument, this.prices[instrument]);
        this.io.emit('price_update', {
          instrument,
          price: this.prices[instrument],
          timestamp: new Date().toISOString(),
          change
        });
      });
    }
  }

  updatePrices() {
    Object.keys(this.prices).forEach(instrument => {
      // Generate random price movement
      const basePrice = this.prices[instrument];
      const changePercent = (Math.random() - 0.5) * 0.5; // -0.25% to +0.25%
      const newPrice = basePrice * (1 + changePercent / 100);
      
      this.previousPrices[instrument] = this.prices[instrument];
      this.prices[instrument] = parseFloat(newPrice.toFixed(2));
      
      const change = this.calculateChange(instrument, this.prices[instrument]);
      
      console.log(`📈 ${instrument} | ₹${this.prices[instrument].toFixed(2)} ⏱️ ${new Date().toLocaleTimeString()}`);
      
      if (this.io) {
        this.io.emit('price_update', {
          instrument,
          price: this.prices[instrument],
          timestamp: new Date().toISOString(),
          change
        });
      }
    });
  }

  calculateChange(instrumentName, currentPrice) {
    const previousPrice = this.previousPrices[instrumentName];
    
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
    const result = {};
    Object.keys(this.prices).forEach(instrument => {
      result[instrument] = {
        price: this.prices[instrument],
        timestamp: new Date().toISOString(),
        change: this.calculateChange(instrument, this.prices[instrument])
      };
    });
    return result;
  }

  getConnectionStatus() {
    return {
      isConnected: true,
      timestamp: new Date().toISOString(),
      mode: 'mock'
    };
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('🔌 Mock price service stopped');
  }
}

export default new MockPriceService();

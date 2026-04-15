export class SwingStrategy {
  constructor({ trader, shortPeriod = 9, longPeriod = 21, rsiPeriod = 14, atrPeriod = 14, atrMultiplier = 3 }) {
    this.trader = trader;
    this.shortPeriod = shortPeriod;
    this.longPeriod = longPeriod;
    this.rsiPeriod = rsiPeriod;
    this.atrPeriod = atrPeriod;
    this.atrMultiplier = atrMultiplier;
    
    this.prices = [];
    this.highs = [];
    this.lows = [];
    this.rsiValues = [];
    this.atrValues = [];
    
    this.lastSignal = null;
    this.currentPosition = null;
  }

  onTick(price, metadata = {}) {
    this.prices.push(price);
    this.highs.push(price);
    this.lows.push(price);

    // Keep only needed history
    const maxPeriod = Math.max(this.longPeriod, this.rsiPeriod, this.atrPeriod);
    if (this.prices.length > maxPeriod + 50) {
      this.prices = this.prices.slice(-maxPeriod - 50);
      this.highs = this.highs.slice(-maxPeriod - 50);
      this.lows = this.lows.slice(-maxPeriod - 50);
    }

    if (this.prices.length < this.longPeriod) {
      return { action: 'hold', reason: 'Insufficient data' };
    }

    const indicators = this.calculateIndicators();
    const signal = this.generateSignal(indicators, price);

    if (signal.action !== 'hold' && signal.action !== this.lastSignal) {
      this.executeSignal(signal, price, metadata);
      this.lastSignal = signal.action;
    }

    return {
      ...signal,
      indicators,
      currentPrice: price,
      balance: this.trader.getCurrentBalance()
    };
  }

  calculateIndicators() {
    const shortMA = this.calculateSMA(this.prices, this.shortPeriod);
    const longMA = this.calculateSMA(this.prices, this.longPeriod);
    const rsi = this.calculateRSI();
    const atr = this.calculateATR();

    return {
      shortMA,
      longMA,
      rsi,
      atr,
      prices: this.prices.slice(-10)
    };
  }

  calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const slice = prices.slice(-period);
    return slice.reduce((sum, price) => sum + price, 0) / period;
  }

  calculateRSI() {
    if (this.prices.length < this.rsiPeriod + 1) return null;

    const gains = [];
    const losses = [];

    for (let i = 1; i < this.prices.length; i++) {
      const change = this.prices[i] - this.prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const avgGain = gains.slice(-this.rsiPeriod).reduce((sum, gain) => sum + gain, 0) / this.rsiPeriod;
    const avgLoss = losses.slice(-this.rsiPeriod).reduce((sum, loss) => sum + loss, 0) / this.rsiPeriod;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateATR() {
    if (this.highs.length < this.atrPeriod + 1) return null;

    const trueRanges = [];
    for (let i = 1; i < this.highs.length; i++) {
      const high = this.highs[i];
      const low = this.lows[i];
      const prevClose = this.prices[i - 1];
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }

    const atr = trueRanges.slice(-this.atrPeriod).reduce((sum, tr) => sum + tr, 0) / this.atrPeriod;
    return atr;
  }

  generateSignal(indicators, currentPrice) {
    const { shortMA, longMA, rsi, atr } = indicators;

    if (!shortMA || !longMA || !rsi || !atr) {
      return { action: 'hold', reason: 'Indicators not ready' };
    }

    // Golden Cross - Buy signal
    if (shortMA > longMA && rsi < 70) {
      const stopLoss = currentPrice - (atr * this.atrMultiplier);
      const target = currentPrice + (atr * this.atrMultiplier * 2);
      
      return {
        action: 'buy',
        reason: 'Golden Cross with RSI confirmation',
        stopLoss,
        target,
        strength: rsi < 30 ? 'strong' : 'medium'
      };
    }

    // Death Cross - Sell signal
    if (shortMA < longMA && rsi > 30) {
      const stopLoss = currentPrice + (atr * this.atrMultiplier);
      const target = currentPrice - (atr * this.atrMultiplier * 2);
      
      return {
        action: 'sell',
        reason: 'Death Cross with RSI confirmation',
        stopLoss,
        target,
        strength: rsi > 70 ? 'strong' : 'medium'
      };
    }

    return { action: 'hold', reason: 'No clear signal' };
  }

  executeSignal(signal, price, metadata) {
    if (signal.action === 'buy' && !this.currentPosition) {
      this.currentPosition = this.trader.enterPosition({
        type: 'long',
        entryPrice: price,
        stopLoss: signal.stopLoss,
        target: signal.target,
        timestamp: metadata.timestamp || new Date().toISOString()
      });
      
      console.log(`📈 BUY signal executed at ₹${price.toFixed(2)}`);
    } else if (signal.action === 'sell' && !this.currentPosition) {
      this.currentPosition = this.trader.enterPosition({
        type: 'short',
        entryPrice: price,
        stopLoss: signal.stopLoss,
        target: signal.target,
        timestamp: metadata.timestamp || new Date().toISOString()
      });
      
      console.log(`📉 SELL signal executed at ₹${price.toFixed(2)}`);
    }

    // Check for exit conditions
    if (this.currentPosition) {
      const shouldExit = this.checkExitConditions(price, signal);
      if (shouldExit) {
        this.trader.exitPosition(
          this.currentPosition.id,
          price,
          metadata.timestamp || new Date().toISOString()
        );
        
        console.log(`🔄 Position closed at ₹${price.toFixed(2)} | PnL: ₹${this.currentPosition.pnl?.toFixed(2) || 'N/A'}`);
        this.currentPosition = null;
      }
    }
  }

  checkExitConditions(currentPrice, signal) {
    if (!this.currentPosition) return false;

    const { entryPrice, stopLoss, target, type } = this.currentPosition;

    if (type === 'long') {
      return currentPrice <= stopLoss || currentPrice >= target;
    } else {
      return currentPrice >= stopLoss || currentPrice <= target;
    }
  }

  getStrategyState() {
    return {
      prices: this.prices.slice(-20),
      indicators: this.calculateIndicators(),
      currentPosition: this.currentPosition,
      lastSignal: this.lastSignal,
      balance: this.trader.getCurrentBalance(),
      openPositions: this.trader.getOpenPositions()
    };
  }
}

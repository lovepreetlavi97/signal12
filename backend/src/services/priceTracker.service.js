import Signal from '../models/Signal.js';

/**
 * Price Tracker Service
 * Simulates market movement and checks for SL/Target hits.
 * In production, you would connect this to a WebSocket like Binance or NSE.
 */
export const startPriceTracker = (io) => {
  setInterval(async () => {
    const activeSignals = await Signal.find({ status: 'ACTIVE' });

    for (const signal of activeSignals) {
      // 1. Simulate a random price movement (0.1% to 0.5%)
      const movement = (Math.random() - 0.45) * (signal.entry * 0.01);
      const newPrice = (signal.currentPrice || signal.entry) + movement;

      let status = 'ACTIVE';
      
      // 2. Check for SL Hit
      if (signal.type === 'BUY' && newPrice <= signal.sl) status = 'SL_HIT';
      if (signal.type === 'SELL' && newPrice >= signal.sl) status = 'SL_HIT';

      // 3. Check for Target Hit (Checking Target 1)
      if (signal.type === 'BUY' && newPrice >= signal.targets[0]) status = 'TARGET_HIT';
      if (signal.type === 'SELL' && newPrice <= signal.targets[0]) status = 'TARGET_HIT';

      // 4. Update Database
      signal.currentPrice = newPrice;
      signal.status = status;
      await signal.save();

      // 5. Emit Update to Frontend
      io.emit('update_signal', signal);
      
      if (status !== 'ACTIVE') {
        process.stdout.write(`\n[SIGNAL STATUS] ${signal.symbol} -> ${status} at ${newPrice.toFixed(2)}\n`);
      }
    }
  }, 3000); // Check every 3 seconds
};

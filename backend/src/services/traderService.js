export class TraderService {
  constructor({ startingBalance, riskPercent }) {
    this.startingBalance = startingBalance;
    this.currentBalance = startingBalance;
    this.riskPercent = riskPercent;
    this.positions = [];
    this.trades = [];
  }

  getRiskAmount() {
    return this.currentBalance * (this.riskPercent / 100);
  }

  calculatePositionSize(entryPrice, stopLoss) {
    const riskAmount = this.getRiskAmount();
    const riskPerShare = Math.abs(entryPrice - stopLoss);
    return Math.floor(riskAmount / riskPerShare);
  }

  enterPosition({ type, entryPrice, stopLoss, target, timestamp }) {
    const positionSize = this.calculatePositionSize(entryPrice, stopLoss);
    const position = {
      id: Date.now(),
      type,
      entryPrice,
      stopLoss,
      target,
      quantity: positionSize,
      timestamp,
      status: 'open'
    };
    
    this.positions.push(position);
    return position;
  }

  exitPosition(positionId, exitPrice, timestamp) {
    const position = this.positions.find(p => p.id === positionId);
    if (!position) return null;

    position.status = 'closed';
    position.exitPrice = exitPrice;
    position.exitTimestamp = timestamp;

    const pnl = position.type === 'long' 
      ? (exitPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - exitPrice) * position.quantity;

    position.pnl = pnl;
    this.currentBalance += pnl;
    this.trades.push(position);

    return position;
  }

  getCurrentBalance() {
    return this.currentBalance;
  }

  getOpenPositions() {
    return this.positions.filter(p => p.status === 'open');
  }

  getTradeHistory() {
    return this.trades;
  }
}

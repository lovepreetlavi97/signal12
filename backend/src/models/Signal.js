import mongoose from 'mongoose';

const signalSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true }, // NIFTY, BANKNIFTY, etc.
  market: { type: String, required: true, index: true }, // NSE, CRYPTO, etc.
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  entry: { type: Number, required: true },
  sl: { type: Number, required: true },
  targets: [{ type: Number, required: true }],
  currentPrice: { type: Number },
  timeframe: { type: String, default: '5m' },
  aiScore: { type: Number, default: 0 },
  aiSentiment: { type: String, default: 'Neutral' },
  aiRationale: { type: String, default: 'Analyzing Market Dynamics...' },
  optionType: { type: String, enum: ['CE', 'PE', 'NONE'], default: 'NONE' },
  expiryDate: { type: String },
  percentageChange: { type: String },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'TARGET_HIT', 'SL_HIT', 'CANCELLED', 'CLOSED'], 
    default: 'ACTIVE',
    index: true 
  },
  source: { type: String, required: true }, // Telegram Channel Name
  telegramMessageId: { type: String },
  rawText: { type: String },
  imageUrl: { type: String },
  accuracy: { type: Number }, // P/L estimate
}, { timestamps: true });

// Index for real-time querying
signalSchema.index({ createdAt: -1 });

const Signal = mongoose.model('Signal', signalSchema);
export default Signal;

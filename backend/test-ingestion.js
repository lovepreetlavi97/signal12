import axios from 'axios';

const testSignals = [
  "BUY NIFTY AT 22500 SL 22400 TARGET 22600, 22700, 22800",
  "SELL BANKNIFTY @ 47800 STOPLOSS 48050 TGT 47500, 47300",
  "NIFTY 22600 CE BUY ABOVE 150 SL 120 TARGET 180, 220, 260",
  "RELIANCE BUY @ 2950 SL 2920 TP 3000, 3050"
];

const sendSignal = async () => {
  const signal = testSignals[Math.floor(Math.random() * testSignals.length)];
  console.log(`Sending Signal: ${signal}`);
  
  try {
    await axios.post('http://localhost:4000/test-signal', {
      text: signal,
      source: 'Telegram Channel Pro'
    });
    console.log('Signal Sent Successfully!');
  } catch (err) {
    console.error('Failed to send signal. Is the backend running?');
  }
};

sendSignal();

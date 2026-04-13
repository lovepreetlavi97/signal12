/**
 * Signal Parser Service
 * Extracts structured trading data from raw text using regex.
 */

export const parseSignal = (text) => {
  const signal = {
    symbol: 'NIFTY', // Default
    type: 'BUY',
    optionType: 'NONE',
    entry: null,
    sl: null,
    targets: [],
    currentPrice: null,
    percentageChange: null,
    expiryDate: null,
    market: 'NSE'
  };

  const normalizedText = text.toUpperCase();

  // 1. Detect Symbol (SENSEX or NIFTY)
  const symbolMatch = normalizedText.match(/(SENSEX|NIFTY|BANKNIFTY|FINNIFTY)/i);
  if (symbolMatch) signal.symbol = symbolMatch[0];

  // 2. Detect Option Type (CE/PE)
  if (normalizedText.includes('CE')) {
    signal.optionType = 'CE';
    signal.type = 'BUY';
  } else if (normalizedText.includes('PE')) {
    signal.optionType = 'PE';
    signal.type = 'SELL';
  }

  // 3. Pattern: above :- ...
  const entryMatch = normalizedText.match(/ABOVE\s*[:\-]\s*(\d+(?:\.\d+)?)/i);
  if (entryMatch) signal.entry = parseFloat(entryMatch[1]);

  // 4. Pattern: SL :- ...
  const slMatch = normalizedText.match(/SL\s*[:\-]\s*(\d+(?:\.\d+)?)/i);
  if (slMatch) signal.sl = parseFloat(slMatch[1]);

  // 5. Pattern: target :- .../.../.../
  const targetLineMatch = normalizedText.match(/TARGET\s*[:\-]\s*([^\n\r]+)/i);
  if (targetLineMatch) {
    const targets = targetLineMatch[1].split(/[/\s]+/).filter(t => !isNaN(parseFloat(t)));
    signal.targets = targets.map(t => parseFloat(t));
  }

  // 6. OCR Patterns (Current Price, Percentage, Expiry)
  const cmpMatch = normalizedText.match(/(?:CURRENT PRICE|CMP)\s*(\d+(?:\.\d+)?)/i);
  if (cmpMatch) signal.currentPrice = parseFloat(cmpMatch[1]);

  const percentMatch = normalizedText.match(/([+-]\s*\d+(?:\.\d+)?%)/i);
  if (percentMatch) signal.percentageChange = percentMatch[0].replace(/\s/g, '');

  // Extract date/month for expiry
  const dateMatch = normalizedText.match(/(\d{1,2}\s*[A-Z]{3})/i);
  if (dateMatch) signal.expiryDate = dateMatch[0];

  return signal;
};

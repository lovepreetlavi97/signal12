import { initTelegramListener } from '../../services/telegram.service.js';
import { extractTextFromImage } from '../../services/ocr.service.js';
import signalsService from '../signals/signals.service.js';
import logger from '../../utils/logger.js';

/**
 * Telegram Listener Module
 * Orchestrates the reception of Telegram messages, OCR processing, and Signal creation.
 */
export const startTelegramIntegration = async () => {
  if (!process.env.TELEGRAM_API_ID || !process.env.TELEGRAM_API_HASH) {
    logger.warn('⚠️ Telegram API credentials missing. Telegram integration disabled.');
    return;
  }

  try {
    await initTelegramListener(async (message) => {
      logger.info(`📥 New Telegram Content Received [Peer: ${message.source}]`);

      let rawText = message.message || '';

      // 1. Handle Image Media (OCR)
      if (message.mediaBuffer) {
        logger.info('🔍 Processing Image with OCR...');
        try {
          const ocrText = await extractTextFromImage(message.mediaBuffer);
          rawText = `${rawText}\n${ocrText}`;
          logger.info(`✅ OCR Result partial: ${ocrText.slice(0, 50)}...`);
        } catch (ocrErr) {
          logger.error('❌ OCR Failed', ocrErr);
        }
      }

      // 2. Process via Signal Service
      if (rawText.length > 10) {
        try {
          const savedSignal = await signalsService.createSignal(rawText, message.source);
          if (savedSignal) {
            logger.info(`🚀 Signal Broadcasted: ${savedSignal.symbol} ${savedSignal.optionType || ''}`);
          }
        } catch (signalErr) {
          logger.error('❌ Failed to process signal from text', signalErr);
        }
      }
    });

    logger.info('✌️ Telegram Integration Active!');
  } catch (err) {
    logger.error('🔥 Telegram Integration Failed to start', err);
  }
};

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { NewMessage } from 'telegram/events/index.js';
import input from 'input'; // For initial login

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
// If it's a placeholder or empty, use an empty string
const sessionString = process.env.TELEGRAM_SESSION && process.env.TELEGRAM_SESSION.length > 20 
  ? process.env.TELEGRAM_SESSION 
  : "";
const stringSession = new StringSession(sessionString); 

/**
 * Telegram Service
 * Connects to Telegram and listens for new messages.
 */
export const initTelegramListener = async (onNewMessage) => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text('Please enter your phone number: '),
    password: async () => await input.text('Please enter your password: '),
    phoneCode: async () => await input.text('Please enter the code you received: '),
    onError: (err) => console.log(err),
  });

  const savedSession = client.session.save();
  console.log('\n' + '='.repeat(60));
  console.log('🚀 TELEGRAM LOGIN SUCCESSFUL!');
  console.log('='.repeat(60));
  console.log('PERMANENT SOLUTION: Copy the following string to your .env');
  console.log('TELEGRAM_SESSION=' + savedSession);
  console.log('='.repeat(60) + '\n');

  // --- History Fetching Logic ---
  const fetchRecentHistory = async () => {
    const dialogs = await client.getDialogs({});
    const target = dialogs.find(d => d.title?.toUpperCase().includes('TR - PREMIUM'));

    if (target) {
      console.log(`[HISTORY-SCAN] Fetching last 20 messages from: ${target.title}`);
      const messages = await client.getMessages(target.entity, { limit: 20 });
      
      for (const msg of messages) {
        let mediaBuffer = null;
        if (msg.media) {
          mediaBuffer = await client.downloadMedia(msg.media, {});
        }
        onNewMessage({ ...msg, mediaBuffer, source: target.title });
      }
      console.log('[HISTORY-SCAN] Scan complete. Dashboard should be populated.');
    }
  };

  // Run history fetch after a short delay to ensure everything is initialized
  setTimeout(fetchRecentHistory, 5000);

  client.addEventHandler(async (event) => {
    const message = event.message;
    if (message.peerId) {
       // Get Group Name to Filter
       const sender = await message.getSender();
       const title = sender?.title || 'Private/Other';

       console.log(`[TELEGRAM-LIVE] Message from: ${title}`);

       // Filter: Target the TR - Premium group
       if (title.toUpperCase().includes('TR - PREMIUM')) {
         console.log('✅ Premium Signal Source Detected!');
         
         // If message has media (Image)
         if (message.media) {
           console.log('🖼️ Media detected. Downloading for OCR...');
           const buffer = await client.downloadMedia(message.media, {});
           onNewMessage({ ...message, mediaBuffer: buffer, source: title });
         } else {
           onNewMessage({ ...message, source: title });
         }
       }
    }
  }, new NewMessage({}));
};

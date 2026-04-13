import Tesseract from 'tesseract.js';

/**
 * OCR Service
 * Processes images to extract text.
 */
export const extractTextFromImage = async (imageBuffer) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageBuffer,
      'eng',
      { logger: m => console.log(m) }
    );
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};

const Tesseract = require('tesseract.js');

class OCRService {
  async extractText(imageBuffer) {
    try {
      const result = await Tesseract.recognize(
        imageBuffer,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${(m.progress * 100).toFixed(2)}%`);
            }
          }
        }
      );

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words.length
      };
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async processHomeworkImage(imageBuffer) {
    const ocrResult = await this.extractText(imageBuffer);
    
    if (ocrResult.confidence < 30) {
      throw new Error('Image quality too low. Please upload a clearer image.');
    }

    if (ocrResult.words < 3) {
      throw new Error('No readable text found in image. Please ensure the homework is clearly visible.');
    }

    return ocrResult;
  }
}

module.exports = new OCRService();

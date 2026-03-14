const axios = require('axios');
const AiUsageLog = require('../models/AiUsageLog');

class AIService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  async generateResponse(prompt, type = 'homework', userId = null) {
    const cacheKey = this.generateCacheKey(prompt, type);
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        if (userId) {
          await this.logUsage(userId, type, prompt, cached.response, 0, true);
        }
        return { response: cached.response, cached: true };
      }
    }

    const startTime = Date.now();
    
    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(type)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      const processingTime = Date.now() - startTime;
      const tokensUsed = response.data.usage?.total_tokens || 0;

      // Cache the response
      this.cache.set(cacheKey, {
        response: aiResponse,
        timestamp: Date.now()
      });

      // Log usage
      if (userId) {
        await this.logUsage(userId, type, prompt, aiResponse, tokensUsed, false, processingTime);
      }

      return { response: aiResponse, cached: false, tokensUsed };
    } catch (error) {
      console.error('AI Service Error:', error.message);
      throw new Error('Failed to generate AI response');
    }
  }

  getSystemPrompt(type) {
    const prompts = {
      homework: 'You are a helpful tutor. Provide step-by-step explanations. Be encouraging and clear.',
      tutor: 'You are a knowledgeable AI tutor. Explain concepts clearly, use examples, and encourage critical thinking.',
      quiz_hint: 'Provide a helpful hint without giving away the answer. Encourage the user to think.',
      image: 'Analyze the homework problem in the image. Provide a step-by-step solution.'
    };
    return prompts[type] || prompts.homework;
  }

  generateCacheKey(prompt, type) {
    return `${type}_${Buffer.from(prompt).toString('base64').slice(0, 50)}`;
  }

  async logUsage(userId, type, prompt, response, tokensUsed, cached, processingTime = 0) {
    try {
      await AiUsageLog.create({
        userId,
        type,
        prompt: prompt.slice(0, 500), // Limit stored prompt size
        response: response.slice(0, 500),
        tokensUsed,
        processingTime,
        cached
      });
    } catch (error) {
      console.error('Failed to log AI usage:', error);
    }
  }

  async generateQuizHint(question, options) {
    const prompt = `Question: ${question}\nOptions: ${JSON.stringify(options)}\nProvide a helpful hint.`;
    return await this.generateResponse(prompt, 'quiz_hint');
  }

  async askAudience(question, options) {
    const prompt = `For the question: "${question}", simulate audience polling results for options A, B, C, D. Return as percentages that favor the correct answer but make it realistic.`;
    return await this.generateResponse(prompt, 'quiz_hint');
  }
}

module.exports = new AIService();

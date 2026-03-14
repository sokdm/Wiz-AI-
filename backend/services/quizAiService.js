const aiService = require('./aiService');

class QuizAiService {
  async generateQuestion(level, category) {
    const difficultyDescriptions = {
      1: 'very easy (elementary school)',
      2: 'easy (elementary school)',
      3: 'easy-medium (middle school)',
      4: 'medium (middle school)',
      5: 'medium-hard (high school)',
      6: 'hard (high school)',
      7: 'hard (advanced high school)',
      8: 'very hard (college level)',
      9: 'expert (college level)',
      10: 'expert (advanced college)',
      11: 'master (professional)',
      12: 'master (advanced professional)',
      13: 'grandmaster (expert professional)',
      14: 'grandmaster (world-class)',
      15: 'ultimate (million dollar question)'
    };

    const categories = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'General Knowledge'];
    const selectedCategory = category || categories[Math.floor(Math.random() * categories.length)];
    const difficulty = difficultyDescriptions[level] || 'medium';

    const prompt = `Generate a multiple choice quiz question for a "Who Wants to Be a Millionaire" style game.

Level: ${level}/15
Difficulty: ${difficulty}
Category: ${selectedCategory}

Requirements:
- Question should be appropriate for difficulty level ${level} out of 15
- Four options labeled A, B, C, D
- Only ONE correct answer
- Wrong answers should be plausible but clearly incorrect
- Include a brief explanation of why the correct answer is right

Format your response EXACTLY like this:
QUESTION: [your question here]
A: [option A]
B: [option B]
C: [option C]
D: [option D]
CORRECT: [A/B/C/D]
EXPLANATION: [brief explanation]`;

    try {
      const result = await aiService.generateResponse(prompt, 'quiz_hint');
      const parsed = this.parseQuestion(result.response, level, selectedCategory);
      return parsed;
    } catch (error) {
      console.error('AI Question Generation Error:', error);
      // Return fallback question if AI fails
      return this.getFallbackQuestion(level, selectedCategory);
    }
  }

  parseQuestion(aiResponse, level, category) {
    try {
      const lines = aiResponse.split('\n').filter(line => line.trim());
      
      let question = '', options = {}, correctAnswer = '', explanation = '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('QUESTION:')) {
          question = trimmed.replace('QUESTION:', '').trim();
        } else if (trimmed.match(/^[A-D]:/)) {
          const key = trimmed[0];
          options[key] = trimmed.substring(2).trim();
        } else if (trimmed.startsWith('CORRECT:')) {
          correctAnswer = trimmed.replace('CORRECT:', '').trim();
        } else if (trimmed.startsWith('EXPLANATION:')) {
          explanation = trimmed.replace('EXPLANATION:', '').trim();
        }
      }

      // Validate
      if (!question || Object.keys(options).length !== 4 || !correctAnswer) {
        throw new Error('Failed to parse AI response');
      }

      return {
        question,
        options,
        correctAnswer,
        explanation,
        difficultyLevel: level,
        category,
        isActive: true
      };
    } catch (error) {
      console.error('Parse Error:', error);
      return this.getFallbackQuestion(level, category);
    }
  }

  getFallbackQuestion(level, category) {
    // Fallback questions if AI fails
    const fallbacks = [
      {
        question: "What is the capital of France?",
        options: { A: "London", B: "Berlin", C: "Paris", D: "Madrid" },
        correctAnswer: "C",
        explanation: "Paris is the capital of France."
      },
      {
        question: "What is 2 + 2?",
        options: { A: "3", B: "4", C: "5", D: "6" },
        correctAnswer: "B",
        explanation: "2 + 2 = 4"
      }
    ];
    
    const fallback = fallbacks[level % fallbacks.length];
    return {
      ...fallback,
      difficultyLevel: level,
      category: category || 'General Knowledge',
      isActive: true
    };
  }

  async generateAudiencePoll(question, options, correctAnswer) {
    const prompt = `For the question: "${question}"
Options: A) ${options.A}, B) ${options.B}, C) ${options.C}, D) ${options.D}
Correct answer is: ${correctAnswer}

Simulate an audience poll for "Who Wants to Be a Millionaire". 
The audience should favor the correct answer but make it realistic (not 100%).
Return ONLY the percentages for each option in this format:
A: XX%
B: XX%
C: XX%
D: XX%`;

    try {
      const result = await aiService.generateResponse(prompt, 'quiz_hint');
      return result.response;
    } catch (error) {
      // Fallback distribution favoring correct answer
      return `A: ${correctAnswer === 'A' ? '45%' : '20%'}
B: ${correctAnswer === 'B' ? '45%' : '20%'}
C: ${correctAnswer === 'C' ? '45%' : '20%'}
D: ${correctAnswer === 'D' ? '45%' : '20%'}`;
    }
  }
}

module.exports = new QuizAiService();

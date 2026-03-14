const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });

const sampleQuestions = [
  // Level 1 (Easy)
  {
    question: "What is 5 + 7?",
    options: { A: "10", B: "11", C: "12", D: "13" },
    correctAnswer: "C",
    difficultyLevel: 1,
    category: "Mathematics",
    explanation: "5 + 7 = 12"
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: { A: "Venus", B: "Mars", C: "Jupiter", D: "Saturn" },
    correctAnswer: "B",
    difficultyLevel: 1,
    category: "Science",
    explanation: "Mars is called the Red Planet due to iron oxide on its surface."
  },
  {
    question: "What is the capital of France?",
    options: { A: "London", B: "Berlin", C: "Paris", D: "Madrid" },
    correctAnswer: "C",
    difficultyLevel: 1,
    category: "Geography",
    explanation: "Paris is the capital and largest city of France."
  },
  {
    question: "How many sides does a triangle have?",
    options: { A: "2", B: "3", C: "4", D: "5" },
    correctAnswer: "B",
    difficultyLevel: 1,
    category: "Mathematics",
    explanation: "A triangle has 3 sides and 3 angles."
  },
  // Level 2
  {
    question: "What is the chemical symbol for water?",
    options: { A: "CO2", B: "H2O", C: "O2", D: "NaCl" },
    correctAnswer: "B",
    difficultyLevel: 2,
    category: "Science",
    explanation: "Water consists of two hydrogen atoms and one oxygen atom (H2O)."
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: { A: "Charles Dickens", B: "William Shakespeare", C: "Jane Austen", D: "Mark Twain" },
    correctAnswer: "B",
    difficultyLevel: 2,
    category: "English",
    explanation: "William Shakespeare wrote Romeo and Juliet around 1594-1596."
  },
  // Level 3
  {
    question: "What is 15% of 200?",
    options: { A: "25", B: "30", C: "35", D: "40" },
    correctAnswer: "B",
    difficultyLevel: 3,
    category: "Mathematics",
    explanation: "15% of 200 = 0.15 × 200 = 30"
  },
  {
    question: "Which gas do plants absorb from the atmosphere?",
    options: { A: "Oxygen", B: "Carbon Dioxide", C: "Nitrogen", D: "Hydrogen" },
    correctAnswer: "B",
    difficultyLevel: 3,
    category: "Science",
    explanation: "Plants absorb CO2 during photosynthesis and release oxygen."
  },
  // Level 4
  {
    question: "What is the largest ocean on Earth?",
    options: { A: "Atlantic Ocean", B: "Indian Ocean", C: "Pacific Ocean", D: "Arctic Ocean" },
    correctAnswer: "C",
    difficultyLevel: 4,
    category: "Geography",
    explanation: "The Pacific Ocean is the largest, covering about 63 million square miles."
  },
  {
    question: "Solve for x: 2x + 10 = 20",
    options: { A: "3", B: "4", C: "5", D: "6" },
    correctAnswer: "C",
    difficultyLevel: 4,
    category: "Mathematics",
    explanation: "2x = 10, therefore x = 5"
  },
  // Level 5
  {
    question: "Who painted the Mona Lisa?",
    options: { A: "Vincent van Gogh", B: "Pablo Picasso", C: "Leonardo da Vinci", D: "Michelangelo" },
    correctAnswer: "C",
    difficultyLevel: 5,
    category: "History",
    explanation: "Leonardo da Vinci painted the Mona Lisa between 1503-1519."
  },
  {
    question: "What is the powerhouse of the cell?",
    options: { A: "Nucleus", B: "Mitochondria", C: "Ribosome", D: "Chloroplast" },
    correctAnswer: "B",
    difficultyLevel: 5,
    category: "Science",
    explanation: "Mitochondria generate most of the cell's supply of adenosine triphosphate (ATP)."
  },
  // Level 6
  {
    question: "What is the square root of 144?",
    options: { A: "10", B: "11", C: "12", D: "14" },
    correctAnswer: "C",
    difficultyLevel: 6,
    category: "Mathematics",
    explanation: "12 × 12 = 144"
  },
  {
    question: "Which element has the chemical symbol 'Au'?",
    options: { A: "Silver", B: "Aluminum", C: "Gold", D: "Argon" },
    correctAnswer: "C",
    difficultyLevel: 6,
    category: "Science",
    explanation: "Au comes from the Latin word for gold, 'aurum'."
  },
  // Level 7
  {
    question: "In which year did World War II end?",
    options: { A: "1943", B: "1944", C: "1945", D: "1946" },
    correctAnswer: "C",
    difficultyLevel: 7,
    category: "History",
    explanation: "World War II ended in 1945 with the surrender of Japan."
  },
  {
    question: "What is the formula for the area of a circle?",
    options: { A: "2πr", B: "πr²", C: "πd", D: "2πr²" },
    correctAnswer: "B",
    difficultyLevel: 7,
    category: "Mathematics",
    explanation: "Area = π × radius²"
  },
  // Level 8
  {
    question: "Which country has the largest population?",
    options: { A: "India", B: "China", C: "USA", D: "Indonesia" },
    correctAnswer: "A",
    difficultyLevel: 8,
    category: "Geography",
    explanation: "As of 2024, India has the largest population, surpassing China."
  },
  {
    question: "What is the speed of light approximately?",
    options: { A: "300,000 km/s", B: "150,000 km/s", C: "400,000 km/s", D: "250,000 km/s" },
    correctAnswer: "A",
    difficultyLevel: 8,
    category: "Science",
    explanation: "Light travels at approximately 299,792 kilometers per second in a vacuum."
  },
  // Level 9
  {
    question: "Who developed the theory of relativity?",
    options: { A: "Isaac Newton", B: "Albert Einstein", C: "Stephen Hawking", D: "Galileo Galilei" },
    correctAnswer: "B",
    difficultyLevel: 9,
    category: "Science",
    explanation: "Albert Einstein published the theory of relativity in 1905 (special) and 1915 (general)."
  },
  {
    question: "What is the value of x in: 3x² - 12 = 0?",
    options: { A: "±1", B: "±2", C: "±3", D: "±4" },
    correctAnswer: "B",
    difficultyLevel: 9,
    category: "Mathematics",
    explanation: "3x² = 12, x² = 4, x = ±2"
  },
  // Level 10
  {
    question: "Which Shakespeare play features the character Prospero?",
    options: { A: "Hamlet", B: "Macbeth", C: "The Tempest", D: "King Lear" },
    correctAnswer: "C",
    difficultyLevel: 10,
    category: "English",
    explanation: "Prospero is the protagonist in Shakespeare's The Tempest."
  },
  {
    question: "What is the hardest natural substance on Earth?",
    options: { A: "Gold", B: "Iron", C: "Diamond", D: "Platinum" },
    correctAnswer: "C",
    difficultyLevel: 10,
    category: "Science",
    explanation: "Diamond is the hardest known natural material, rated 10 on the Mohs scale."
  },
  // Level 11
  {
    question: "Which ancient wonder of the world still stands today?",
    options: { A: "Colossus of Rhodes", B: "Great Pyramid of Giza", C: "Hanging Gardens", D: "Lighthouse of Alexandria" },
    correctAnswer: "B",
    difficultyLevel: 11,
    category: "History",
    explanation: "The Great Pyramid of Giza is the only ancient wonder still largely intact."
  },
  {
    question: "What is the derivative of x³?",
    options: { A: "x²", B: "3x²", C: "3x", D: "x³" },
    correctAnswer: "B",
    difficultyLevel: 11,
    category: "Mathematics",
    explanation: "Using the power rule: d/dx(x^n) = nx^(n-1), so d/dx(x³) = 3x²"
  },
  // Level 12
  {
    question: "Who wrote 'The Theory of Moral Sentiments'?",
    options: { A: "Karl Marx", B: "Adam Smith", C: "John Keynes", D: "David Ricardo" },
    correctAnswer: "B",
    difficultyLevel: 12,
    category: "General Knowledge",
    explanation: "Adam Smith wrote this in 1759, before his famous 'Wealth of Nations'."
  },
  {
    question: "What is the atomic number of Uranium?",
    options: { A: "90", B: "91", C: "92", D: "93" },
    correctAnswer: "C",
    difficultyLevel: 12,
    category: "Science",
    explanation: "Uranium has atomic number 92, making it the heaviest naturally occurring element."
  },
  // Level 13
  {
    question: "Which mathematical constant is approximately 2.71828?",
    options: { A: "Pi (π)", B: "Euler's number (e)", C: "Golden ratio (φ)", D: "Square root of 2" },
    correctAnswer: "B",
    difficultyLevel: 13,
    category: "Mathematics",
    explanation: "e is Euler's number, the base of natural logarithms."
  },
  {
    question: "In which year did the Berlin Wall fall?",
    options: { A: "1987", B: "1988", C: "1989", D: "1990" },
    correctAnswer: "C",
    difficultyLevel: 13,
    category: "History",
    explanation: "The Berlin Wall fell on November 9, 1989, symbolizing the end of the Cold War."
  },
  // Level 14
  {
    question: "What is the Riemann Hypothesis related to?",
    options: { A: "Geometry", B: "Prime numbers", C: "Calculus", D: "Algebra" },
    correctAnswer: "B",
    difficultyLevel: 14,
    category: "Mathematics",
    explanation: "The Riemann Hypothesis is about the distribution of prime numbers and is one of the Millennium Prize Problems."
  },
  {
    question: "Who developed the polio vaccine?",
    options: { A: "Louis Pasteur", B: "Jonas Salk", C: "Alexander Fleming", D: "Edward Jenner" },
    correctAnswer: "B",
    difficultyLevel: 14,
    category: "Science",
    explanation: "Jonas Salk developed the first effective polio vaccine in 1955."
  },
  // Level 15 (Million Dollar Question)
  {
    question: "What is the only number that is twice the sum of its digits?",
    options: { A: "18", B: "27", C: "36", D: "45" },
    correctAnswer: "A",
    difficultyLevel: 15,
    category: "Mathematics",
    explanation: "18: 1 + 8 = 9, and 9 × 2 = 18. This is the only number with this property."
  },
  {
    question: "Which physicist won the Nobel Prize for the discovery of the neutron?",
    options: { A: "Ernest Rutherford", B: "James Chadwick", C: "Niels Bohr", D: "Werner Heisenberg" },
    correctAnswer: "B",
    difficultyLevel: 15,
    category: "Science",
    explanation: "James Chadwick discovered the neutron in 1932 and won the Nobel Prize in Physics in 1935."
  }
];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const QuizQuestion = require('../backend/models/QuizQuestion');

    console.log('🗑️  Clearing existing questions...');
    await QuizQuestion.deleteMany({});

    console.log('🌱 Inserting sample questions...');
    await QuizQuestion.insertMany(sampleQuestions);

    console.log('✅ Seeding complete!');
    console.log(`📊 Inserted ${sampleQuestions.length} questions`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();

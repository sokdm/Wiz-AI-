'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import {
  TrophyIcon,
  ClockIcon,
  UsersIcon,
  ArrowRightIcon,
  StarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useStore } from '../store/useStore';

const PRIZE_LADDER = [
  0, 100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 
  32000, 64000, 125000, 250000, 500000, 1000000
];

const SAFE_HAVENS = [5, 10];

export default function QuizGame() {
  const [gameState, setGameState] = useState('menu');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lifelines, setLifelines] = useState({
    fiftyFifty: 1,
    skip: 1,
    askAudience: 1
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showingResult, setShowingResult] = useState(false);
  const [removedOptions, setRemovedOptions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const router = useRouter();
  const { isAuthenticated, user } = useStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchLeaderboard();
  }, [isAuthenticated]);

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0 && !showingResult) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, showingResult]);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/quiz/leaderboard?limit=5');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard');
    }
  };

  const startGame = async () => {
    try {
      const response = await api.get('/quiz/start');
      setGameState('playing');
      setCurrentLevel(response.data.currentLevel);
      setScore(response.data.currentScore);
      setLifelines(response.data.lifelines);
      setCurrentQuestion(response.data.question);
      setTimeLeft(30);
      setRemovedOptions([]);
      setSelectedOption(null);
      setShowingResult(false);
    } catch (error) {
      if (error.response?.data?.upgrade) {
        toast.error('Daily quiz limit reached. Upgrade to Premium!');
      } else {
        toast.error('Failed to start game');
      }
    }
  };

  const fetchQuestion = async (level) => {
    try {
      const response = await api.get(`/quiz/question/${level}`);
      setCurrentQuestion(response.data);
      setTimeLeft(30);
      setRemovedOptions([]);
      setSelectedOption(null);
      setShowingResult(false);
    } catch (error) {
      toast.error('Failed to load question');
    }
  };

  const handleAnswer = async (option) => {
    if (showingResult) return;
    
    setSelectedOption(option);
    setShowingResult(true);

    try {
      const response = await api.post('/quiz/answer', {
        questionId: currentQuestion.id,
        answer: option,
        timeTaken: 30 - timeLeft
      });

      if (response.data.correct) {
        if (response.data.gameComplete) {
          toast.success('Congratulations! You won 1,000,000 points!');
          setGameState('finished');
          setScore(1000000);
        } else {
          setTimeout(() => {
            setCurrentLevel(response.data.currentLevel);
            setScore(response.data.currentScore);
            fetchQuestion(response.data.currentLevel);
          }, 1500);
        }
      } else {
        toast.error(`Game Over! Correct answer was ${response.data.correctAnswer}`);
        setGameState('finished');
        setScore(response.data.finalScore);
      }
    } catch (error) {
      toast.error('Failed to submit answer');
    }
  };

  const handleTimeUp = () => {
    toast.error("Time is up!");
    setGameState('finished');
  };

  const useLifeline = async (type) => {
    if (lifelines[type] <= 0) return;

    try {
      const response = await api.post(`/quiz/lifeline/${type}`);
      
      if (type === 'fiftyFifty') {
        setRemovedOptions(response.data.removedOptions);
      } else if (type === 'skip') {
        fetchQuestion(currentLevel + 1);
        setCurrentLevel(prev => prev + 1);
      } else if (type === 'askAudience') {
        toast.success(`Audience suggests: ${response.data.audiencePoll}`, { duration: 5000 });
      }

      setLifelines(prev => ({ ...prev, [type]: prev[type] - 1 }));
    } catch (error) {
      toast.error('Failed to use lifeline');
    }
  };

  const getOptionStyle = (option) => {
    if (!showingResult) {
      if (removedOptions.includes(option)) {
        return 'opacity-25 cursor-not-allowed';
      }
      return 'hover:bg-blue-50 hover:border-blue-300 cursor-pointer';
    }
    
    if (option === selectedOption) {
      return 'bg-yellow-100 border-yellow-500';
    }
    return 'opacity-50';
  };

  if (!isAuthenticated) return null;

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <Head>
          <title>Millionaire Quiz - Wiz AI</title>
        </Head>

        <div className="container mx-auto px-6 py-12">
          <button 
            onClick={() => router.push('/dashboard')}
            className="mb-8 flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Millionaire Quiz
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Test your knowledge and win up to 1,000,000 points! 
                15 questions, 3 lifelines, endless fun.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <StarIcon className="w-6 h-6 text-yellow-400" />
                  <span>15 levels of increasing difficulty</span>
                </div>
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-6 h-6 text-blue-400" />
                  <span>30 seconds per question</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrophyIcon className="w-6 h-6 text-green-400" />
                  <span>Compete on the leaderboard</span>
                </div>
              </div>

              <button
                onClick={startGame}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-12 py-4 rounded-xl font-bold text-xl hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105"
              >
                Start Game
              </button>

              {user?.subscription?.plan === 'free' && (
                <p className="mt-4 text-sm text-gray-400">
                  Free: {user?.dailyUsage?.quizGames || 0}/5 games daily
                </p>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrophyIcon className="w-6 h-6 text-yellow-400" />
                Top Players
              </h3>
              <div className="space-y-4">
                {leaderboard.map((player, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-white/20'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-semibold">{player.username}</span>
                    </div>
                    <span className="text-yellow-400 font-bold">{player.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <Head>
        <title>Question {currentLevel} - Millionaire Quiz</title>
      </Head>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold">Question {currentLevel}/15</span>
            <span className="text-yellow-400 font-bold">{score.toLocaleString()} pts</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            <ClockIcon className={`w-5 h-5 ${timeLeft < 10 ? 'text-red-400 animate-pulse' : ''}`} />
            <span className={`font-mono text-xl ${timeLeft < 10 ? 'text-red-400' : ''}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => useLifeline('fiftyFifty')}
            disabled={lifelines.fiftyFifty <= 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              lifelines.fiftyFifty > 0 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            50:50 ({lifelines.fiftyFifty})
          </button>
          <button
            onClick={() => useLifeline('skip')}
            disabled={lifelines.skip <= 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              lifelines.skip > 0 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            Skip ({lifelines.skip})
          </button>
          <button
            onClick={() => useLifeline('askAudience')}
            disabled={lifelines.askAudience <= 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              lifelines.askAudience > 0 
                ? 'bg-purple-500 hover:bg-purple-600' 
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            <UsersIcon className="w-5 h-5" />
            Ask ({lifelines.askAudience})
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide">
            {currentQuestion?.category}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold leading-relaxed">
            {currentQuestion?.question}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {['A', 'B', 'C', 'D'].map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={showingResult || removedOptions.includes(option)}
              className={`bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-xl p-6 text-left transition-all ${getOptionStyle(option)}`}
            >
              <span className="text-yellow-400 font-bold text-xl mr-4">{option}:</span>
              <span className="text-lg">{currentQuestion?.options?.[option]}</span>
            </button>
          ))}
        </div>

        <div className="mt-12 bg-black/30 rounded-xl p-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {PRIZE_LADDER.map((amount, idx) => (
              <div
                key={idx}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  idx === currentLevel
                    ? 'bg-yellow-500 text-black'
                    : idx < currentLevel
                    ? 'bg-green-500/50'
                    : SAFE_HAVENS.includes(idx)
                    ? 'bg-white/20'
                    : 'bg-white/5'
                }`}
              >
                {idx}: {amount.toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

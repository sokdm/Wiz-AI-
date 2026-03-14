'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { 
  PaperAirplaneIcon, 
  ArrowLeftIcon, 
  SparklesIcon,
  LightBulbIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useStore } from '../store/useStore';

export default function HomeworkSolver() {
  const [question, setQuestion] = useState('');
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const router = useRouter();
  const { isAuthenticated, user } = useStore();

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push('/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please login to access this feature</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const solveQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    setSolution(null);
    
    try {
      const response = await api.post('/ai/solve', { question: question.trim() });
      
      if (response.data && response.data.answer) {
        setSolution(response.data);
        setHistory(prev => [{ question, answer: response.data.answer }, ...prev]);
        setQuestion('');
        
        if (response.data.remaining !== 'unlimited') {
          toast.success(`Solved! ${response.data.remaining} questions remaining today`);
        } else {
          toast.success('Problem solved!');
        }
      } else {
        toast.error('No solution received from AI');
      }
    } catch (error) {
      console.error('Solve error:', error);
      if (error.response?.status === 403 && error.response?.data?.upgrade) {
        toast.error('Daily limit reached. Upgrade to Premium!');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to solve. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Homework Solver - Wiz AI</title>
      </Head>

      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <SparklesIcon className="w-7 h-7 text-blue-600" />
                Homework Solver
              </h1>
              <p className="text-sm text-gray-600">Get step-by-step solutions instantly</p>
            </div>
          </div>
          {user?.subscription?.plan === 'free' && (
            <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              Free: {user?.dailyUsage?.aiQuestions || 0}/10 daily
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <form onSubmit={solveQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your homework question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Example: Solve for x: 3x + 6 = 15&#10;Or: What is the capital of France?&#10;Or: Explain photosynthesis"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Solving with AI...
                </>
              ) : (
                <>
                  <LightBulbIcon className="w-5 h-5" />
                  Solve Problem
                </>
              )}
            </button>
          </form>
        </div>

        {solution && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b">
              <SparklesIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold">Solution</h2>
              {solution.cached && (
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Cached
                </span>
              )}
            </div>
            <div className="prose prose-blue max-w-none">
              <ReactMarkdown>{solution.answer}</ReactMarkdown>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-lg font-bold mb-4">Recent Questions</h3>
            <div className="space-y-4">
              {history.slice(0, 5).map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => { setSolution({ answer: item.answer }); window.scrollTo(0, 0); }}
                  className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-gray-900 line-clamp-2">{item.question}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

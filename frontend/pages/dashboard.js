'use client';

import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '../store/useStore';
import {
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  CameraIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowRightIcon,
  CreditCardIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const features = [
    {
      icon: AcademicCapIcon,
      title: 'Homework Solver',
      desc: 'Get instant step-by-step solutions',
      href: '/homework',
      color: 'bg-blue-500',
      usage: user.dailyUsage?.aiQuestions || 0,
      limit: user.subscription?.plan === 'free' ? 10 : '∞'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Tutor',
      desc: 'Chat with your personal AI tutor',
      href: '/tutor',
      color: 'bg-purple-500',
      usage: user.dailyUsage?.aiQuestions || 0,
      limit: user.subscription?.plan === 'free' ? 10 : '∞'
    },
    {
      icon: CameraIcon,
      title: 'Image Solver',
      desc: 'Upload homework photos',
      href: '/image-solver',
      color: 'bg-green-500',
      usage: user.dailyUsage?.imageSolves || 0,
      limit: user.subscription?.plan === 'free' ? 3 : '∞'
    },
    {
      icon: TrophyIcon,
      title: 'Millionaire Quiz',
      desc: 'Play and learn',
      href: '/quiz',
      color: 'bg-yellow-500',
      usage: user.dailyUsage?.quizGames || 0,
      limit: user.subscription?.plan === 'free' ? 5 : '∞'
    }
  ];

  const isPremium = user.subscription?.plan !== 'free';

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard - Wiz AI</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold">Wiz AI</span>
          </div>
          
          <div className="flex items-center gap-6">
            {!isPremium && (
              <Link href="/payment/subscribe" className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all">
                <StarIcon className="w-5 h-5" />
                Upgrade to Premium
              </Link>
            )}
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Hi, {user.username}</span>
              <button 
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">

        {/* FREE USER: Prominent Upgrade Banner */}
        {!isPremium && (
          <div className="mb-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-1">
            <div className="bg-white rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <StarIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upgrade to Premium</h2>
                  <p className="text-gray-600">Unlock unlimited AI, images, and quizzes!</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">$9.99</p>
                  <p className="text-sm text-gray-500">/month</p>
                </div>
                <Link 
                  href="/payment/subscribe"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <SparklesIcon className="w-5 h-5" />
                  Upgrade Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* PREMIUM USER: Status Badge */}
        {isPremium && (
          <div className="mb-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Premium Active</h2>
                <p className="text-green-100">You have unlimited access to all features</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-100">Current Plan</p>
              <p className="text-2xl font-bold capitalize">{user.subscription?.plan}</p>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.username}! 👋
          </h1>
          <p className="text-gray-600">What would you like to learn today?</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{user.stats?.studyStreak || 0}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{user.stats?.totalAiQuestions || 0}</div>
            <div className="text-sm text-gray-600">Questions Solved</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-green-600">{user.stats?.totalQuizzes || 0}</div>
            <div className="text-sm text-gray-600">Quizzes Played</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-yellow-600 capitalize">{user.subscription?.plan || 'Free'}</div>
            <div className="text-sm text-gray-600">Current Plan</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, idx) => (
            <Link 
              key={idx} 
              href={feature.href}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                {!isPremium && (
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {feature.usage}/{feature.limit}
                  </div>
                )}
                {isPremium && (
                  <div className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full font-semibold">
                    Unlimited
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">{feature.desc}</p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                Get Started <ArrowRightIcon className="w-5 h-5 ml-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* FREE USER: Features Comparison */}
        {!isPremium && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Why Upgrade to Premium?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">Free</span>
                  Current Plan
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-2">• 10 AI questions/day</li>
                  <li className="flex items-center gap-2">• 3 image solves/day</li>
                  <li className="flex items-center gap-2">• 5 quiz games/day</li>
                  <li className="flex items-center gap-2">• Basic support</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-sm text-white">Pro</span>
                  Premium Plan
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-green-600">
                    <CheckCircleIcon className="w-5 h-5" />
                    Unlimited AI questions
                  </li>
                  <li className="flex items-center gap-2 text-green-600">
                    <CheckCircleIcon className="w-5 h-5" />
                    Unlimited image solves
                  </li>
                  <li className="flex items-center gap-2 text-green-600">
                    <CheckCircleIcon className="w-5 h-5" />
                    Unlimited quiz games
                  </li>
                  <li className="flex items-center gap-2 text-green-600">
                    <CheckCircleIcon className="w-5 h-5" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2 text-green-600">
                    <CheckCircleIcon className="w-5 h-5" />
                    Advanced analytics
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link 
                href="/payment/subscribe"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
              >
                <CreditCardIcon className="w-5 h-5" />
                Upgrade Now - $9.99/month
              </Link>
            </div>
          </div>
        )}

        {/* Quick Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to challenge yourself?</h3>
              <p className="text-blue-100">Try the Millionaire Quiz and test your knowledge!</p>
            </div>
            <Link 
              href="/quiz"
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              Start Quiz
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../store/useStore';
import { 
  AcademicCapIcon, 
  ChatBubbleLeftRightIcon, 
  CameraIcon, 
  TrophyIcon,
  SparklesIcon,
  CheckCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const { isAuthenticated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const features = [
    {
      icon: AcademicCapIcon,
      title: 'AI Homework Solver',
      desc: 'Get step-by-step solutions to any homework problem instantly'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Tutor Chat',
      desc: '24/7 personal AI tutor for all your learning needs'
    },
    {
      icon: CameraIcon,
      title: 'Image Solver',
      desc: 'Snap a photo of your homework and get instant answers'
    },
    {
      icon: TrophyIcon,
      title: 'Millionaire Quiz',
      desc: 'Learn while playing with our gamified quiz system'
    }
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['10 AI questions/day', '3 image solves/day', '5 quiz games/day', 'Basic support'],
      cta: 'Get Started',
      popular: false,
      href: '/register'
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: '/month',
      features: ['Unlimited AI questions', 'Unlimited image solves', 'Unlimited quiz games', 'Priority support', 'Advanced analytics'],
      cta: 'Upgrade Now',
      popular: true,
      href: '/payment/subscribe'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>Wiz AI - Your Personal AI Study Assistant</title>
        <meta name="description" content="AI-powered learning platform for students" />
      </Head>

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">Wiz AI</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/payment/subscribe" className="hidden md:flex items-center gap-2 px-4 py-2 text-yellow-600 font-semibold hover:text-yellow-700">
            <CreditCardIcon className="w-5 h-5" />
            Pricing
          </Link>
          <Link href="/login" className="px-6 py-2 text-blue-600 font-semibold hover:text-blue-700">
            Login
          </Link>
          <Link href="/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Study Smarter with <span className="text-blue-600">AI Power</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Your personal AI tutor available 24/7. Solve homework, chat with AI, 
          upload images, and play educational games.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/register" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors">
            Start Learning Free
          </Link>
          <Link href="/payment/subscribe" className="px-8 py-4 bg-yellow-500 text-white rounded-xl font-bold text-lg hover:bg-yellow-600 transition-colors flex items-center gap-2">
            <SparklesIcon className="w-5 h-5" />
            Upgrade to Premium
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">Everything You Need to Excel</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow hover:-translate-y-1 transform">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-2xl flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-6 py-20 bg-white rounded-3xl my-20">
        <h2 className="text-3xl font-bold text-center mb-4">Choose Your Plan</h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Start free and upgrade anytime to unlock unlimited learning
        </p>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={idx} className={`relative bg-white rounded-2xl p-8 shadow-lg ${plan.popular ? 'ring-2 ring-blue-600' : 'border border-gray-200'}`}>
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link 
                href={plan.href}
                className={`block text-center py-3 rounded-lg font-semibold transition-colors ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <SparklesIcon className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold">Wiz AI</span>
          </div>
          <p className="text-gray-400">2026 Wiz AI. Created by Wisdom.</p>
          <p className="text-gray-500 text-sm mt-2">Contact: wsdmpresh@gmail.com</p>
          <div className="flex justify-center gap-6 mt-6">
            <Link href="/payment/subscribe" className="text-blue-400 hover:text-blue-300">Pricing</Link>
            <Link href="/login" className="text-blue-400 hover:text-blue-300">Login</Link>
            <Link href="/register" className="text-blue-400 hover:text-blue-300">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

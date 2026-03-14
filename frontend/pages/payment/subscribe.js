'use client';

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  SparklesIcon, 
  ArrowLeftIcon, 
  ShieldCheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useStore } from '../../store/useStore';

const plans = [
  {
    id: 'weekly',
    name: 'Weekly',
    price: 2.99,
    period: 'week',
    features: ['Unlimited AI questions', 'Unlimited image solves', 'Unlimited quiz games', 'Priority support']
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    period: 'month',
    popular: true,
    features: ['Everything in Weekly', 'Advanced analytics', 'Study streak rewards', 'Cancel anytime']
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 24.99,
    period: '3 months',
    save: '17%',
    features: ['Everything in Monthly', 'Export study data', 'Personalized learning path']
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 79.99,
    period: 'year',
    save: '33%',
    features: ['Everything in Quarterly', 'Exclusive content', 'Early access to features', 'Best value']
  }
];

export default function Subscribe() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user } = useStore();

  // Client-side only check
  if (typeof window !== 'undefined' && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please login to subscribe</p>
        </div>
      </div>
    );
  }

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await api.post('/payment/initialize', { plan: selectedPlan });
      
      // Redirect to Flutterwave checkout
      window.location.href = response.data.paymentLink;
    } catch (error) {
      toast.error('Failed to initialize payment: ' + (error.response?.data?.error || error.message));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Upgrade to Premium - Wiz AI</title>
      </Head>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <button 
          onClick={() => router.push('/dashboard')}
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <StarIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Upgrade to Premium</h1>
          <p className="text-xl text-gray-600">Unlock unlimited learning potential</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative bg-white rounded-2xl p-6 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'ring-2 ring-blue-600 shadow-xl scale-105'
                  : 'hover:shadow-lg border border-gray-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Popular
                </span>
              )}
              {plan.save && (
                <span className="absolute -top-3 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Save {plan.save}
                </span>
              )}
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-500">/{plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className={`w-full py-3 rounded-lg font-semibold text-center transition-all ${
                selectedPlan === plan.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {selectedPlan === plan.id ? 'Selected' : 'Select'}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-500">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Secure payment powered by Flutterwave</span>
          </div>
          
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                Upgrade Now - ${plans.find(p => p.id === selectedPlan)?.price}
              </>
            )}
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            You will be redirected to Flutterwave to complete payment
          </p>
        </div>
      </div>
    </div>
  );
}

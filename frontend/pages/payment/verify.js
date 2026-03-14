import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

export default function VerifyPayment() {
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const router = useRouter();
  const { transaction_id } = router.query;

  useEffect(() => {
    if (transaction_id) {
      verifyPayment();
    }
  }, [transaction_id]);

  const verifyPayment = async () => {
    try {
      const response = await api.get(`/payment/verify/${transaction_id}`);
      if (response.data.success) {
        setStatus('success');
        toast.success('Payment successful! Welcome to Premium!');
        setTimeout(() => router.push('/dashboard'), 3000);
      } else {
        setStatus('failed');
        toast.error('Payment verification failed');
      }
    } catch (error) {
      setStatus('failed');
      toast.error('Failed to verify payment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md w-full mx-6">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your transaction</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your Premium subscription is now active</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="btn-primary w-full"
            >
              Go to Dashboard
            </button>
          </>
        )}
        
        {status === 'failed' && (
          <>
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Failed</h2>
            <p className="text-gray-600 mb-6">We couldn't verify your payment. Please try again.</p>
            <button 
              onClick={() => router.push('/payment/subscribe')}
              className="btn-primary w-full"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import BackButton from '../components/BackButton';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Home, Book } from 'lucide-react';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

interface SubscriptionResultProps {
  devMode?: boolean;
  devStatus?: 'loading' | 'success' | 'failed';
}

const SubscriptionResult: React.FC<SubscriptionResultProps> = ({ devMode = false, devStatus }) => {
  const router = useRouter();
  const { user, fetchUserSubscription } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>(devMode ? devStatus || 'loading' : 'loading');
  const [message, setMessage] = useState('');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (devMode) {
      setStatus(devStatus || 'loading');
      setMessage(
        devStatus === 'success'
          ? 'Thank you for subscribing! Your premium features are now active.'
          : devStatus === 'failed'
          ? 'There was an issue with your subscription. Please try again.'
          : 'Loading...'
      );
      return;
    }

    const checkSubscriptionStatus = async () => {
      const sessionId = router.query.session_id as string;
      if (!sessionId) {
        setStatus('failed');
        setMessage('Invalid session. Please try subscribing again.');
        return;
      }

      try {
        const response = await fetch('/api/check-subscription-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (data.status === 'success') {
          setStatus('success');
          setMessage('Thank you for subscribing! Your premium features are now active.');
          if (user) {
            await fetchUserSubscription(user.id);
          }
        } else {
          setStatus('failed');
          setMessage(data.message || 'There was an issue with your subscription. Please try again.');
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setStatus('failed');
        setMessage('An unexpected error occurred. Please contact support.');
      }
    };

    if (router.isReady) {
      checkSubscriptionStatus();
    }
  }, [router.isReady, router.query.session_id, user, fetchUserSubscription, devMode, devStatus]);

  if (status === 'loading') {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-[calc(100vh-20rem)] bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center p-4">
      {status === 'success' && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.1}
        />
      )}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <BackButton className="mb-6 text-purple-600 hover:text-purple-800 transition-colors" />
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {status === 'success' ? (
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              ) : (
                <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              )}
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
                {status === 'success' ? 'Subscription Confirmed' : 'Subscription Status'}
              </h1>
              <p className="text-xl text-center text-gray-600 mb-8">{message}</p>
              {status === 'success' && (
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link href="/my-wishes">
                    <span className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
                      <Book className="mr-2" size={20} />
                      Go to My Wishes
                    </span>
                  </Link>
                  <Link href="/">
                    <span className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
                      <Home className="mr-2" size={20} />
                      Return to Home
                    </span>
                  </Link>
                </div>
              )}
              {status === 'failed' && (
                <button
                  onClick={() => router.push('/subscription')}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                >
                  Try Again
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionResult;

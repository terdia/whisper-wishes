import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import WelcomeScreen from '../components/WelcomeScreen';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Welcome() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }                           
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return user ? <WelcomeScreen /> : null;
}
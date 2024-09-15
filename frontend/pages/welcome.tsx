import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import WelcomeScreen from '../components/WelcomeScreen';
import LoadingSpinner from '../components/LoadingSpinner';
import { GetServerSideProps } from 'next';

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

  return (
    <>
      {user ? <WelcomeScreen /> : null}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      title:"Welcome to Dandy Wishes | Get Started",
        description:"Welcome to Dandy Wishes! Start your journey of making wishes, sharing aspirations, and connecting with a community of dreamers.",
        canonical: `https://www.dandywishes.app/welcome`
    },
  };
};
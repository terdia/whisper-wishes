// components/WelcomeScreen.tsx

import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const { user, updateUserStats } = useAuth();

  const handleContinue = async () => {
    if (user) {
      // Update user_onboarding to mark welcome screen as viewed
      const { error } = await supabase
        .from('user_onboarding')
        .update({ welcome_screen_viewed: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating onboarding status:', error);
      }

      // Update XP for account creation
      await updateUserStats({
        xp: 20,
        level: 1
      });

      router.push('/my-wishes');
    }
  };

  const handleUpgrade = () => {
    router.push('/subscription');
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-800">Welcome to Dandy Wishes!</h1>
      <p className="mb-4 text-gray-700">You're all set up with our Free Tier. Ready to make some wishes?</p>
      <button 
        onClick={handleContinue}
        className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg mb-4"
      >
        Start Wishing
      </button>
      <div className="border-t pt-4 mt-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Want more wish power?</h2>
        <p className="mb-4 text-gray-700">Upgrade to Premium for unlimited amplifications and more!</p>
        <button 
          onClick={handleUpgrade}
          className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import WishCreator from '../components/WishCreator'
import SEO from '../components/SEO'
import OnboardingFlow from '../components/OnboardingFlow'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Home: NextPage = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [showCondensedTutorial, setShowCondensedTutorial] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onboardingStatus = localStorage.getItem('onboardingComplete');
    if (onboardingStatus !== 'true') {
      setIsOnboardingComplete(false);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
    localStorage.setItem('onboardingComplete', 'true');
  };

  return (
    <div className="min-h-[calc(100vh-20rem)] bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <SEO 
        title="Make Your Wishes Come True"
        description="Plant your wishes in our digital dandelion field and let your dreams take flight. Share your aspirations, support others, and watch as the community grows together."
      />

      {!isOnboardingComplete && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}

      {showCondensedTutorial && (
        <OnboardingFlow onComplete={() => setShowCondensedTutorial(false)} isCondensed={true} />
      )}

      {(isOnboardingComplete || showCondensedTutorial) && (
        <>
          <header className="text-center py-8 px-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Whisper. Wish. Wonder.</h1>
            <p className="text-lg sm:text-xl text-white max-w-2xl mx-auto">
              Plant your wishes in our digital dandelion field and let your dreams take flight. 
              Share your aspirations, support others, and watch as the community grows together.
            </p>
          </header>

          <main className="container mx-auto px-4 pb-12">
            <WishCreator />
          </main>

          <button
            onClick={() => setShowCondensedTutorial(true)}
            className="fixed bottom-4 right-4 bg-white text-purple-600 p-2 rounded-full shadow-lg hover:bg-purple-100 transition-colors duration-300"
            title="Replay Tutorial"
          >
            <RefreshCw size={24} />
          </button>
        </>
      )}

      <footer className="bg-purple-800 text-white py-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Dandy Wishes. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default Home
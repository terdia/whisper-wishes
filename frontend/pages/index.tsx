import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import WishCreator from '../components/WishCreator'
import SEO from '../components/SEO'
import OnboardingFlow from '../components/OnboardingFlow'
import { RefreshCw } from 'lucide-react'
import Link from 'next/link'
import CookieConsent from '../components/CookieConsent'
import { useRouter } from 'next/router';

const Home: NextPage = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [showCondensedTutorial, setShowCondensedTutorial] = useState(false);
  const [showTutorialChoice, setShowTutorialChoice] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const onboardingStatus = localStorage.getItem('onboardingComplete');
    if (onboardingStatus !== 'true') {
      setIsOnboardingComplete(false);
    }
  }, []);

  const handleReplayTutorial = () => {
    setShowTutorialChoice(true);
  };

  const startTutorial = (isCondensed: boolean) => {
    setShowCondensedTutorial(isCondensed);
    setIsOnboardingComplete(false);
    setShowTutorialChoice(false);
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
    setShowCondensedTutorial(false);
    localStorage.setItem('onboardingComplete', 'true');
  };

  return (
    <div className="min-h-[calc(100vh-20rem)] bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <SEO 
        title="Make Your Wishes Come True"
        description="Plant your wishes in our digital dandelion field and let your dreams take flight. Share aspirations, support others, and watch as the Dandy Wishes community grows together."
        canonical={`https://dandywishes.app${router.asPath}`}
      />

      {!isOnboardingComplete && (
        <OnboardingFlow 
          onComplete={handleOnboardingComplete} 
          isCondensed={showCondensedTutorial}
        />
      )}

      {isOnboardingComplete && (
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
            onClick={handleReplayTutorial}
            className="fixed bottom-4 right-4 bg-white text-purple-600 p-2 rounded-full shadow-lg hover:bg-purple-100 transition-colors duration-300"
            title="Replay Tutorial"
          >
            <RefreshCw size={24} />
          </button>
        </>
      )}

      {showTutorialChoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Choose Tutorial Type</h3>
            <p className="mb-4 text-gray-600">Would you like to go through the full tutorial or a condensed version?</p>
            <div className="flex justify-between">
              <button
                onClick={() => startTutorial(false)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-300"
              >
                Full Tutorial
              </button>
              <button
                onClick={() => startTutorial(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Condensed Version
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-purple-800 text-white py-8 text-center">
        <div className="container mx-auto px-4">
          <p className="text-sm mb-4">
            &copy; {new Date().getFullYear()} Dandy Wishes. All rights reserved.
          </p>
          <nav className="flex justify-center space-x-4 text-sm">
            <Link href="/privacy-policy">
              <a className="hover:underline">Privacy Policy</a>
            </Link>
            <Link href="/terms-of-service">
              <a className="hover:underline">Terms of Service</a>
            </Link>
          </nav>
        </div>
      </footer>

      <CookieConsent />
    </div>
  )
}

export default Home
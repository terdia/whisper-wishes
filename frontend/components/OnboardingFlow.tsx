import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Globe, Lock, PlusCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';

interface OnboardingFlowProps {
  onComplete: () => void;
  isCondensed?: boolean;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, isCondensed = false }) => {
  const [step, setStep] = useState(0);
  const [wishText, setWishText] = useState('');
  const [category, setCategory] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const { user } = useAuth();

  const steps = isCondensed
    ? ['createWish', 'selectCategory', 'toggleVisibility', 'visualizeWish', 'nextSteps']
    : ['welcome', 'createWish', 'selectCategory', 'toggleVisibility', 'visualizeWish', 'interactionTutorial', 'gardenView', 'supportTutorial', 'achievement', 'nextSteps'];

  const handleCreateWish = async () => {
    const newWish = {
      text: wishText,
      category: category,
      is_private: isPrivate,
      created_at: new Date().toISOString(),
      id: Date.now().toString(), // Use timestamp as ID for local wishes
      x: Math.random() * 60 + 20, // Random x position
      y: Math.random() * 40 + 30, // Random y position
      is_visible: true // Default to true
    };

    if (user) {
      try {
        const { data, error } = await supabase
          .from('wishes')
          .insert({
            wish_text: wishText,
            user_id: user.id,
            category,
            is_private: isPrivate,
            is_visible: true
          })
          .select()
          .single();

        if (error) throw error;

        console.log('Wish created:', data);
      } catch (error) {
        console.error('Error creating wish:', error);
      }
    } else {
      // Store wish in local storage for non-authenticated users
      const localWishes = JSON.parse(localStorage.getItem('localWishes') || '[]');
      localWishes.push(newWish);
      localStorage.setItem('localWishes', JSON.stringify(localWishes));
    }
  };

  const handleNextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const renderStep = () => {
    switch (steps[step]) {
      case 'welcome':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-md mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4 text-purple-800">Welcome to Dandy Wishes</h2>
            <p className="mb-4 text-gray-700">
              Imagine a world where your dreams take flight, carried on the gentle breeze of hope and possibility.
            </p>
            <p className="mb-4 text-gray-700">
              Dandy Wishes is your digital dandelion field, a magical space where aspirations bloom and community flourishes.
            </p>
            <p className="mb-6 text-gray-700">
              Here, you can:
            </p>
            <ul className="text-left mb-6 space-y-2 text-gray-700">
              <li>🌱 Plant your wishes and watch them grow</li>
              <li>🌬️ Blow your wishes into the world</li>
              <li>🌻 Nurture others' dreams in our Global Garden</li>
              <li>🏆 Earn achievements as you make wishes come true</li>
            </ul>
            <p className="mb-6 text-gray-700 italic">
              "Every great dream begins with a dreamer. Always remember, you have within you the strength, the patience, and the passion to reach for the stars to change the world." - Harriet Tubman
            </p>
            <button
              onClick={handleNextStep}
              className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition duration-300 shadow-lg transform hover:scale-105"
            >
              Begin Your Wishing Journey
            </button>
          </motion.div>
        );

      case 'createWish':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md mx-auto"
          >
            <textarea
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              placeholder="Whisper your wish..."
              className="w-full p-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition duration-300"
              rows={3}
            />
            <button
              onClick={handleNextStep}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300"
              disabled={!wishText.trim()}
            >
              Next
            </button>
          </motion.div>
        );

      case 'selectCategory':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md mx-auto"
          >
            <h3 className="text-xl font-semibold mb-4">Choose a category for your wish</h3>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition duration-300"
            >
              <option value="">Select a category</option>
              <option value="personal">Personal Growth</option>
              <option value="career">Career & Education</option>
              <option value="health">Health & Wellness</option>
              <option value="relationships">Relationships & Family</option>
              <option value="financial">Financial Goals</option>
              <option value="travel">Travel & Adventure</option>
              <option value="creativity">Creativity & Hobbies</option>
              <option value="spiritual">Spiritual & Mindfulness</option>
              <option value="community">Community & Social Impact</option>
              <option value="environmental">Environmental & Sustainability</option>
              <option value="learning">Learning & Skills</option>
              <option value="lifestyle">Lifestyle & Home</option>
              <option value="other">Other</option>
            </select>
            <button
              onClick={handleNextStep}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300"
              disabled={!category}
            >
              Next
            </button>
          </motion.div>
        );

      case 'toggleVisibility':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md mx-auto"
          >
            <h3 className="text-xl font-semibold mb-4">Choose wish visibility</h3>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setIsPrivate(false)}
                className={`flex items-center space-x-2 p-3 rounded-lg ${
                  !isPrivate ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Globe size={24} />
                <span>Public</span>
              </button>
              <button
                onClick={() => setIsPrivate(true)}
                className={`flex items-center space-x-2 p-3 rounded-lg ${
                  isPrivate ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Lock size={24} />
                <span>Private</span>
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              {isPrivate
                ? "Private wishes are for your eyes only."
                : "Public wishes join the Global Garden for others to see and support."}
            </p>
            <button
              onClick={handleNextStep}
              className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300"
            >
              Next
            </button>
          </motion.div>
        );

      case 'visualizeWish':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <h3 className="text-xl font-semibold mb-4">Your wish is blooming!</h3>
            <motion.div
              className="w-32 h-32 bg-purple-400 rounded-full mx-auto mb-6 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 360, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <span className="text-4xl">🌼</span>
            </motion.div>
            <p className="mb-6">{wishText}</p>
            <button
              onClick={handleNextStep}
              className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300"
            >
              Continue
            </button>
          </motion.div>
        );

      case 'interactionTutorial':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h3 className="text-xl font-semibold mb-4">Interact with your wish</h3>
            <p className="mb-6">Try dragging your wish around!</p>
            <motion.div
              drag
              dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
              className="w-24 h-24 bg-purple-400 rounded-full mx-auto mb-6 flex items-center justify-center cursor-move"
            >
              <span className="text-3xl">🌼</span>
            </motion.div>
            <button
              onClick={handleNextStep}
              className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300"
            >
              Next
            </button>
          </motion.div>
        );

      case 'gardenView':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h3 className="text-xl font-semibold mb-4">Your Wish Garden</h3>
            <div className="relative w-64 h-64 bg-green-100 rounded-lg mx-auto mb-6">
              <motion.div
                className="absolute w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center"
                animate={{
                  x: [0, 20, 0],
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <span className="text-2xl">🌼</span>
              </motion.div>
              {!isPrivate && (
                <>
                  <motion.div
                    className="absolute w-12 h-12 bg-blue-300 rounded-full flex items-center justify-center"
                    style={{ top: '60%', left: '20%' }}
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <span className="text-xl">🌸</span>
                  </motion.div>
                  <motion.div
                    className="absolute w-12 h-12 bg-pink-300 rounded-full flex items-center justify-center"
                    style={{ top: '30%', right: '20%' }}
                    animate={{
                      x: [0, 10, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <span className="text-xl">🌺</span>
                  </motion.div>
                </>
              )}
            </div>
            <p className="mb-6">
              {isPrivate
                ? "Your wish is safe in your private garden."
                : "Your wish is now part of the Global Garden!"}
            </p>
            <button
              onClick={handleNextStep}
              className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300"
            >
              Continue
            </button>
          </motion.div>
        );

      case 'supportTutorial':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h3 className="text-xl font-semibold mb-4">Supporting Wishes</h3>
            <p className="mb-6">Tap the 'Support' button to water and nurture wishes!</p>
            <motion.button
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wind className="inline-block mr-2" size={20} />
              Support
            </motion.button>
            <motion.div
              className="w-24 h-24 bg-purple-400 rounded-full mx-auto mt-6 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <span className="text-3xl">🌼</span>
            </motion.div>
            <button
              onClick={handleNextStep}
              className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300"
            >
              Next
            </button>
          </motion.div>
        );

      case 'achievement':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold mb-4">Achievement Unlocked!</h3>
            <motion.div
              className="w-32 h-32 bg-yellow-400 rounded-full mx-auto mb-6 flex items-center justify-center"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
              <span className="text-4xl">🏆</span>
            </motion.div>
            <p className="text-xl mb-2">First Wish Creator</p>
            <p className="mb-6">You've earned 50 XP!</p>
            <button
              onClick={handleNextStep}
              className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300"
            >
              Continue
            </button>
          </motion.div>
        );

      case 'nextSteps':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h3 className="text-xl font-semibold mb-4">You're All Set!</h3>
            <p className="mb-6">Here's what you can do next:</p>
            <ul className="text-left mb-6 space-y-2">
              <li>
                <span className="font-semibold">Create More Wishes:</span> Use the "Open Controls" button to make new wishes.
              </li>
              <li>
                <span className="font-semibold">Explore the Garden:</span> Visit "My Wishes" or the "Global Garden" to see more.
              </li>
              <li>
                <span className="font-semibold">Daily Inspiration:</span> Check out the daily prompt for new ideas.
              </li>
              <li>
                <span className="font-semibold">Track Your Progress:</span> Watch your XP grow as you interact with wishes.
              </li>
            </ul>
            <button
              onClick={onComplete}
              className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300"
            >
              Start My Journey
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    if (step === steps.indexOf('visualizeWish')) {
      handleCreateWish();
    }
  }, [step]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
        {!isCondensed && (
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              className="text-purple-600 hover:text-purple-800 transition-colors"
              disabled={step === 0}
            >
              Previous
            </button>
            <div className="text-gray-500">
              Step {step + 1} of {steps.length}
            </div>
            <button
              onClick={() => onComplete()}
              className="text-purple-600 hover:text-purple-800 transition-colors"
            >
              Skip Tutorial
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
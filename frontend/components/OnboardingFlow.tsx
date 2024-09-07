import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Globe, Lock, Plus, Compass, Sun, TrendingUp, UserPlus } from 'lucide-react';
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
  const [isWishDetailsVisible, setIsWishDetailsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const { user } = useAuth();

  const steps = isCondensed
    ? ['createWish', 'selectCategory', 'toggleVisibility', 'visualizeWish', 'nextSteps']
    : ['welcome', 'createWish', 'selectCategory', 'toggleVisibility', 'visualizeWish', 'interactionTutorial', 'gardenView', 'supportTutorial', 'achievement', 'nextSteps'];


    const nextSteps = [
      { icon: Plus, title: "Create More Wishes", description: "Use the 'Open Controls' button to make new wishes." },
      { icon: Compass, title: "Explore the Garden", description: "Visit 'My Wishes' or the 'Global Garden' to see more." },
      { icon: Sun, title: "Daily Inspiration", description: "Check out the daily prompt for new ideas." },
      { icon: TrendingUp, title: "Track Your Progress", description: "Watch your XP grow as you interact with wishes." },
      { icon: UserPlus, title: "Create an Account", description: "Sign up to sync wishes to the cloud and access all features." },
    ];

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
            className="text-center max-w-md mx-auto px-4 sm:px-0"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-purple-800">Welcome to Dandy Wishes</h2>
            <p className="mb-4 text-sm sm:text-base text-gray-700">
              Imagine a world where your dreams take flight, carried on the gentle breeze of hope and possibility.
            </p>
            <p className="mb-4 text-sm sm:text-base text-gray-700">
              Dandy Wishes is your digital dandelion field, a magical space where aspirations bloom and community flourishes.
            </p>
            <p className="mb-6 text-sm sm:text-base text-gray-700">
              Here, you can:
            </p>
            <ul className="text-left mb-6 space-y-2 text-sm sm:text-base text-gray-700">
              <li>🌱 Plant your wishes and watch them grow</li>
              <li>🌬️ Blow your wishes into the world</li>
              <li>🌻 Nurture others' dreams in our Global Garden</li>
              <li>🏆 Earn achievements as you make wishes come true</li>
            </ul>
            <p className="mb-6 text-sm sm:text-base text-gray-700 italic">
              "Every great dream begins with a dreamer. Always remember, you have within you the strength, the patience, and the passion to reach for the stars to change the world." - Harriet Tubman
            </p>
            <button
              onClick={handleNextStep}
              className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-full hover:bg-purple-700 transition duration-300 shadow-lg transform hover:scale-105"
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
              className="w-full max-w-md mx-auto px-4 sm:px-0"
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
                className="mt-4 bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300 w-full sm:w-auto"
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
              className="w-full max-w-md mx-auto px-4 sm:px-0"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Choose a category for your wish</h3>
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
                className="mt-4 bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300 w-full sm:w-auto"
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
              className="w-full max-w-md mx-auto px-4 sm:px-0"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Choose wish visibility</h3>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setIsPrivate(false)}
                  className={`flex items-center space-x-2 p-3 rounded-lg w-full sm:w-auto ${
                    !isPrivate ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <Globe size={24} />
                  <span>Public</span>
                </button>
                <button
                  onClick={() => setIsPrivate(true)}
                  className={`flex items-center space-x-2 p-3 rounded-lg w-full sm:w-auto ${
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
                className="mt-6 bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300 w-full sm:w-auto"
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
              <p className="mb-6">Try dragging your wish around or tap it to see details!</p>
              <div className="relative w-64 h-64 mx-auto mb-6 border-2 border-dashed border-purple-300 rounded-lg">
                <motion.div
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  className="absolute w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center cursor-move"
                  style={{ left: '50%', top: '50%', marginLeft: '-32px', marginTop: '-32px' }}
                  onClick={() => setIsWishDetailsVisible(!isWishDetailsVisible)}
                >
                  <span className="text-2xl">🌼</span>
                </motion.div>
                <AnimatePresence>
                  {isWishDetailsVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute w-48 bg-white rounded-lg p-2 shadow-xl z-10"
                      style={{
                        left: '50%',
                        bottom: '120%',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <p className="text-gray-800 text-sm font-medium mb-2">{wishText}</p>
                      <div className="text-xs text-gray-500 mt-1">Category: {category}</div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-purple-600">✨ +5 XP</span>
                        <button 
                          className="bg-purple-500 text-white text-xs px-2 py-1 rounded hover:bg-purple-600 transition-colors duration-200"
                        >
                          Support
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                You can interact with wishes just like this in your wish garden!
              </p>
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
              className="text-center px-4 sm:px-0 max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-800">Your Wishing Journey Begins!</h3>
              <p className="text-lg mb-8 text-gray-600">Here's what you can do next:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {nextSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-md transition-all duration-300 cursor-pointer"
                    whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                    onHoverStart={() => setHoveredItem(index)}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    <div className="flex items-center mb-3">
                      <div className="bg-purple-100 p-2 rounded-full mr-3">
                        <step.icon size={24} className="text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-800">{step.title}</h4>
                    </div>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </motion.div>
                ))}
              </div>
              <motion.button
                onClick={onComplete}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition duration-300 mb-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start My Wishing Adventure
              </motion.button>
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
    <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center z-50 p-4 sm:p-0">
      <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl max-w-md w-full">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
        {!isCondensed && (
          <div className="mt-4 flex justify-between items-center text-sm sm:text-base">
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
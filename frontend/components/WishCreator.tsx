import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Wind, Flower, User, Lock, Globe, ChevronDown, PlusCircle, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Confetti from 'react-confetti';
import { syncLocalWishes } from '../utils/wishSync';

interface Wish {
  id: string;
  text: string;
  x: number;
  y: number;
  is_visible: boolean;
  category: string;
}

interface DraggableWishProps {
  wish: Wish;
  containerRef: React.RefObject<HTMLDivElement>;
}

const WishCreator: React.FC = () => {
  const [wishText, setWishText] = useState('');
  const [category, setCategory] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(false);

  useEffect(() => {
    if (user) {
      syncLocalWishes(user.id).then(() => {
        fetchWishes();
      });
    } else {
      const localWishes = JSON.parse(localStorage.getItem('localWishes') || '[]');
      setWishes(localWishes);
    }
  }, [user]);

  const fetchWishes = async () => {
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_visible', true);

    if (error) {
      console.error('Error fetching wishes:', error);
    } else if (data) {
      setWishes(data.map(wish => ({
        ...wish,
        text: wish.wish_text, 
        x: Math.random() * 60 + 20, // Keep within 20-80% of container width
        y: Math.random() * 40 + 30, // Keep within 30-70% of container height
      })));
    }
  };

  const createWish = async () => {
    if (!wishText.trim() || !category) return;
    
    const newWish = {
      text: wishText,
      category: category,
      is_private: isPrivate,
      created_at: new Date().toISOString(),
      id: '', // Initialize with an empty string
      x: Math.random() * 60 + 20, // Random x position
      y: Math.random() * 40 + 30, // Random y position
      is_visible: true // Default to true
    };

    if (user) {
      // Create wish in database for authenticated users
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

      if (error) {
        console.error('Error creating wish:', error);
        return;
      }

      newWish.id = data.id;
    } else {
      // Store wish in local storage for non-authenticated users
      const localWishes = JSON.parse(localStorage.getItem('localWishes') || '[]');
      newWish.id = Date.now().toString(); // Use timestamp as ID for local wishes
      localWishes.push(newWish);
      localStorage.setItem('localWishes', JSON.stringify(localWishes));
    }

    setWishes([...wishes, newWish]);
    setWishText('');
    setCategory('');
    setIsPrivate(false);

    setXp(prevXp => {
      const newXp = prevXp + 5;
      if (newXp >= level * 10) {
        setLevel(prevLevel => prevLevel + 1);
      }
      return newXp;
    });
  };

  const blowWishes = async () => {
    const blownWishes = wishes.map(wish => ({ ...wish, y: -20, is_visible: false }));
    setWishes(blownWishes);
    
    setShowConfetti(true);

    if (user) {
      // Update is_visible status in the database for authenticated users
      const wishIds = blownWishes.map(wish => wish.id);
      const { error } = await supabase
        .from('wishes')
        .update({ is_visible: false })
        .in('id', wishIds);

      if (error) {
        console.error('Error updating wishes visibility:', error);
      }
    } else {
      // Update local storage for non-authenticated users
      const localWishes = JSON.parse(localStorage.getItem('localWishes') || '[]');
      const updatedLocalWishes = localWishes.map(wish => {
        const blownWish = blownWishes.find(bw => bw.id === wish.id);
        return blownWish || { ...wish, is_visible: false };
      });
      localStorage.setItem('localWishes', JSON.stringify(updatedLocalWishes));
    }

    setTimeout(() => {
      setWishes([]);
      setShowConfetti(false);
    }, 5000);
  };

  return (
    <div className="min-h-[calc(100vh-26rem)] bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4 font-sans relative overflow-hidden">
      {showConfetti && <Confetti />}
     
      {/* Subtle floating dandelion seeds */}
      {[...Array(15)].map((_, i) => {
        const isYellow = Math.random() > 0.5;
        const colorClass = isYellow ? "text-yellow-200" : "text-gray-300";
        
        return (
          <motion.div
            key={i}
            className={`absolute ${colorClass} text-opacity-30 pointer-events-none`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 16 + 12}px`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 30 - 15, 0],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            ❁
          </motion.div>
        );
      })}

      <header className="mb-6">
        <div className="flex justify-center items-center space-x-4">
          <div className="bg-white bg-opacity-30 px-4 py-2 rounded-full text-white font-semibold">
            Level {level}
          </div>
          <div className="bg-white bg-opacity-30 px-4 py-2 rounded-full text-white font-semibold">
            {xp} XP
          </div>
          <button className="bg-white bg-opacity-30 p-3 rounded-full">
            <User size={24} className="text-white" />
          </button>
        </div>
      </header>
      
      <main className="relative bg-white bg-opacity-20 rounded-lg shadow-lg overflow-hidden mb-6">
        <div ref={containerRef} className="h-[70vh] overflow-hidden relative">
          {wishes.map((wish) => (
            <DraggableWish key={wish.id} wish={wish} containerRef={containerRef} />
          ))}
          
          {/* Floating toggle button */}
          <motion.button
            className="absolute bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg z-10 flex items-center"
            onClick={() => setIsControlsVisible(!isControlsVisible)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronUp
              size={20}
              className={`transition-transform duration-300 ${isControlsVisible ? 'rotate-180' : ''} mr-2`}
            />
            <span className="text-sm font-medium">
              {isControlsVisible ? "Close Controls" : "Open Controls"}
            </span>
          </motion.button>

          <AnimatePresence>
            {isControlsVisible && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-0 left-0 right-0 bg-pink-200 bg-opacity-90 p-4 rounded-t-2xl shadow-lg"
              >
                {/* Wish creation form */}
                <motion.div 
                  className="bg-pink-300 bg-opacity-50 backdrop-blur-sm p-4 rounded-t-2xl"
                  initial={false}
                  animate={{ height: isExpanded ? 'auto' : '60px' }}
                >
                  <button 
                    className="absolute top-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <ChevronDown 
                      size={24} 
                      className={`text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                    />
                    <span className="text-white text-sm mt-1">
                      {isExpanded ? "Hide" : "Create a Wish"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pt-10"
                      >
                        <input 
                          type="text" 
                          value={wishText}
                          onChange={(e) => setWishText(e.target.value)}
                          placeholder="Whisper your wish..."
                          maxLength={200}
                          className="w-full p-3 rounded-full bg-white bg-opacity-50 placeholder-gray-600 mb-3 text-gray-800"
                        />
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full p-3 rounded-full bg-white bg-opacity-50 mb-3 text-gray-800"
                        >
                          <option value="">Select category</option>
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
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setIsPrivate(!isPrivate)}
                              className={`p-2 rounded-full ${isPrivate ? 'bg-purple-600' : 'bg-white bg-opacity-50'}`}
                            >
                              {isPrivate ? <Lock size={20} className="text-white" /> : <Globe size={20} className="text-gray-800" />}
                            </button>
                            <span className="text-sm text-gray-800 font-semibold">
                              {isPrivate ? "Private" : "Public"}
                            </span>
                          </div>
                          <button
                            onClick={createWish}
                            className="bg-purple-600 px-4 py-2 rounded-full text-white font-semibold flex items-center"
                          >
                            <PlusCircle size={20} className="mr-2" />
                            Make a Wish
                          </button>
                        </div>
                        <p className="text-sm text-center text-gray-800">
                          {isPrivate 
                            ? "Your wish will be kept private and only visible to you. Toggle to make it public." 
                            : "Your wish will be visible in the public Wish Garden for others to support. Toggle to make it private."}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Blow Wishes and Go to Wish Garden buttons */}
                <footer className="flex flex-col space-y-3 mt-4">
                  <button 
                    onClick={blowWishes} 
                    className="bg-pink-400 px-6 py-3 rounded-full flex items-center justify-center text-white font-semibold hover:bg-pink-500 transition-all"
                  >
                    <Wind className="mr-2" /> Blow Wishes
                  </button>
                  <Link href="/global-garden">
                    <a className="bg-pink-400 px-6 py-3 rounded-full flex items-center justify-center text-white font-semibold hover:bg-pink-500 transition-all">
                      <Flower className="mr-2" /> Go to Wish Garden
                    </a>
                  </Link>
                </footer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const DraggableWish: React.FC<DraggableWishProps> = ({ wish, containerRef }) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const colors = ['bg-yellow-300', 'bg-pink-300', 'bg-blue-300', 'bg-green-300', 'bg-purple-300'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const [position, setPosition] = useState({ x: wish.x, y: wish.y });

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const updatePosition = () => {
        const newX = Math.random() * 60 + 20; // Keep within 20-80% of container width
        const newY = Math.random() * 40 + 30; // Keep within 30-70% of container height
        setPosition({ x: newX, y: newY });
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [containerRef]);

  const handleInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    event.stopPropagation();
    setIsDetailsVisible(!isDetailsVisible);
  };

  return (
    <motion.div
      className={`absolute w-12 h-12 sm:w-16 sm:h-16 ${randomColor} rounded-full flex items-center justify-center cursor-pointer shadow-lg`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      drag
      dragMomentum={false}
      dragConstraints={containerRef}
      dragElastic={0.1}
      whileHover={{ scale: 1.1 }}
      whileDrag={{ scale: 1.1 }}
      onClick={handleInteraction}
      onTap={handleInteraction}
    >
      <span className="text-xl sm:text-2xl">🌟</span>

      <AnimatePresence>
        {isDetailsVisible && (
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
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <p className="text-gray-800 text-sm font-medium mb-2">{wish.text}</p>
            <div className="text-xs text-gray-500 mt-1">Category: {wish.category}</div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-purple-600">✨ +5 XP</span>
              <button 
                className="bg-purple-500 text-white text-xs px-2 py-1 rounded hover:bg-purple-600 transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle support action
                }}
              >
                Support
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WishCreator;
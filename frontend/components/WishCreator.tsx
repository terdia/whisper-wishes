import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Wind, Flower, User, Lock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
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

const WishCreator: React.FC = () => {
  const [wishText, setWishText] = useState('');
  const [category, setCategory] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user, fetchUserStatistics } = useAuth();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);

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
      created_at: new Date().toISOString()
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
      
      // Fetch updated statistics
      await fetchUserStatistics();
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
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-purple-200 p-4 font-sans relative overflow-hidden">
      {showConfetti && <Confetti />}
      {/* Subtle floating dandelion seeds */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-gray-300 text-opacity-30 pointer-events-none"
          style={{
            top: `${Math.random() * 60 + 20}%`,
            left: `${Math.random() * 60 + 20}%`,
            fontSize: `${Math.random() * 20 + 10}px`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 30 - 15, 0],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ❁
        </motion.div>
      ))}

      <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-800 mb-4 sm:mb-0">Every wish counts</h1>
        <div className="flex items-center space-x-4">
          <div className="bg-white bg-opacity-50 px-3 py-1 rounded-full text-purple-800">
            Level {level}
          </div>
          <div className="bg-white bg-opacity-50 px-3 py-1 rounded-full text-purple-800">
            {xp} XP
          </div>
          <button className="bg-white bg-opacity-50 p-2 rounded-full">
            <User className="text-purple-800" />
          </button>
        </div>
      </header>
      
      <main className="relative h-[60vh] md:h-[70vh] bg-white bg-opacity-30 rounded-lg shadow-lg overflow-hidden mb-4">
        <div ref={containerRef} className="absolute inset-0 overflow-hidden">
          {wishes.map((wish) => (
            <DraggableWish key={wish.id} wish={wish} />
          ))}
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <input 
            type="text" 
            value={wishText}
            onChange={(e) => setWishText(e.target.value)}
            placeholder="Whisper your wish..."
            maxLength={200}
            className="w-full p-3 rounded-full bg-white bg-opacity-70 text-purple-800 placeholder-purple-400"
          />
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-grow p-2 rounded-full bg-white bg-opacity-70 text-purple-800"
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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className={`p-2 rounded-full ${isPrivate ? 'bg-purple-600 text-white' : 'bg-white bg-opacity-70 text-purple-800'}`}
              >
                {isPrivate ? <Lock size={20} /> : <Globe size={20} />}
              </button>
              <span className="text-sm text-purple-800">
                {isPrivate ? "Private" : "Public"}
              </span>
            </div>
            <button
              onClick={createWish}
              className="bg-purple-600 text-white px-4 py-2 rounded-full"
            >
              Make a Wish
            </button>
          </div>
        </div>
      </main>
      
      <div className="text-center mb-4 text-purple-800">
        <p>
          {isPrivate 
            ? "Your wish will be kept private and only visible to you." 
            : "Your wish will be visible in the public Wish Garden for others to support. You can toggle to make it private."}
        </p>
      </div>

      <footer className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
        <button onClick={blowWishes} className="bg-purple-600 text-white px-6 py-2 rounded-full flex items-center justify-center">
          <Wind className="mr-2" /> Blow Wishes
        </button>
        <Link href="/global-garden">
          <a className="bg-teal-500 text-white px-6 py-2 rounded-full flex items-center justify-center">
            <Flower className="mr-2" /> Wish Garden
          </a>
        </Link>
      </footer>
    </div>
  );
};

interface DraggableWishProps {
  wish: Wish;
}

const DraggableWish: React.FC<DraggableWishProps> = ({ wish }) => {
  const [isHovered, setIsHovered] = useState(false);
  const colors = ['bg-yellow-300', 'bg-pink-300', 'bg-blue-300', 'bg-green-300', 'bg-purple-300'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <div
      className={`absolute w-12 h-12 sm:w-16 sm:h-16 ${randomColor} rounded-full flex items-center justify-center cursor-move transition-all duration-300 hover:scale-110 shadow-lg`}
      style={{
        left: `${wish.x}%`,
        top: `${wish.y}%`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute w-48 bg-white border-2 border-gray-200 rounded-lg p-2 shadow-xl transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
           style={{
             left: '50%',
             bottom: '120%',
             transform: 'translateX(-50%)',
             pointerEvents: isHovered ? 'auto' : 'none',
           }}>
        <p className="text-gray-800 text-sm font-medium mb-2">{wish.text}</p>
        <div className="text-xs text-gray-500 mt-1">Category: {wish.category}</div>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-xs text-purple-600">✨ +5 XP</span>
          <button className="bg-purple-500 text-white text-xs px-2 py-1 rounded hover:bg-purple-600 transition-colors duration-200">
            Support
          </button>
        </div>
      </div>
      <span className="text-xl sm:text-2xl">🌟</span>
    </div>
  );
};

export default WishCreator;
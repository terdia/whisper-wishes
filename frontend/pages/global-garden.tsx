import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import UnauthenticatedUserPrompt from '../components/UnauthenticatedUserPrompt';
import { toast } from 'react-toastify';
import { Loader2, Search, Wind, Info, User, X, Calendar, ThumbsUp, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';


interface UserProfile {
  id: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  is_premium?: boolean;
  is_public?: boolean;
}

interface Wish {
  id: string;
  wish_text: string;
  category: string;
  user_id: string;
  support_count: number;
  is_private: boolean;
  user_profile: UserProfile;
}

const categoryColors: { [key: string]: string } = {
  personal: '#FFB3BA',
  career: '#BAFFC9',
  health: '#BAE1FF',
  relationships: '#FFFFBA',
  financial: '#FFD9BA',
  travel: '#E0BBE4',
  creativity: '#957DAD',
  spiritual: '#D291BC',
  community: '#FEC8D8',
  environmental: '#FFDFD3',
  learning: '#97C1A9',
  lifestyle: '#FCB9AA',
  other: '#CCE2CB'
};

const Dandelion: React.FC<{ wish: Wish; onWater: (wishId: string) => void; onClick: () => void }> = ({ wish, onWater, onClick }) => {
  const { user } = useAuth();
  const seedCount = Math.min(Math.max(wish.support_count, 5), 20);
  const seeds = Array(seedCount).fill(0);
  const isOwnWish = user?.id === wish.user_id;

  return (
    <motion.div
      className="relative w-full sm:w-48 h-48 m-2 cursor-pointer bg-white rounded-lg shadow-lg overflow-hidden group"
      whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      onClick={onClick}
    >
      <div className="absolute inset-0 flex items-center justify-center p-4" style={{ background: `${categoryColors[wish.category]}80` }}>
        <div className="text-sm text-center overflow-hidden max-h-full font-semibold text-gray-800">
          {wish.wish_text.length > 100 ? `${wish.wish_text.substring(0, 100)}...` : wish.wish_text}
        </div>
      </div>
      {seeds.map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-2 h-2 bg-white rounded-full"
          initial={{ x: '50%', y: '50%' }}
          animate={{
            x: `${50 + (Math.random() * 80 - 40)}%`,
            y: `${50 + (Math.random() * 80 - 40)}%`,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
      <motion.button
        whileHover={{ scale: 1.1 }}
        onClick={(e) => {
          e.stopPropagation();
          onWater(wish.id);
        }}
        className={`absolute bottom-2 right-2 p-2 rounded-full transition-colors group ${
          isOwnWish
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        disabled={isOwnWish}
      >
        <Wind size={16} />
        <span className="absolute bottom-full right-0 mb-2 w-auto p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isOwnWish ? "Can't water own wish" : 'Water this wish'}
        </span>
      </motion.button>

       {/* info tooltip */}
       <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-gray-800 text-white text-xs rounded-md p-2">
          Click to view details
        </div>
      </div>
    </motion.div>
  );
};

const WishModal: React.FC<{ wish: Wish; onClose: () => void; onWater: (wishId: string) => void }> = ({ wish, onClose, onWater }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-green-800">Wish Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <p className="text-lg italic text-gray-800">&ldquo;{wish.wish_text}&rdquo;</p>
        </div>
        <div className="flex items-center mb-4">
          {wish.user_profile.is_public ? (
            <>
              {wish.user_profile.avatar_url ? (
                <img 
                  src={wish.user_profile.avatar_url} 
                  alt={wish.user_profile.username || 'User'} 
                  className="w-10 h-10 rounded-full mr-2"
                />
              ) : (
                <User className="w-10 h-10 mr-2 text-green-600" />
              )}
              <span className="font-semibold text-gray-800">By: {wish.user_profile.username || 'Anonymous'}</span>
            </>
          ) : (
            <>
              <User className="w-10 h-10 mr-2 text-green-600" />
              <span className="font-semibold text-gray-800">By: Anonymous User</span>
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center">
            <Calendar className="mr-2 text-green-600" />
            <span className="text-gray-800">Category: {wish.category}</span>
          </div>
          <div className="flex items-center">
            <ThumbsUp className="mr-2 text-green-600" />
            <span className="text-gray-800">Waters: {wish.support_count}</span>
          </div>
        </div>
        <button
          onClick={() => onWater(wish.id)}
          className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
        >
          <Wind className="mr-2" size={20} />
          Water this Wish
        </button>
      </motion.div>
    </motion.div>
  );
};

const GlobalWishGarden: React.FC = () => {
  const { user, userProfile, isLoading: authLoading } = useAuth();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'mostWatered'>('mostWatered');
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const wishesPerPage = 12;

  const fetchWishes = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('wishes')
        .select(`
          *,
          user_profile:user_profiles(id, username, avatar_url, is_public)
        `)
        .eq('is_private', false);

      if (sortOrder === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('support_count', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setWishes(data as Wish[]);
    } catch (error) {
      console.error('Error fetching wishes:', error);
      toast.error('Failed to fetch wishes');
    } finally {
      setIsLoading(false);
    }
  }, [sortOrder, user]);

  useEffect(() => {
    if (user && userProfile && !authLoading) {
      fetchWishes();
    }
  }, [user, userProfile, authLoading, fetchWishes]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search term or category changes
  }, [searchTerm, selectedCategory]);

  const filteredWishes = wishes.filter(wish => 
    wish.wish_text.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === '' || wish.category === selectedCategory)
  );

  const pageCount = Math.ceil(filteredWishes.length / wishesPerPage);
  const currentWishes = filteredWishes.slice(
    (currentPage - 1) * wishesPerPage,
    currentPage * wishesPerPage
  );

  const waterWish = async (wishId: string) => {
    if (!user) return;

    const wishToWater = wishes.find(w => w.id === wishId);
    if (!wishToWater) {
      toast.error('Wish not found');
      return;
    }

    if (wishToWater.user_id === user.id) {
      toast.error('You cannot water your own wish');
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('support_wish', { p_user_id: user.id, p_wish_id: wishId });

      if (error) throw error;

      if (data) {
        toast.success('Wish watered successfully!');
        // Update the local state to reflect the change
        setWishes(wishes.map(w => 
          w.id === wishId ? { ...w, support_count: w.support_count + 1 } : w
        ));
      } else {
        toast.error('You have already watered this wish');
      }
    } catch (error) {
      console.error('Error watering wish:', error);
      toast.error('Failed to water wish');
    }
  };

  if (authLoading || isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user || !userProfile) {
    return <UnauthenticatedUserPrompt />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-white text-center"
      >
        Global Wish Garden
      </motion.h1>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8 flex flex-wrap gap-4 justify-center items-center"
      >
        <div className="relative flex-grow max-w-xl w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search wishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-full border-2 border-green-300 focus:outline-none focus:border-green-500 bg-white bg-opacity-80"
          />
          <Search className="absolute left-3 top-3.5 text-green-500" size={20} />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto p-3 rounded-full border-2 border-green-300 focus:outline-none focus:border-green-500 bg-white bg-opacity-80"
        >
          <option value="">All Categories</option>
          {Object.keys(categoryColors).map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'newest' | 'mostWatered')}
          className="w-full sm:w-auto p-3 rounded-full border-2 border-green-300 focus:outline-none focus:border-green-500 bg-white bg-opacity-80"
        >
          <option value="mostWatered">Most Watered</option>
          <option value="newest">Newest</option>
        </select>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {currentWishes.map(wish => (
          <motion.div
            key={wish.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Dandelion 
              wish={wish} 
              onWater={waterWish}
              onClick={() => setSelectedWish(wish)}
            />
          </motion.div>
        ))}
      </motion.div>

      {filteredWishes.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white mt-8"
        >
          <Info size={48} className="mx-auto mb-4" />
          <p className="text-xl">No wishes found. Try adjusting your search or filters.</p>
        </motion.div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-white text-green-600 rounded-full p-2 shadow-lg disabled:opacity-50"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-white font-semibold">
            Page {currentPage} of {pageCount}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
            disabled={currentPage === pageCount}
            className="bg-white text-green-600 rounded-full p-2 shadow-lg disabled:opacity-50"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedWish && (
          <WishModal 
            wish={selectedWish} 
            onClose={() => setSelectedWish(null)}
            onWater={waterWish}
          />
        )}
      </AnimatePresence>

      {/* Floating Dandelion Seeds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white text-opacity-70 select-none"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              x: [null, Math.random() * 200 - 100],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'loop'
            }}
          >
            ❁
          </motion.div>
        ))}
      </div>

      {/* Garden Floor */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-800 to-transparent pointer-events-none" />

      {/* Filter Button for Mobile */}
      <motion.button
        className="fixed bottom-4 right-4 bg-white text-green-600 rounded-full p-3 shadow-lg md:hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {/* Toggle filter menu */}}
      >
        <Filter size={24} />
      </motion.button>
    </div>
  );
};

export default GlobalWishGarden;
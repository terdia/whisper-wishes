import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import UnauthenticatedUserPrompt from '../components/UnauthenticatedUserPrompt';
import { toast } from 'react-toastify';
import { Loader2, Search, Wind, Info, User, X, Calendar, ThumbsUp } from 'lucide-react';

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

interface CategoryColors {
  [key: string]: string;
}

const categoryColors: CategoryColors = {
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

interface DandelionProps {
  wish: Wish;
  onWater: (wishId: string) => void;
  onClick: () => void;
}

const Dandelion: React.FC<DandelionProps> = ({ wish, onWater, onClick }) => {
  const { user } = useAuth();
  const seedCount = Math.min(Math.max(wish.support_count, 5), 20);
  const seeds = Array(seedCount).fill(0);
  const isOwnWish = user?.id === wish.user_id;

  return (
    <motion.div
      className="relative w-48 h-48 m-3 cursor-pointer bg-white rounded-lg shadow-lg overflow-hidden group"
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
    >
      <div className="absolute inset-0 flex items-center justify-center p-4" style={{ background: `${categoryColors[wish.category]}50` }}>
        <div className="text-sm text-center overflow-hidden max-h-full">{wish.wish_text}</div>
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
        <Wind size={20} />
        <span className="absolute bottom-full right-0 mb-2 w-auto p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isOwnWish ? "Can't water own wish" : 'Water this wish'}
        </span>
      </motion.button>
      
      {/* New info tooltip */}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-green-800">Wish Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <p className="text-lg italic">&ldquo;{wish.wish_text}&rdquo;</p>
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
              <span className="font-semibold">By: {wish.user_profile.username || 'Anonymous'}</span>
            </>
          ) : (
            <>
              <User className="w-10 h-10 mr-2 text-green-600" />
              <span className="font-semibold">By: Anonymous User</span>
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center">
            <Calendar className="mr-2 text-green-600" />
            <span>Category: {wish.category}</span>
          </div>
          <div className="flex items-center">
            <ThumbsUp className="mr-2 text-green-600" />
            <span>Waters: {wish.support_count}</span>
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
    </div>
  );
};

const GlobalWishGarden: React.FC = () => {
  const { user } = useAuth();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'mostWatered'>('mostWatered');
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);

  const fetchWishes = useCallback(async () => {
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
  }, [sortOrder]);

  useEffect(() => {
    if (user) {
      fetchWishes();
      const wishesSubscription = supabase
        .channel('public:wishes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes' }, handleWishUpdate)
        .subscribe();

      return () => {
        supabase.removeChannel(wishesSubscription);
      };
    }
  }, [user, fetchWishes]);

  const handleWishUpdate = (payload: any) => {
    if (payload.eventType === 'UPDATE') {
      setWishes(currentWishes => 
        currentWishes.map(wish => 
          wish.id === payload.new.id ? { ...wish, ...payload.new } : wish
        ).sort((a, b) => b.support_count - a.support_count)
      );
    } else if (payload.eventType === 'INSERT') {
      setWishes(currentWishes => 
        [...currentWishes, payload.new as Wish]
          .sort((a, b) => b.support_count - a.support_count)
      );
    } else if (payload.eventType === 'DELETE') {
      setWishes(currentWishes => currentWishes.filter(wish => wish.id !== payload.old.id));
    }
  };

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
      } else {
        toast.error('You have already watered this wish');
      }
    } catch (error) {
      console.error('Error watering wish:', error);
      toast.error('Failed to water wish');
    }
  };

  const filteredWishes = wishes.filter(wish => 
    wish.wish_text.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === '' || wish.category === selectedCategory)
  );

  if (!user) {
    return <UnauthenticatedUserPrompt />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-100">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-green-100 to-blue-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-green-800 text-center">Global Wish Garden</h1>
      
      <div className="mb-8 flex flex-wrap gap-4 justify-center items-center">
        <div className="relative flex-grow max-w-xl w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search wishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-full border-2 border-green-300 focus:outline-none focus:border-green-500"
          />
          <Search className="absolute left-3 top-3.5 text-green-400" size={20} />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex-grow sm:flex-grow-0 p-3 rounded-full border-2 border-green-300 focus:outline-none focus:border-green-500"
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
          className="flex-grow sm:flex-grow-0 p-3 rounded-full border-2 border-green-300 focus:outline-none focus:border-green-500"
        >
          <option value="mostWatered">Most Watered</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="flex flex-wrap justify-center">
        {filteredWishes.map(wish => (
          <Dandelion 
            key={wish.id} 
            wish={wish} 
            onWater={waterWish}
            onClick={() => setSelectedWish(wish)}
          />
        ))}
      </div>

      {filteredWishes.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <Info size={48} className="mx-auto mb-4" />
          <p>No wishes found. Try adjusting your search or filters.</p>
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
    </div>
  );
};

export default GlobalWishGarden;
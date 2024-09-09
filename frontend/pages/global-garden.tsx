import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import UnauthenticatedUserPrompt from '../components/UnauthenticatedUserPrompt';
import { toast } from 'react-toastify';
import { Search, Wind, Info, Filter, ChevronLeft, ChevronRight, Grid, List, Flower } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';
import DandelionView from '../components/garden/DandelionView';
import GridView from '../components/garden/GridView';
import ListView from '../components/garden/ListView';

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
  x: number;
  y: number;
  z: number;
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

const GlobalWishGarden: React.FC = () => {
  const { user, userProfile, isLoading: authLoading, updateUserStats } = useAuth();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'mostWatered'>('mostWatered');
  const [viewMode, setViewMode] = useState<'dandelion' | 'grid' | 'list'>('dandelion');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [cachedWishes, setCachedWishes] = useState<{[key: string]: Wish[]}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const wishesPerPage = 36;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastWishElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const getCacheKey = () => {
    return `${sortOrder}-${selectedCategory}-${searchTerm}`;
  };

  const fetchWishes = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const cacheKey = getCacheKey();
    const cachedData = cachedWishes[cacheKey];

    if (cachedData && page < cachedData.length / 20) {
      setWishes(cachedData.slice(0, (page + 1) * 20));
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('wishes')
        .select(`
          *,
          user_profile:user_profiles(id, username, avatar_url, is_public)
        `)
        .eq('is_private', false)
        .range(page * 20, (page + 1) * 20 - 1);

      if (sortOrder === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('support_count', { ascending: false });
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (searchTerm) {
        query = query.ilike('wish_text', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const newWishes = (data as Wish[]).map(wish => ({
        ...wish,
        x: Math.random(),
        y: Math.random(),
        z: Math.random()
      }));

      setWishes(prevWishes => {
        const updatedWishes = [...prevWishes, ...newWishes];
        setCachedWishes(prev => ({ ...prev, [cacheKey]: updatedWishes }));
        return updatedWishes;
      });

      setHasMore(newWishes.length === 20);
    } catch (error) {
      console.error('Error fetching wishes:', error);
      toast.error('Failed to fetch wishes');
    } finally {
      setIsLoading(false);
    }
  }, [sortOrder, selectedCategory, searchTerm, page, user, cachedWishes]);

  useEffect(() => {
    if (user && userProfile && !authLoading) {
      fetchWishes();
    }
  }, [user, userProfile, authLoading, fetchWishes]);

  useEffect(() => {
    setWishes([]);
    setPage(0);
    setHasMore(true);
  }, [searchTerm, selectedCategory, sortOrder]);

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
      const { data: existingSupport, error: supportCheckError } = await supabase
        .from('wish_supports')
        .select('id')
        .eq('user_id', user.id)
        .eq('wish_id', wishId)
        .single();

      if (supportCheckError && supportCheckError.code !== 'PGRST116') {
        throw supportCheckError;
      }

      if (existingSupport) {
        toast.info('You have already watered this wish');
        return;
      }

      const { data, error } = await supabase
        .rpc('support_wish', { p_user_id: user.id, p_wish_id: wishId });

      if (error) throw error;

      if (data) {
        const { data: xpData, error: xpError } = await supabase.rpc('update_xp_and_level', {
          p_user_id: user.id,
          p_xp_gained: 5
        });

        if (xpError) throw xpError;

        const { data: creatorStats, error: creatorStatsError } = await supabase
            .from('user_stats')
            .select('user_id')
            .eq('user_id', wishToWater.user_id)
            .single();

        if (creatorStatsError && creatorStatsError.code !== 'PGRST116') {
          throw creatorStatsError;
        }       

        if (!creatorStats) {
          const { error: createStatsError } = await supabase
            .from('user_stats')
            .insert({
              user_id: wishToWater.user_id,   
              xp: 3,
              level: 1,
              last_login: new Date().toISOString(),
              login_streak: 1
            });

          if (createStatsError) throw createStatsError;
        } else {
          const { error: creatorXpError } = await supabase.rpc('update_xp_and_level', {
            p_user_id: wishToWater.user_id,
            p_xp_gained: 3
          });

          if (creatorXpError) throw creatorXpError;
        } 

        toast.success('Wish watered successfully! You earned 5 XP.');

        setWishes(wishes.map(w => 
            w.id === wishId ? { ...w, support_count: w.support_count + 1 } : w
          ));

        if (xpData) {
          updateUserStats({
            xp: xpData.new_xp,
            level: xpData.new_level
          });
        }
      } else {
        toast.error('Failed to water wish');
      }
    } catch (error) {
      console.error('Error watering wish:', error);
      toast.error('Failed to water wish');
    }
  };

  const handleWishClick = (wish: Wish) => {
    // Handle wish click (e.g., show details, navigate to wish page, etc.)
    console.log('Wish clicked:', wish);
  };

  const handleViewModeChange = (mode: 'dandelion' | 'grid' | 'list') => {
    setViewMode(mode);
  };

  const filteredWishes = wishes.filter(wish => 
    wish.wish_text.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === '' || wish.category === selectedCategory)
  );

  const pageCount = Math.ceil(filteredWishes.length / wishesPerPage);

  if (!user || !userProfile) {
    return (
      <>
        <SEO
          title="Global Wish Garden - Join Our Community"
          description="Explore and support wishes from around the world in our Global Wish Garden. Sign up or log in to participate!"
        />
        <UnauthenticatedUserPrompt />
      </>
    );
  }

  if (authLoading || isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-4 sm:p-8">
      <SEO
        title="Global Wish Garden"
        description="Explore and support wishes from around the world in our Global Wish Garden."
        noindex={false}
      />

      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white text-center"
      >
        Global Wish Garden
      </motion.h1>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-4 justify-center items-center"
      >
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search wishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 p-2 pl-8 rounded-full border-2 border-green-300 focus:outline-none focus:border-green-500 bg-white bg-opacity-80"
          />
          <Search className="absolute left-2 top-2.5 text-green-500" size={18} />
        </div>
        <button
          onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
          className="p-2 bg-white text-green-600 rounded-full shadow-lg"
        >
          <Filter size={18} />
        </button>
        <div className="flex bg-white rounded-full shadow-lg overflow-hidden">
          <button
            onClick={() => handleViewModeChange('dandelion')}
            className={`p-2 ${viewMode === 'dandelion' ? 'bg-green-500 text-white' : 'text-green-600'}`}
          >
            <Flower size={18} />
          </button>
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'text-green-600'}`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-green-500 text-white' : 'text-green-600'}`}
          >
            <List size={18} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isFilterMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-white rounded-lg shadow-md"
          >
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 mb-2 rounded-md border-2 border-green-300 focus:outline-none focus:border-green-500"
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
              className="w-full p-2 rounded-md border-2 border-green-300 focus:outline-none focus:border-green-500"
            >
              <option value="mostWatered">Most Watered</option>
              <option value="newest">Newest</option>
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'dandelion' && (
            <DandelionView
              wishes={filteredWishes}
              isLoading={isLoading}
              onWishClick={handleWishClick}
              onWaterWish={waterWish}
              categoryColors={categoryColors}
            />
          )}
          {viewMode === 'grid' && (
            <GridView
              wishes={filteredWishes}
              onWishClick={handleWishClick}
              onWaterWish={waterWish}
              categoryColors={categoryColors}
              currentPage={currentPage}
              wishesPerPage={wishesPerPage}
            />
          )}
          {viewMode === 'list' && (
            <ListView
              wishes={filteredWishes}
              onWishClick={handleWishClick}
              onWaterWish={waterWish}
              categoryColors={categoryColors}
              currentPage={currentPage}
              wishesPerPage={wishesPerPage}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {filteredWishes.length === 0 && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white mt-8"
        >
          <Info size={48} className="mx-auto mb-4" />
          <p className="text-xl">No wishes found. Try adjusting your search or filters.</p>
        </motion.div>
      )}

      {(viewMode === 'grid' || viewMode === 'list') && pageCount > 1 && (
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

      {/* Floating Dandelion Seeds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
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
      <div className="fixed bottom-0 left-0 right-0 h-16 sm:h-32 bg-gradient-to-t from-green-800 to-transparent pointer-events-none" />
    </div>
  );
};

export default GlobalWishGarden;
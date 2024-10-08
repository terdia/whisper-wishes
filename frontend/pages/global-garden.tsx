import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { wishCache } from '../utils/wishCache';
import { toast } from 'react-toastify';
import { Search, Star,Info, Filter, Grid, List, Flower } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import UnauthenticatedUserPrompt from '../components/UnauthenticatedUserPrompt';
import DandelionView from '../components/garden/DandelionView';
import GridView from '../components/garden/GridView';
import ListView from '../components/garden/ListView';
import WishModal from '../components/WishModal';
import { supabase } from '../utils/supabaseClient';
import FeaturedWishesModal from '../components/FeaturedWishesModal';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      title:"Global Wish Garden | Explore Wishes Worldwide",
      description:"Discover and support wishes from around the world in our Global Wish Garden. Join the Dandy Wishes community and help dreams come true.",
      canonical: `https://www.dandywishes.app/global-garden`
    },
  };
};

interface Wish {
  id: string;
  wish_text: string;
  category: string;
  user_id: string;
  support_count: number;
  is_private: boolean;
  user_profile: {
    id: string;
    username?: string;
    avatar_url?: string;
    is_public?: boolean;
  };
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
  const [allWishes, setAllWishes] = useState<Wish[]>([]);
  const [displayedWishes, setDisplayedWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'mostWatered'>('mostWatered');
  const [viewMode, setViewMode] = useState<'dandelion' | 'grid' | 'list'>('dandelion');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const wishesPerPage = 50;
  const [showFeaturedWishes, setShowFeaturedWishes] = useState(false);
  const router = useRouter();

  const loadWishes = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const wishes = await wishCache.fetchAllWishes(user.id, sortOrder, selectedCategory, searchTerm);
    setAllWishes(wishes);
    setDisplayedWishes(wishes.slice(0, wishesPerPage));
    setHasMore(wishes.length > (page + 1) * wishesPerPage);
    setIsLoading(false);
  }, [user, sortOrder, selectedCategory, searchTerm]);

  useEffect(() => {
    if (user && userProfile && !authLoading) {
      loadWishes();
    }
  }, [user, userProfile, authLoading, loadWishes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setPage(0);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'newest' | 'mostWatered');
    setPage(0);
  };

  const waterWish = async (wishId: string) => {
    if (!user) return;

    try {
      const result = await wishCache.waterWish(user.id, wishId);

      if (result.success) {
        toast.success(`Wish watered successfully! You earned 5 XP.`);
        setAllWishes(prevWishes => 
          prevWishes.map(w => w.id === wishId ? { ...w, support_count: w.support_count + 1 } : w)
        );

        // After successfully supporting a wish
        try {
          const { data, error } = await supabase.rpc('create_notification', {
            p_user_id: result.wish?.user_id,
            p_type: 'WISH_SUPPORT',
            p_content: {
              supporterName: userProfile.is_public ? userProfile.username : 'Anonymous User',
              wishText: result.wish?.wish_text 
                ? result.wish.wish_text.substring(0, 50) + (result.wish.wish_text.length > 50 ? '...' : '')
                : 'Unknown wish'
            }
          });

          if (error) throw error;

          console.log('Notification created:', data.notification);
          } catch (error) {
            console.error('Error creating notification:', error);
          }

      } else if (result.error) {
        throw result.error;
      } else {
        toast.info('You have already watered this wish');
      }
    } catch (error) {
      console.error('Error watering wish:', error);
      toast.error('Failed to water wish');
    }
  };

  const handleWishClick = (wish: Wish) => {
    setSelectedWish(wish);
  };

  const handleViewModeChange = (mode: 'dandelion' | 'grid' | 'list') => {
    setViewMode(mode);
    setPage(0);
    setDisplayedWishes(allWishes.slice(0, wishesPerPage));
    setHasMore(allWishes.length > wishesPerPage);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setDisplayedWishes(allWishes.slice(0, (nextPage + 1) * wishesPerPage));
    setHasMore(allWishes.length > (nextPage + 1) * wishesPerPage);
  };

  if (!user || !userProfile) {
    return (
      <>
        <UnauthenticatedUserPrompt />
      </>
    );
  }

  if (authLoading || isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-4 sm:p-8 flex flex-col flex-grow">
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:block text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center"
        >
          Global Wish Garden
        </motion.h1>
              
        {/* Featured Wishes Button */}
        <motion.button 
          onClick={() => setShowFeaturedWishes(true)}
          className="w-full sm:w-auto bg-yellow-400 text-purple-800 font-bold py-2 px-4 rounded-full shadow-lg hover:bg-yellow-300 transition-colors duration-200 flex items-center justify-center mt-4 sm:mt-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Star className="mr-2" size={20} />
          View Featured Wishes
        </motion.button>
      </div>
        
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
              onChange={handleSearchChange}
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
                onChange={handleCategoryChange}
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
                onChange={handleSortOrderChange}
                className="w-full p-2 rounded-md border-2 border-green-300 focus:outline-none focus:border-green-500"
              >
                <option value="mostWatered">Most Watered</option>
                <option value="newest">Newest</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>

       <div className="flex-grow overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-full h-[calc(100vh-200px)]"
          >
            {viewMode === 'dandelion' && (
              <DandelionView
                wishes={displayedWishes}
                isLoading={isLoading}
                onWishClick={handleWishClick}
                onWaterWish={waterWish}
                categoryColors={categoryColors}
                hasMore={hasMore}
                loadMore={handleLoadMore}
              />
            )}
            {viewMode === 'grid' && (
              <GridView
                wishes={displayedWishes}
                onWishClick={handleWishClick}
                onWaterWish={waterWish}
                categoryColors={categoryColors}
                hasMore={hasMore}
                loadMore={handleLoadMore}
              />
            )}
            {viewMode === 'list' && (
              <ListView
                wishes={displayedWishes}
                onWishClick={handleWishClick}
                onWaterWish={waterWish}
                categoryColors={categoryColors}
                hasMore={hasMore}
                loadMore={handleLoadMore}
              />
            )}
          </motion.div>
        </AnimatePresence>
       </div>

      <FeaturedWishesModal
        isOpen={showFeaturedWishes}
        onClose={() => setShowFeaturedWishes(false)}
        onSupportWish={waterWish}
      />

      {selectedWish && (
        <WishModal
          wish={selectedWish}
          onClose={() => setSelectedWish(null)}
          onWater={waterWish}
        />
      )}

         {/* Garden Floor */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-800 to-transparent pointer-events-none" />

      {displayedWishes.length === 0 && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white mt-8"
        >
          <Info size={48} className="mx-auto mb-4" />
          <p className="text-xl">No wishes found. Try adjusting your search or filters.</p>
        </motion.div>
      )}
    </div>
    </>
  );

};

export default GlobalWishGarden;
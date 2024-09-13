import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AmplificationManager } from './amplify/AmplificationManager';
import { Wish } from './amplify/types';
import { Droplet, Users, HelpCircle, Briefcase, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

interface ExtendedWish extends Wish {
  user_profiles: {
    username: string;
    avatar_url: string;
  };
  wish_amplifications: {
    objective: 'support' | 'help' | 'mentorship';
    context?: string;
  }[];
}

interface AmplifiedWish {
  id: string;
  wish_id: string;
  user_id: string;
  amplified_at: string;
  expires_at: string;
  wishes: ExtendedWish;
  objective: 'support' | 'help' | 'mentorship';
  context?: string;
}

interface AmplifiedWishesProps {
  onSupportWish: (wishId: string) => void;
}

const AmplifiedWishes: React.FC<AmplifiedWishesProps> = ({ onSupportWish }) => {
  const [amplifiedWishesData, setAmplifiedWishesData] = useState<{
    amplifiedWishes: AmplifiedWish[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>({
    amplifiedWishes: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchAmplifiedWishes();
  }, []);

  const fetchAmplifiedWishes = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await AmplificationManager.getAmplifiedWishes(null, page, 10);
      setAmplifiedWishesData(data);
    } catch (error) {
      console.error('Error fetching amplified wishes:', error);
      // TODO: Implement error handling, possibly with a toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (amplifiedWishesData.currentPage < amplifiedWishesData.totalPages) {
      fetchAmplifiedWishes(amplifiedWishesData.currentPage + 1);
    }
  };

  const handleContactCreator = (wishId: string) => {
    router.push(`/amplified-wish/${wishId}`);
  };

  const getObjectiveIcon = (objective: string) => {
    switch (objective) {
      case 'support':
        return <Users className="text-blue-500" size={20} />;
      case 'help':
        return <HelpCircle className="text-green-500" size={20} />;
      case 'mentorship':
        return <Briefcase className="text-purple-500" size={20} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading amplified wishes...</div>;
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {amplifiedWishesData.amplifiedWishes.map((amplifiedWish) => (
          <motion.div
            key={amplifiedWish.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-lg p-6 transition-shadow hover:shadow-xl"
          >
            <div className="flex items-center mb-4">
              <img
                src={amplifiedWish.wishes.user_profiles.avatar_url || '/default-avatar.png'}
                alt={amplifiedWish.wishes.user_profiles.username}
                className="w-10 h-10 rounded-full mr-3"
              />
              <h3 className="text-lg font-semibold">{amplifiedWish.wishes.user_profiles.username}</h3>
            </div>
            <h4 className="text-xl font-semibold mb-2">{amplifiedWish.wishes.wish_text}</h4>
            <p className="text-gray-600 mb-4">Category: {amplifiedWish.wishes.category}</p>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${amplifiedWish.wishes.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Progress: {amplifiedWish.wishes.progress}%</p>
            </div>
            <div className="flex items-center mb-4">
              {getObjectiveIcon(amplifiedWish.objective)}
              <span className="ml-2 text-sm font-medium">
                {amplifiedWish.objective.charAt(0).toUpperCase() + amplifiedWish.objective.slice(1)}
              </span>
            </div>
            {amplifiedWish.context && (
              <p className="text-sm text-gray-600 mb-4">{amplifiedWish.context}</p>
            )}
            <div className="flex justify-between items-center">
              {amplifiedWish.objective === 'support' ? (
                <button
                  onClick={() => onSupportWish(amplifiedWish.wishes.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors duration-200 flex items-center"
                >
                  <Droplet className="mr-2" size={16} />
                  Support This Wish
                </button>
              ) : (
                <button
                  onClick={() => handleContactCreator(amplifiedWish.wishes.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors duration-200 flex items-center"
                >
                  <MessageCircle className="mr-2" size={16} />
                  Contact Creator
                </button>
              )}
              <span className="text-sm text-gray-500">
                Expires in {Math.ceil((new Date(amplifiedWish.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {amplifiedWishesData.currentPage < amplifiedWishesData.totalPages && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full transition-colors duration-200"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default AmplifiedWishes;
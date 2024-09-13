import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AmplificationManager } from './amplify/AmplificationManager';
import { Wish } from './amplify/types';
import { Droplet, Users, HelpCircle, Briefcase, MessageCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedWishes, setExpandedWishes] = useState<{ [key: string]: boolean }>({});

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
        return <Users className="text-blue-500" size={16} />;
      case 'help':
        return <HelpCircle className="text-green-500" size={16} />;
      case 'mentorship':
        return <Briefcase className="text-purple-500" size={16} />;
      default:
        return null;
    }
  };

  const toggleWishExpansion = (wishId: string) => {
    setExpandedWishes(prev => ({ ...prev, [wishId]: !prev[wishId] }));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading amplified wishes...</div>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {amplifiedWishesData.amplifiedWishes.map((amplifiedWish) => (
          <motion.div
            key={amplifiedWish.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-xl flex flex-col"
          >
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="flex items-center">
            {amplifiedWish.wishes.user_profiles.is_public ? (
              <>
                <img
                  src={amplifiedWish.wishes.user_profiles.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'}
                  alt={amplifiedWish.wishes.user_profiles.username || 'User avatar'}
                  className="w-10 h-10 rounded-full mr-3 border-2 border-white"
                />
                <h3 className="text-lg font-semibold text-white">
                  {amplifiedWish.wishes.user_profiles.username || 'Anonymous'}
                </h3>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full mr-3 border-2 border-white bg-gray-300 flex items-center justify-center">
                  <Users size={20} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-white">Anonymous</h3>
              </>
                )}
              </div>
            </div>
            <div className="p-4 flex-grow">
              <div className="mb-2">
                <h4 className={`text-xl font-semibold ${expandedWishes[amplifiedWish.id] ? '' : 'line-clamp-2'}`}>
                  {amplifiedWish.wishes.wish_text}
                </h4>
                {amplifiedWish.wishes.wish_text.length > 100 && (
                  <button 
                    onClick={() => toggleWishExpansion(amplifiedWish.id)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium mt-1 flex items-center"
                  >
                    {expandedWishes[amplifiedWish.id] ? (
                      <>
                        Read less <ChevronUp size={16} className="ml-1" />
                      </>
                    ) : (
                      <>
                        Read more <ChevronDown size={16} className="ml-1" />
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="text-gray-600 mb-4 text-sm">Category: {amplifiedWish.wishes.category}</p>
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${amplifiedWish.wishes.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Progress: {amplifiedWish.wishes.progress}%</p>
              </div>
              <div className="flex items-center mb-4 text-sm">
                {getObjectiveIcon(amplifiedWish.objective)}
                <span className="ml-2 font-medium">
                  {amplifiedWish.objective.charAt(0).toUpperCase() + amplifiedWish.objective.slice(1)}
                </span>
              </div>
              {amplifiedWish.context && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{amplifiedWish.context}</p>
              )}
            </div>
            <div className="mt-auto">
              <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Expires in {Math.ceil((new Date(amplifiedWish.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              <div className="px-4 py-3 bg-gray-50">
                {amplifiedWish.objective === 'support' ? (
                  <button
                    onClick={() => onSupportWish(amplifiedWish.wishes.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors duration-200 flex items-center justify-center text-sm"
                  >
                    <Droplet className="mr-2" size={14} />
                    Moral Support
                  </button>
                ) : (
                  <button
                    onClick={() => handleContactCreator(amplifiedWish.wishes.id)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors duration-200 flex items-center justify-center text-sm"
                  >
                    <MessageCircle className="mr-2" size={14} />
                    Contact Creator
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {amplifiedWishesData.currentPage < amplifiedWishesData.totalPages && (
        <div className="col-span-full text-center mt-6">
          <button
            onClick={handleLoadMore}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full transition-colors duration-200 text-sm"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default AmplifiedWishes;
// components/AmplifiedWishes.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AmplificationManager } from './amplify/AmplificationManager';
import { Wish } from './amplify/types';
import { Droplet, Users, HelpCircle, Briefcase } from 'lucide-react';

// Extended Wish type
interface ExtendedWish extends Wish {
  user_profiles: {
    username: string;
    avatar_url: string;
  };
}

interface AmplifiedWish {
  id: string;
  wish_id: string;
  user_id: string;
  amplified_at: string;
  expires_at: string;
  wishes: ExtendedWish;
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

  useEffect(() => {
    const fetchAmplifiedWishes = async () => {
      setIsLoading(true);
      try {
        const data = await AmplificationManager.getAmplifiedWishes(null, 1, 10);
        setAmplifiedWishesData(data);
      } catch (error) {
        console.error('Error fetching amplified wishes:', error);
        // You might want to toast an error message to the user here
      } finally {
        setIsLoading(false);
      }
    };

    fetchAmplifiedWishes();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading amplified wishes...</div>;
  }

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {amplifiedWishesData.amplifiedWishes.map((amplifiedWish) => {
        const wish = amplifiedWish.wishes;
        return (
          <motion.div
            key={amplifiedWish.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <img
                src={wish.user_profiles.avatar_url}
                alt={wish.user_profiles.username}
                className="w-10 h-10 rounded-full mr-3"
              />
              <h3 className="text-lg font-semibold">{wish.user_profiles.username}</h3>
            </div>
            <h4 className="text-xl font-semibold mb-2">{wish.wish_text}</h4>
            <p className="text-gray-600 mb-4">Category: {wish.category}</p>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${wish.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Progress: {wish.progress}%</p>
            </div>
            <div className="mt-4 flex items-center">
              {getObjectiveIcon(amplifiedWish.objective)}
              <span className="ml-2 text-sm font-medium">
                {amplifiedWish.objective.charAt(0).toUpperCase() + amplifiedWish.objective.slice(1)}
              </span>
            </div>
            {amplifiedWish.context && (
              <p className="mt-2 text-sm text-gray-600">{amplifiedWish.context}</p>
            )}
            <button
              onClick={() => onSupportWish(wish.id)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors duration-200 flex items-center"
            >
              <Droplet className="mr-2" size={16} />
              Support This Wish
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AmplifiedWishes;
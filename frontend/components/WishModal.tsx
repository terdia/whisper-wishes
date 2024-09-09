import React from 'react';
import { motion } from 'framer-motion';
import { X, User, Calendar, ThumbsUp, Droplet } from 'lucide-react';

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
}

interface WishModalProps {
  wish: Wish | null;
  onClose: () => void;
  onWater: (wishId: string) => void;
}

const WishModal: React.FC<WishModalProps> = ({ wish, onClose, onWater }) => {
  if (!wish) {
    return null;
  }

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
          <Droplet className="mr-2" size={20} />
          Water this Wish
        </button>
      </motion.div>
    </motion.div>
  );
};

export default WishModal;
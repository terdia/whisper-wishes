import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Wind, ChevronDown, X, Check } from 'lucide-react';
import { Wish } from '../components/amplify/types';

interface WishCardProps {
  wish: Wish;
  isAmplified: boolean;
  onEdit: (updatedWish: Wish) => void;
  onDelete: () => void;
  onAmplify: () => void;
  onProgressChange: (progress: number) => void;
  viewMode: 'grid' | 'list';
}

const WishCard: React.FC<WishCardProps> = ({ 
  wish, 
  isAmplified, 
  onEdit, 
  onDelete, 
  onAmplify, 
  onProgressChange,
  viewMode
}) => {
  const [localProgress, setLocalProgress] = useState(wish.progress);
  const [isEditing, setIsEditing] = useState(false);
  const [editedWish, setEditedWish] = useState(wish);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setEditedWish(wish);
    setLocalProgress(wish.progress);
  }, [wish]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setLocalProgress(newProgress);
    onProgressChange(newProgress);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedWish(wish);
  };

  const handleSaveEdit = () => {
    onEdit(editedWish);
    setIsEditing(false);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const shouldShowReadMore = wish.wish_text.length > 100;

  return (
    <>
      <motion.div
        layout
        className={`p-6 rounded-lg shadow-lg ${
          wish.is_private ? 'bg-purple-50' : 'bg-blue-50'
        } relative overflow-hidden border ${
          wish.is_private ? 'border-purple-200' : 'border-blue-200'
        } ${viewMode === 'grid' ? 'h-[24rem]' : 'min-h-[16rem]'} flex flex-col`}
      >
        {isEditing ? (
          <div className="flex flex-col h-full space-y-4">
            <textarea
              value={editedWish.wish_text}
              onChange={(e) => setEditedWish({...editedWish, wish_text: e.target.value})}
              className="w-full p-2 border rounded text-gray-800 focus:ring-2 focus:ring-blue-500 flex-grow"
            />
            <select
              value={editedWish.category}
              onChange={(e) => setEditedWish({...editedWish, category: e.target.value})}
              className="w-full p-2 border rounded text-gray-800 focus:ring-2 focus:ring-blue-500"
            >
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
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editedWish.is_private}
                onChange={(e) => setEditedWish({...editedWish, is_private: e.target.checked})}
                className="mr-2 form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-gray-800">Private</span>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={handleCancelEdit} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm">
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                wish.is_private ? 'bg-purple-200 text-purple-800' : 'bg-blue-200 text-blue-800'
              }`}>
                {wish.is_private ? 'Private' : 'Public'}
              </span>
              <div className="flex space-x-2">
                <button onClick={handleEdit} className="text-gray-400 hover:text-blue-500 transition-colors duration-200">
                  <Edit2 size={16} />
                </button>
                <button onClick={onDelete} className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* First Divider */}
            <hr className="border-t border-gray-200 my-3" />

            {/* Wish Text Section */}
            <div className="mb-4 flex-grow overflow-hidden">
              <div className="text-sm font-semibold text-gray-800 pr-2 line-clamp-3">
                {truncateText(wish.wish_text, 150)}
              </div>
              {shouldShowReadMore && (
                <button
                  onClick={() => setShowModal(true)}
                  className="text-blue-500 hover:underline mt-0 flex items-center text-xs"
                >
                  <ChevronDown size={12} className="mr-1" /> Read More
                </button>
              )}
            </div>

            {/* Progress Section */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-blue-600">{localProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${localProgress}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={localProgress}
                onChange={handleProgressChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Amplify Section */}
            <div className="mb-4">
              {isAmplified ? (
                <p className="text-sm text-purple-600 font-semibold">✨ Amplified</p>
              ) : (
                <button
                  onClick={onAmplify}
                  className="w-full px-4 py-2 rounded-full text-white bg-purple-500 hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center text-sm"
                >
                  <Wind className="mr-2" size={16} />
                  Amplify Wish
                </button>
              )}
            </div>

            {/* Second Divider */}
            <hr className="border-t border-gray-200 my-3" />

            {/* Footer Section */}
            <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
              <div>
                <span className="mr-1">📅</span>
                {new Date(wish.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="mr-1">🏷️</span>
                {wish.category}
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Modal for full text */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-6 rounded-lg max-w-lg w-full m-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">{wish.category}</h3>
              <p className="text-gray-700 mb-4">{wish.wish_text}</p>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WishCard;
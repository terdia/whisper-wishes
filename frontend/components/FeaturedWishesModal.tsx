import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AmplifiedWishes from './AmplifiedWishes';

interface FeaturedWishesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSupportWish: (wishId: string) => void;
}

const FeaturedWishesModal: React.FC<FeaturedWishesModalProps> = ({ isOpen, onClose, onSupportWish }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Featured Wishes</h2>
            <AmplifiedWishes onSupportWish={onSupportWish} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeaturedWishesModal;
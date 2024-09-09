import React from 'react';
import { motion } from 'framer-motion';
import { Droplet } from 'lucide-react';

interface Wish {
  id: string;
  wish_text: string;
  category: string;
  support_count: number;
}

interface ListViewProps {
  wishes: Wish[];
  onWishClick: (wish: Wish) => void;
  onWaterWish: (wishId: string) => void;
  categoryColors: { [key: string]: string };
  currentPage: number;
  wishesPerPage: number;
}

const ListView: React.FC<ListViewProps> = ({
  wishes,
  onWishClick,
  onWaterWish,
  categoryColors,
  currentPage,
  wishesPerPage
}) => {
  const startIndex = (currentPage - 1) * wishesPerPage;
  const visibleWishes = wishes.slice(startIndex, startIndex + wishesPerPage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {visibleWishes.map((wish) => (
        <motion.div
          key={wish.id}
          layoutId={`wish-${wish.id}`}
          className="bg-white rounded-lg shadow-md overflow-hidden"
          whileHover={{ scale: 1.02, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
        >
          <div className="flex items-center p-4">
            <div 
              className="w-2 h-12 mr-4 rounded-full" 
              style={{ backgroundColor: categoryColors[wish.category] }}
            />
            <div className="flex-grow">
              <h3 className="font-semibold mb-1 text-gray-800">{wish.wish_text}</h3>
              <p className="text-sm text-gray-600">Category: {wish.category}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Waters: {wish.support_count}</span>
              <button
                onClick={() => onWaterWish(wish.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600 transition-colors flex items-center"
              >
                <Droplet size={14} className="mr-1" />
                Water
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ListView;
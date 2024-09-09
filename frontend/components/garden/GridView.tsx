import React from 'react';
import { motion } from 'framer-motion';
import { Droplet } from 'lucide-react';

interface Wish {
  id: string;
  wish_text: string;
  category: string;
  support_count: number;
}

interface GridViewProps {
  wishes: Wish[];
  onWishClick: (wish: Wish) => void;
  onWaterWish: (wishId: string) => void;
  categoryColors: { [key: string]: string };
  currentPage: number;
  wishesPerPage: number;
}

const GridView: React.FC<GridViewProps> = ({
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
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {visibleWishes.map((wish) => (
        <motion.div
          key={wish.id}
          layoutId={`wish-${wish.id}`}
          className="bg-white rounded-lg shadow-md overflow-hidden"
          whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
        >
          <div 
            className="h-2" 
            style={{ backgroundColor: categoryColors[wish.category] }}
          />
          <div className="p-4">
            <h3 className="font-semibold mb-2 text-gray-800 line-clamp-2">{wish.wish_text}</h3>
            <p className="text-sm text-gray-600 mb-2">Category: {wish.category}</p>
            <div className="flex justify-between items-center">
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

export default GridView;
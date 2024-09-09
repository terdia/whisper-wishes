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
  hasMore: boolean;
  loadMore: () => void;
}

const GridView: React.FC<GridViewProps> = ({
  wishes,
  onWishClick,
  onWaterWish,
  categoryColors,
  hasMore,
  loadMore
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {wishes.map((wish) => (
        <motion.div
          key={wish.id}
          layoutId={`wish-${wish.id}`}
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
          onClick={() => onWishClick(wish)}
        >
          <div 
            className="h-2" 
            style={{ backgroundColor: categoryColors[wish.category] }}
          />
          <div className="p-4">
            <h3 className="font-semibold mb-2 text-gray-800 line-clamp-2" title={wish.wish_text}>{wish.wish_text}</h3>
            <p className="text-sm text-gray-600 mb-2">Category: {wish.category}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Waters: {wish.support_count}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWaterWish(wish.id);
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600 transition-colors flex items-center"
                title="Water this wish"
              >
                <Droplet size={14} className="mr-1" />
                Water
              </button>
            </div>
          </div>
        </motion.div>
      ))}
      {hasMore && (
        <button
          onClick={loadMore}
          className="col-span-full mt-4 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
        >
          Load More Wishes
        </button>
      )}
    </div>
  );
};

export default GridView;
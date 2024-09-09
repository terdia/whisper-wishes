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
  hasMore: boolean;
  loadMore: () => void;
}

const ListView: React.FC<ListViewProps> = ({
  wishes,
  onWishClick,
  onWaterWish,
  categoryColors,
  hasMore,
  loadMore
}) => {
  return (
    <div className="space-y-4 p-4">
      {wishes.map((wish) => (
        <motion.div
          key={wish.id}
          layoutId={`wish-${wish.id}`}
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.02, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
          onClick={() => onWishClick(wish)}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center p-4">
            <div 
              className="w-full sm:w-2 h-2 sm:h-12 mb-2 sm:mb-0 sm:mr-4 rounded-full" 
              style={{ backgroundColor: categoryColors[wish.category] }}
            />
            <div className="flex-grow mb-2 sm:mb-0">
              <h3 className="font-semibold text-gray-800 truncate" title={wish.wish_text}>{wish.wish_text}</h3>
              <p className="text-sm text-gray-600">Category: {wish.category}</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
              <span className="text-sm text-gray-500 mr-2">Waters: {wish.support_count}</span>
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
          className="w-full mt-4 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
        >
          Load More Wishes
        </button>
      )}
    </div>
  );
};

export default ListView;
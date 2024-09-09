import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, PanInfo } from 'framer-motion';
import { ZoomIn, ZoomOut, Wind, Droplet } from 'lucide-react';

interface Wish {
  id: string;
  wish_text: string;
  category: string;
  support_count: number;
  x: number;
  y: number;
  z: number;
}

interface DandelionViewProps {
  wishes: Wish[];
  isLoading: boolean;
  onWishClick: (wish: Wish) => void;
  onWaterWish: (wishId: string) => void;
  categoryColors: { [key: string]: string };
  hasMore: boolean;
  loadMore: () => void;
}

const DandelionView: React.FC<DandelionViewProps> = ({
  wishes,
  isLoading,
  onWishClick,
  onWaterWish,
  categoryColors,
  hasMore,
  loadMore,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ scale, x: position.x, y: position.y });
  }, [scale, position, controls]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setPosition(prev => ({
      x: prev.x + info.delta.x / scale,
      y: prev.y + info.delta.y / scale,
    }));
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-blue-400 to-green-400">
    <motion.div
      ref={containerRef}
      className="absolute inset-0"
      animate={controls}
      drag
      dragConstraints={containerRef}
      onPan={handlePan}
      style={{ touchAction: 'none' }}
    >
      {wishes.map((wish) => (
        <WishSeed
          key={wish.id}
          wish={wish}
          onClick={() => onWishClick(wish)}
          onWater={onWaterWish}
          categoryColor={categoryColors[wish.category]}
          scale={scale}
        />
      ))}
    </motion.div>

      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={handleZoomIn}
          className="bg-white p-2 rounded-full shadow-lg"
        >
          <ZoomIn size={24} className="text-green-600" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white p-2 rounded-full shadow-lg"
        >
          <ZoomOut size={24} className="text-green-600" />
        </button>
      </div>

      {isLoading && <LoadingIndicator />}

      {hasMore && !isLoading && (
        <button
          onClick={loadMore}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-green-600 px-4 py-2 rounded-full shadow-lg"
        >
          Load More Wishes
        </button>
      )}
    </div>
  );
};

const WishSeed: React.FC<{
  wish: Wish;
  onClick: () => void;
  onWater: (wishId: string) => void;
  categoryColor: string;
  scale: number;
}> = ({ wish, onClick, onWater, categoryColor, scale }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${wish.x * 100}%`,
        top: `${wish.y * 100}%`,
        zIndex: isHovered ? 10 : 1,
      }}
      whileHover={{ scale: 1.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      <svg width={40 / scale} height={40 / scale} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill={categoryColor} />
        <motion.g
          animate={{
            rotate: [0, 10, -10, 0],
            transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.path
              key={i}
              d={`M20,20 L${20 + 18 * Math.cos(i * Math.PI / 4)},${20 + 18 * Math.sin(i * Math.PI / 4)}`}
              stroke="white"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.1 }}
            />
          ))}
        </motion.g>
      </svg>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-1/2 bottom-full mb-2 w-48 bg-white rounded-lg p-2 shadow-xl"
            style={{ transform: 'translateX(-50%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-gray-800 mb-1 truncate">{wish.wish_text}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Waters: {wish.support_count}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWater(wish.id);
                }}
                className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full hover:bg-blue-600 transition-colors flex items-center"
              >
                <Droplet size={12} className="mr-1" />
                Water
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LoadingIndicator: React.FC = () => (
  <div className="absolute bottom-4 left-4 bg-white bg-opacity-70 p-2 rounded-full flex items-center">
    <Wind className="animate-spin text-green-600 mr-2" size={20} />
    <span className="text-sm font-medium">Loading wishes...</span>
  </div>
);

export default DandelionView;
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Wind, Droplet } from 'lucide-react';

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
}

const DandelionView: React.FC<DandelionViewProps> = ({
  wishes,
  isLoading,
  onWishClick,
  onWaterWish,
  categoryColors,
}) => {
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleWishClick = (wish: Wish) => {
    setSelectedWish(wish);
    onWishClick(wish);
  };

  const handleWaterWish = (wishId: string) => {
    onWaterWish(wishId);
    setSelectedWish(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-200px)] overflow-hidden bg-gradient-to-b from-blue-400 to-green-400"
    >
      {wishes.map((wish) => (
        <WishSeed
          key={wish.id}
          wish={wish}
          onClick={handleWishClick}
          categoryColor={categoryColors[wish.category]}
          containerDimensions={dimensions}
        />
      ))}

      <AnimatePresence>
        {selectedWish && (
          <WishModal
            wish={selectedWish}
            onClose={() => setSelectedWish(null)}
            onWater={handleWaterWish}
            categoryColor={categoryColors[selectedWish.category]}
          />
        )}
      </AnimatePresence>

      <Fireflies count={20} />

      {isLoading && <LoadingIndicator />}
    </div>
  );
};

const WishSeed: React.FC<{
  wish: Wish;
  onClick: (wish: Wish) => void;
  categoryColor: string;
  containerDimensions: { width: number; height: number };
}> = ({ wish, onClick, categoryColor, containerDimensions }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      x: wish.x * containerDimensions.width,
      y: wish.y * containerDimensions.height,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
        mass: 0.5,
      },
    });
  }, [wish, containerDimensions, controls]);

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: 0, top: 0 }}
      animate={controls}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      onClick={() => onClick(wish)}
    >
      <svg width="40" height="40" viewBox="0 0 40 40">
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
    </motion.div>
  );
};

const WishModal: React.FC<{
  wish: Wish;
  onClose: () => void;
  onWater: (wishId: string) => void;
  categoryColor: string;
}> = ({ wish, onClose, onWater, categoryColor }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-2" style={{ color: categoryColor }}>
          {wish.category}
        </h3>
        <p className="text-gray-700 mb-4">{wish.wish_text}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Waters: {wish.support_count}</span>
          <button
            onClick={() => onWater(wish.id)}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors flex items-center"
          >
            <Droplet size={18} className="mr-2" />
            Water this wish
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Fireflies: React.FC<{ count: number }> = ({ count }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-yellow-300 opacity-75"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            width: '4px',
            height: '4px',
          }}
        />
      ))}
    </>
  );
};

const LoadingIndicator: React.FC = () => (
  <div className="absolute bottom-4 left-4 bg-white bg-opacity-70 p-2 rounded-full flex items-center">
    <Wind className="animate-spin text-green-600 mr-2" size={20} />
    <span className="text-sm font-medium">Loading wishes...</span>
  </div>
);

export default DandelionView;
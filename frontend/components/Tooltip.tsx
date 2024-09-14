import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-40 p-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-90 tooltip dark:bg-gray-700 bottom-full left-1/2 transform -translate-x-1/2 mb-2 max-w-xs w-max">
          <div className="whitespace-normal break-words">{content}</div>
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
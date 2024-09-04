import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false }) => {
  const spinnerClasses = fullScreen
    ? "flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-500"
    : "flex items-center justify-center p-4";

  return (
    <div className={spinnerClasses}>
      <Loader2 className="w-12 h-12 text-white animate-spin" />
    </div>
  );
};

export default LoadingSpinner;

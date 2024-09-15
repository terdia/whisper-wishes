import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className = '' }) => {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'back_button_click', {
        event_category: 'Navigation',
        event_label: 'Back Button',
      })
    }
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 ${className}`}
    >
      <ArrowLeft size={20} className="mr-2" />
      Back
    </button>
  );
};

export default BackButton;

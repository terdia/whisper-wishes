import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Briefcase, HandHeart } from 'lucide-react';
import { AmplificationManager } from '../components/amplify/AmplificationManager';
import { useAuth } from '../contexts/AuthContext';
import { Wish } from '../components/amplify/types';
import Tooltip from './Tooltip';

interface AmplificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishId: string;
  isPrivate: boolean;
  onAmplificationComplete: (updatedWish: Wish) => void;
  onAmplificationError: (error: string) => void;
}

const AmplificationModal: React.FC<AmplificationModalProps> = ({ 
  isOpen, 
  onClose, 
  wishId, 
  isPrivate,
  onAmplificationComplete,
  onAmplificationError,
}) => {
  const [objective, setObjective] = useState<'support' | 'help' | 'mentorship'>('support');
  const [context, setContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, userSubscription, fetchUserSubscription } = useAuth();

  useEffect(() => {
    if (isOpen && user && !userSubscription) {
      fetchUserSubscription(user.id);
    }
  }, [isOpen, user, userSubscription, fetchUserSubscription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userSubscription) {
        onAmplificationError('User authentication or subscription data is missing. Please try again.');
      return;
    }
  
    setIsSubmitting(true);
    try {
      const amplifiedWish = await AmplificationManager.amplifyWish(wishId, user.id, userSubscription, objective, context);
      if (amplifiedWish) {
        onAmplificationComplete(amplifiedWish);
        onClose();
      } else {
        onAmplificationError('Failed to amplify wish'); 
      }
    } catch (error) {
      console.info('Error amplifying wish:', error);
      if (error instanceof Error) {
        onAmplificationError(error.message);
      } else {
        onAmplificationError('Failed to amplify wish');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
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
        className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Amplify Your Wish</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X size={24} />
            </button>
          </div>
          <p className="text-sm">
            Amplifying your wish increases its visibility and potential for support. 
            Choose how you'd like the community to engage with your wish.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amplification Objective
            </label>

            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'support', icon: Users, label: 'Seek Support', color: 'bg-blue-100 text-blue-600' },
                { value: 'help', icon: HandHeart, label: 'Request Help', color: 'bg-green-100 text-green-600' },
                { value: 'mentorship', icon: Briefcase, label: 'Find Mentorship', color: 'bg-purple-100 text-purple-600' },
              ].map((option) => (
                <Tooltip key={option.value} content={getTooltipContent(option.value)}>
                  <button
                    type="button"
                    onClick={() => setObjective(option.value as typeof objective)}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center ${
                      objective === option.value ? `${option.color} ring-2 ring-offset-2 ring-${option.color.split('-')[1]}-400` : 'bg-gray-100'
                    }`}
                  >
                    <option.icon size={24} className={objective === option.value ? '' : 'text-gray-500'} />
                    <span className="mt-2 text-xs font-medium">{option.label}</span>
                  </button>
                </Tooltip>
              ))}
            </div>

          </div>

          {objective !== 'support' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 text-gray-900 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="Provide more details about your request..."
                required
              ></textarea>
            </div>
          )}

          {isPrivate && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Amplifying this wish will make it public and visible to others in the Global Wish Garden.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
            }`}
          >
            {isSubmitting ? 'Amplifying...' : 'Amplify Wish'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const getTooltipContent = (objective: string) => {
  switch (objective) {
    case 'support':
      return "Seek emotional support and encouragement from the community.";
    case 'help':
      return "Request practical assistance or resources to achieve your wish.";
    case 'mentorship':
      return "Find guidance and expertise from experienced individuals.";
    default:
      return "";
  }
};

export default AmplificationModal;
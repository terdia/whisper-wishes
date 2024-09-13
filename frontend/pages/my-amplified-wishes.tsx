import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AmplificationManager } from '../components/amplify/AmplificationManager';
import Link from 'next/link';
import { Amplification } from '../components/amplify/types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Megaphone, ChevronRight, Users, HelpCircle, Briefcase, Clock, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const MyAmplifiedWishes: React.FC = () => {
  const { user } = useAuth();
  const [amplifiedWishes, setAmplifiedWishes] = useState<Amplification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAmplifiedWishes();
    }
  }, [user]);

  const fetchAmplifiedWishes = async () => {
    try {
      const result = await AmplificationManager.getAmplifiedWishes(user!.id);
      setAmplifiedWishes(result.amplifiedWishes);
    } catch (error) {
      console.error('Error fetching amplified wishes:', error);
      toast.error('Failed to load amplified wishes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAmplification = async (amplificationId: string) => {
    try {
      await AmplificationManager.removeAmplification(amplificationId);
      setAmplifiedWishes(amplifiedWishes.filter(aw => aw.id !== amplificationId));
      toast.success('Amplification removed successfully');
    } catch (error) {
      console.error('Error removing amplification:', error);
      toast.error('Failed to remove amplification');
    }
  };

  const getObjectiveIcon = (objective: string) => {
    switch (objective) {
      case 'support':
        return <Users className="text-blue-500" size={20} />;
      case 'help':
        return <HelpCircle className="text-green-500" size={20} />;
      case 'mentorship':
        return <Briefcase className="text-purple-500" size={20} />;
      default:
        return <Megaphone className="text-gray-500" size={20} />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (amplifiedWishes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">My Amplified Wishes</h1>
        <p className="mb-4">You haven't amplified any wishes yet.</p>
        <p className="mb-6">Amplifying your wishes can help you get more support and increase their visibility.</p>
        <Link href="/my-wishes">
          <a className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors duration-200">
            Go to My Wishes
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-3xl font-bold mb-6">My Amplified Wishes</h1>
      <div className="space-y-6">
        {amplifiedWishes.map((amplification) => (
          <motion.div
            key={amplification.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{amplification.wishes.wish_text}</h2>
                <div className="flex items-center">
                  {getObjectiveIcon(amplification.objective)}
                  <span className="ml-2 text-sm font-medium">
                    {amplification.objective.charAt(0).toUpperCase() + amplification.objective.slice(1)}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Category: {amplification.wishes.category}</p>
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${amplification.wishes.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Progress: {amplification.wishes.progress}%</p>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  Amplified on: {new Date(amplification.amplified_at).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  Expires on: {new Date(amplification.expires_at).toLocaleDateString()}
                </span>
              </div>
              {amplification.context && (
                <p className="text-sm text-gray-600 mb-4 bg-gray-100 p-3 rounded">
                  Context: {amplification.context}
                </p>
              )}
              <div className="flex justify-between items-center">
                <Link href={`/amplified-wish/${amplification.wish_id}`}>
                  <a className="flex items-center text-purple-600 hover:text-purple-800">
                    View Details
                    <ChevronRight size={20} />
                  </a>
                </Link>
                <button
                  onClick={() => handleRemoveAmplification(amplification.id)}
                  className="flex items-center text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} className="mr-1" />
                  Remove Amplification
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyAmplifiedWishes;
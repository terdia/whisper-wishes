import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AmplificationManager } from '../components/amplify/AmplificationManager';
import Link from 'next/link';
import { AmplifiedWish } from '../components/amplify/types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Megaphone, ChevronRight, Users, HelpCircle, Briefcase, Clock, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import UnauthenticatedUserPrompt from '../components/UnauthenticatedUserPrompt';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      title:"My Amplified Wishes",
      description:"View and manage your amplified wishes on Dandy Wishes. Track progress and engage with the community supporting your dreams.",
      canonical: `https://www.dandywishes.app/my-amplified-wishes`
    },
  };
};

// Modal component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-md w-full"
        >
          <div className="flex justify-end">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const MyAmplifiedWishes: React.FC = () => {
  const { user } = useAuth();
  const [amplifiedWishes, setAmplifiedWishes] = useState<AmplifiedWish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [amplificationToDelete, setAmplificationToDelete] = useState<string | null>(null);

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

  const openDeleteModal = (amplificationId: string) => {
    setAmplificationToDelete(amplificationId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setAmplificationToDelete(null);
  };

  const confirmDelete = async () => {
    if (amplificationToDelete) {
      await handleRemoveAmplification(amplificationToDelete);
      closeDeleteModal();
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

  if (!user) {
    return (
      <>
        <UnauthenticatedUserPrompt />
      </>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (amplifiedWishes.length === 0) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
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
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                <h2 className="text-base sm:text-lg font-semibold flex-grow pr-2 break-words">
                  {amplification.wishes.wish_text}
                </h2>
                <div className="flex items-center whitespace-nowrap mt-2 sm:mt-0">
                  {getObjectiveIcon(amplification.objective)}
                  <span className="ml-2 text-xs sm:text-sm font-medium">
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
                  onClick={() => openDeleteModal(amplification.id)}
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

      <Modal isOpen={deleteModalOpen} onClose={closeDeleteModal}>
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p className="mb-6">Are you sure you want to remove this amplification?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={closeDeleteModal}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
          >
            Confirm
          </button>
        </div>
      </Modal>
    </div>
    </>
  );
};

export default MyAmplifiedWishes;
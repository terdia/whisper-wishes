import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import withAuth from '../components/withAuth';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Camera, Edit2, Award, Lock } from 'lucide-react';
import { debounce } from 'lodash';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Profile = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState({
    username: '',
    bio: '',
    avatar_url: '',
    isPublic: false
  });
  const [stats, setStats] = useState({
    totalWishes: 0,
    wishesShared: 0,
    wishesSupported: 0
  });
  const [activityData, setActivityData] = useState({ labels: [], datasets: [] });
  const [achievements, setAchievements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [dataFetched, setDataFetched] = useState(false);

  let avatarUrl = userProfile?.avatar_url;
  if (userProfile?.avatar_url) {
    const fixedUrl = userProfile.avatar_url.replace(
      /^(https:\/\/.*?\/storage\/v1\/object\/public\/avatars\/).*?(https:\/\/.*?\/storage\/v1\/object\/public\/avatars\/)/,
      '$1'
    );
    avatarUrl = fixedUrl;
  } else {
    avatarUrl = null;
  }

  const fetchUserData = useCallback(async () => {
    if (!user || dataFetched) return;

    try {
      const { data, error } = await supabase.rpc('get_user_profile_data', { p_user_id: user.id });
      if (error) throw error;

      // Set stats
      setStats({
        totalWishes: data.stats.total_wishes_made,
        wishesShared: data.stats.wishes_shared,
        wishesSupported: data.stats.wishes_supported
      });

      // Set activity data if it's not null
      setActivityData(processActivityData(data.activity));

      // Process and set achievements
      const processedAchievements = data.achievements.map(achievement => {
        const userAchievement = data.user_achievements.find(ua => ua.achievement_id === achievement.id);
        return {
          ...achievement,
          earned: !!userAchievement,
          earned_at: userAchievement ? userAchievement.earned_at : null
        };
      });
      setAchievements(processedAchievements);

      setDataFetched(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setModalMessage('Failed to fetch user data. Please try again.');
      setShowModal(true);
    }
  }, [user, dataFetched]);

  const debouncedFetchUserData = useCallback(
    debounce(() => {
      fetchUserData();
    }, 300),
    [fetchUserData]
  );

  useEffect(() => {
    if (user && !dataFetched) {
      debouncedFetchUserData();
    }
  }, [user, debouncedFetchUserData, dataFetched]);

  useEffect(() => {
    if (user && userProfile) {
      setLocalProfile({
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        avatar_url: avatarUrl,
        isPublic: userProfile.is_public || false
      });
    }
  }, [user, userProfile, avatarUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ username: localProfile.username, bio: localProfile.bio, avatar_url: localProfile.avatarUrl, is_public: localProfile.isPublic });
      setModalMessage('Profile updated successfully!');
      setShowModal(true);
      setIsEditing(false); // Exit edit mode after successful update
    } catch (error) {
      console.error('Error updating profile:', error);
      setModalMessage('Failed to update profile. Please try again.');
      setShowModal(true);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      setLocalProfile(prevProfile => ({ ...prevProfile, avatarUrl: publicUrlData.publicUrl }));
      await updateProfile({ avatar_url: publicUrlData.publicUrl });
      setModalMessage('Avatar updated successfully!');
      setShowModal(true);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setModalMessage('Failed to update avatar. Please try again.');
      setShowModal(true);
    }
  }

  const Modal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold mb-4">{message}</h3>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );

  // Helper functions to process the data
  const processActivityData = (activityData) => {

    if (!activityData || activityData.length === 0) {
      // Return empty data structure if activityData is null or empty
      return {
        labels: [],
        datasets: [
          {
            label: 'Wishes Created',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Wishes Shared',
            data: [],
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          },
          {
            label: 'Wishes Supported',
            data: [],
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
          }
        ]
      };
    }

    const groupedData = activityData.reduce((acc, item) => {
      const date = new Date(item.created_at).toLocaleDateString()
      if (!acc[date]) acc[date] = { create: 0, share: 0, support: 0 }
      acc[date][item.action_type]++
      return acc
    }, {})

    const labels = Object.keys(groupedData)
    const createData = labels.map(date => groupedData[date].create)
    const shareData = labels.map(date => groupedData[date].share)
    const supportData = labels.map(date => groupedData[date].support)

    return {
      labels,
      datasets: [
        {
          label: 'Wishes Created',
          data: createData,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Wishes Shared',
          data: shareData,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
        {
          label: 'Wishes Supported',
          data: supportData,
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1
        }
      ]
    }
  };

  const AchievementCard = ({ achievement }) => (
    <div 
      className={`relative overflow-hidden bg-white rounded-lg shadow-md transition-all duration-300 ${
        achievement.earned ? 'border-2 border-indigo-500 transform hover:scale-105' : 'border border-gray-200 opacity-60 hover:opacity-80'
      }`}
    >
      <div className="p-6">
        <div className="flex items-center justify-center mb-4">
          {achievement.earned ? (
            <Award className="text-indigo-500" size={48} />
          ) : (
            <Lock className="text-gray-400" size={48} />
          )}
        </div>
        <h3 className="text-xl font-semibold text-center mb-2 text-gray-800">{achievement.name}</h3>
        <p className="text-gray-600 text-center text-sm">{achievement.description}</p>
        {achievement.earned && (
          <p className="text-indigo-500 text-center text-xs mt-4 font-semibold">
            Earned on {new Date(achievement.earned_at).toLocaleDateString()}
          </p>
        )}
      </div>
      {achievement.earned && (
        <div className="absolute top-0 right-0 bg-indigo-500 text-white px-2 py-1 text-xs font-bold rounded-bl">
          Earned
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-gray-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-indigo-800">
            {localProfile.username ? `${localProfile.username}'s Wishboard` : 'Your Wishboard'}
            </h1>
            <p className="text-lg text-gray-600 mt-1">
            {localProfile.username 
                ? `Welcome back, ${localProfile.username}! Ready to make some wishes?`
                : "Welcome to your personal space for wishes and dreams"}
            </p>
        </div>
        <button
            onClick={() => setIsEditing(!isEditing)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 shadow-md"
        >
            <Edit2 className="mr-2" size={18} />
            {isEditing ? 'Cancel' : 'Edit Wishboard'}
        </button>
    </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
        <div className="flex-grow mb-6 md:mb-0">
        <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              value={localProfile.username}
              onChange={(e) => setLocalProfile(prevProfile => ({ ...prevProfile, username: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              id="bio"
              value={localProfile.bio}
              onChange={(e) => setLocalProfile(prevProfile => ({ ...prevProfile, bio: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              rows={3}
            ></textarea>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={localProfile.isPublic}
              onChange={(e) => setLocalProfile(prevProfile => ({ ...prevProfile, isPublic: e.target.checked }))}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">Make profile public</label>
          </div>
          <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Update Profile
          </button>
        </form>
      ) : (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Username</dt>
                <dd className="mt-1 text-sm text-gray-900">{localProfile.username}</dd>
            </div>
            <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Profile Visibility</dt>
                <dd className="mt-1 text-sm text-gray-900">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    localProfile.isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {localProfile.isPublic ? 'Public' : 'Private'}
                </span>
                </dd>
            </div>
                <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Bio</dt>
                    <dd className="mt-1 text-sm text-gray-900">{localProfile.bio || 'No bio provided'}</dd>
                </div>
            </dl>
          )}
        </div>
        <div className="flex-shrink-0 flex justify-center">
          <div className="relative">
            <img 
              src={localProfile.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'}
              alt="Profile" 
              className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://www.gravatar.com/avatar/?d=mp';
              }}
            />
            {isEditing && (
              <label htmlFor="avatar" className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer">
                <Camera className="text-white" size={20} />
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Wish Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow-md">
            <p className="text-4xl font-bold">{stats.totalWishes}</p>
            <p className="text-lg">Total Wishes</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-lg shadow-md">
            <p className="text-4xl font-bold">{stats.wishesShared}</p>
            <p className="text-lg">Wishes Shared</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-lg shadow-md">
            <p className="text-4xl font-bold">{stats.wishesSupported}</p>
            <p className="text-lg">Wishes Supported</p>
          </div>
        </div>
      </div>
     
      <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Your Achievements</h2>
        <div className="mb-4">
          <p className="text-gray-600">
            You've earned {achievements.filter(a => a.earned).length} out of {achievements.length} achievements. Keep going!
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Wish Activity Over Time</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Line data={activityData} options={{
            responsive: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Date'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Number of Wishes'
                },
                beginAtZero: true
              }
            }
          }} />
        </div>
      </div>

      {showModal && <Modal message={modalMessage} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default withAuth(Profile);
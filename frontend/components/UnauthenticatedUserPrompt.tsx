import React from 'react';
import Link from 'next/link';
import { Star, Users, Target, TrendingUp } from 'lucide-react';

const UnauthenticatedUserPrompt = () => {
  return (
    <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 sm:p-8 md:p-12 rounded-lg shadow-lg max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8 text-purple-800 text-center">Unlock the Magic of Wishes!</h2>
      <p className="text-lg sm:text-xl mb-8 md:mb-12 text-gray-700 text-center max-w-2xl mx-auto">
        Join our community to access your personal wish list, participate in the global garden, and experience a world of possibilities.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12 max-w-3xl mx-auto">
        <FeatureItem icon={<Star className="w-8 h-8 text-yellow-500" />} text="Save and manage wishes" />
        <FeatureItem icon={<Users className="w-8 h-8 text-green-500" />} text="Join the global wish garden" />
        <FeatureItem icon={<Target className="w-8 h-8 text-red-500" />} text="Support and gain support" />
        <FeatureItem icon={<TrendingUp className="w-8 h-8 text-blue-500" />} text="Track your progress" />
      </div>
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
        <ActionButton href="/signup" bgColor="bg-purple-600" hoverColor="hover:bg-purple-700">
          Sign Up
        </ActionButton>
        <ActionButton href="/login" bgColor="bg-blue-500" hoverColor="hover:bg-blue-600">
          Log In
        </ActionButton>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, text }) => (
  <div className="flex items-center space-x-4 bg-white bg-opacity-50 p-4 rounded-lg">
    <div className="flex-shrink-0">{icon}</div>
    <span className="text-gray-700 text-lg">{text}</span>
  </div>
);

const ActionButton = ({ href, bgColor, hoverColor, children }) => (
  <Link href={href}>
    <a className={`${bgColor} ${hoverColor} text-white px-8 py-4 rounded-full font-semibold text-xl text-center transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 w-full sm:w-auto`}>
      {children}
    </a>
  </Link>
);

export default UnauthenticatedUserPrompt;
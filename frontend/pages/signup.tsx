import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, name);
      // Redirect to a "Check your email" page
      router.push('/check-email');
    } catch (error) {
      console.error('Error signing up:', error);
      
      let errorMessage = 'An unexpected error occurred during sign up. Please try again.';
  
      if (error instanceof Error) {
        switch(error.message) {
          case 'Email already in use':
            errorMessage = 'This email is already registered. Please use a different email or try logging in.';
            break;
          case 'Failed to create user profile':
            errorMessage = 'There was an issue creating your profile. Please try again.';
            break;
          case 'Failed to create user stats':
            errorMessage = 'There was an issue setting up your account stats. Please try again.';
            break;
          case 'Failed to create user onboarding':
            errorMessage = 'There was an issue setting up your account. Please try again.';
            break;
          case 'User creation failed':
            errorMessage = 'Failed to create user. Please try again.';
            break;
          default:
            if (error.message.includes('password')) {
              errorMessage = 'Password should be at least 6 characters long.';
            } else if (error.message.includes('email')) {
              errorMessage = 'Please enter a valid email address.';
            }
        }
      }
  
      setError(errorMessage);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-800">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="pl-10 w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="agreeTerms"
            required
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
            I agree to the {' '}
            <Link href="/terms-of-service">
              <a className="text-purple-600 hover:underline">Terms of Service</a>
            </Link>
            {' '} and {' '}
            <Link href="/privacy-policy">
              <a className="text-purple-600 hover:underline">Privacy Policy</a>
            </Link>
          </label>
        </div>
        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login">
          <a className="font-medium text-purple-600 hover:text-purple-500">Log in</a>
        </Link>
      </p>

      {/* Error Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Error</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {error}
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
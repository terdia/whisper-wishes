import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    if (router.pathname !== path) {
      router.push(path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/">
                <a className="flex-shrink-0 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 50" className="h-8 w-auto">
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    
                    <g transform="translate(5, 7) scale(0.37)">
                      <ellipse cx="50" cy="70" rx="8" ry="25" fill="url(#grad)" />
                      <g stroke="url(#grad)" strokeWidth="2" fill="none">
                        <path d="M50 45 Q 60 35, 70 40" />
                        <path d="M50 45 Q 65 30, 80 35" />
                        <path d="M50 45 Q 70 25, 85 30" />
                        <path d="M50 45 Q 40 35, 30 40" />
                        <path d="M50 45 Q 35 30, 20 35" />
                        <path d="M50 45 Q 30 25, 15 30" />
                      </g>
                    </g>
                    
                    <text x="42" y="33" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="url(#grad)">Whisper Wishes</text>
                  </svg>
                </a>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a onClick={() => handleNavigation('/create-wish')} className="cursor-pointer border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Create Wish
                </a>
                <a onClick={() => handleNavigation('/my-wishes')} className="cursor-pointer border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  My Wishes
                </a>
                <a onClick={() => handleNavigation('/global-garden')} className="cursor-pointer border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Global Garden
                </a>
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <button onClick={signOut} className="text-gray-500 hover:text-gray-700">
                  Logout
                </button>
              ) : (
                <>
                  <a onClick={() => handleNavigation('/login')} className="cursor-pointer text-gray-500 hover:text-gray-700 mr-4">
                    Login
                  </a>
                  <a onClick={() => handleNavigation('/signup')} className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, ChevronDown, Loader2, Bell } from 'lucide-react';
import { User } from '@supabase/supabase-js'
import NotificationCenter from './NotificationCenter';
import { usePageTracking } from '../hooks/usePageTracking'

interface UserProfile {
    id: string;
    username?: string;
    bio?: string;
    avatar_url?: string;
    is_premium?: boolean;
    is_public?: boolean;
}

const UserAvatar: React.FC<{ user: User | null, userProfile: UserProfile | null }> = ({ user, userProfile }) => {
  const [imgError, setImgError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.avatar_url) {
        const fixedUrl = userProfile.avatar_url.replace(
            /^(https:\/\/.*?\/storage\/v1\/object\/public\/avatars\/).*?(https:\/\/.*?\/storage\/v1\/object\/public\/avatars\/)/,
            '$1'
          );
          setAvatarUrl(fixedUrl);
          setImgError(false);
    } else {
      setAvatarUrl(null);
    }
  }, [userProfile]);

  if (avatarUrl && !imgError) {
    return (
      <img 
        className="h-8 w-8 rounded-full object-cover" 
        src={avatarUrl} 
        alt=""
        onError={(e) => {
          setImgError(true);
          setAvatarUrl(null);
        }}
      />
    )
  }
  
  if (userProfile?.username) {
    return (
      <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
        {userProfile.username[0].toUpperCase()}
      </div>
    )
  }

  return <img className="h-8 w-8 rounded-full" src="https://www.gravatar.com/avatar/?d=mp" alt="" />
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  usePageTracking()

  const { user, userProfile, signOut, isLoading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading Dandy Wishes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm relative z-10">
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
                    
                    <text x="42" y="33" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="url(#grad)">Dandy Wishes</text>
                  </svg>     
                </a>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/wishboard">
                  <a className="cursor-pointer border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Wishboard
                  </a>
                </Link>
                <Link href="/my-wishes">
                  <a className="cursor-pointer border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    My Wishes
                  </a>
                </Link>
                <Link href="/global-garden">
                  <a className="cursor-pointer border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Global Garden
                  </a>
                </Link>
                <Link href="/how-it-works">
                  <a className="cursor-pointer border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    How It Works
                  </a>
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user && (
                <div className="mr-4 relative" ref={notificationRef}>
                  <NotificationCenter />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
              )}
              {user ? (
                <div className="ml-3 relative" ref={dropdownRef}>
                  <div>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out">
                      <UserAvatar user={user} userProfile={userProfile} />
                      <ChevronDown className="ml-1 h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                  {isDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50">
                      <div className="py-1 rounded-md bg-white shadow-xs">
                        <Link href="/profile">
                          <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Your Profile</a>
                        </Link>
                        <Link href="/my-amplified-wishes">
                          <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">My Amplified Wishes</a>
                        </Link>
                        <a onClick={handleSignOut} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Sign out</a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center">
                  <Link href="/login">
                    <a className="cursor-pointer text-gray-500 hover:text-gray-700 mr-4">
                      Login
                    </a>
                  </Link>
                  <Link href="/signup">
                    <a className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Sign Up
                    </a>
                  </Link>
                </div>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link href="/">
                <a className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition duration-150 ease-in-out cursor-pointer">Wishboard</a>
              </Link>
              <Link href="/my-wishes">
                <a className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition duration-150 ease-in-out cursor-pointer">My Wishes</a>
              </Link>
              <Link href="/global-garden">
                <a className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition duration-150 ease-in-out cursor-pointer">Global Garden</a>
              </Link>
              <Link href="/how-it-works">
                <a className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition duration-150 ease-in-out cursor-pointer">How It Works</a>
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <UserAvatar user={user} userProfile={userProfile} />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{userProfile?.username}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link href="/profile">
                      <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition duration-150 ease-in-out cursor-pointer">Your Profile</a>
                    </Link>
                    <Link href="/my-amplified-wishes">
                      <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition duration-150 ease-in-out cursor-pointer">My Amplified Wishes</a>
                    </Link>
                    <a onClick={handleSignOut} className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition duration-150 ease-in-out cursor-pointer">Sign out</a>
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-1">
                  <Link href="/login">
                    <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition duration-150 ease-in-out cursor-pointer">Login</a>
                  </Link>
                  <Link href="/signup">
                    <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition duration-150 ease-in-out cursor-pointer">Sign Up</a>
                  </Link>
                </div>
              )}
              {user && (
                <div className="px-4 py-2 relative inline-block">
                  <NotificationCenter />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../utils/supabaseClient'
import { User, Session } from '@supabase/supabase-js'
import { syncLocalWishes } from '../utils/wishSync'
import { RealtimeChannel } from '@supabase/supabase-js'

interface UserProfile {
  id: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  is_premium?: boolean;
  is_public?: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
  userStatistics: {
    totalWishes: number;
    wishesShared: number;
    wishesSupported: number;
  };
  fetchUserStatistics: () => Promise<void>;
  newWishNotification: string | null;
  clearNewWishNotification: () => void;
  sendMagicLink: (email: string) => Promise<void>;
  wsConnected: boolean;
  reconnectWebSocket: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userStatistics, setUserStatistics] = useState({
    totalWishes: 0,
    wishesShared: 0,
    wishesSupported: 0
  })
  const [newWishNotification, setNewWishNotification] = useState<string | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [profileFetched, setProfileFetched] = useState(false)
  const router = useRouter()

  const fetchUserProfile = useCallback(async (userId: string) => {
    if (profileFetched && userProfile?.id === userId) {
      return;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
    } else if (data) {
      if (data.avatar_url) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.avatar_url);
        data.avatar_url = publicUrlData.publicUrl;
      }
      setUserProfile(data);
      setProfileFetched(true);
    }
  }, [profileFetched, userProfile]);

  const handleNewPublicWish = useCallback((payload: any) => {
    try {
      const newWish = payload.new
      setNewWishNotification(`New wish: ${newWish.wish_text}`)
    } catch (error) {
      console.error('Error handling new public wish:', error);
    }
  }, []);

  const setupWishesSubscription = useCallback(() => {
    const channel = supabase
      .channel('public:wishes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'wishes', filter: 'is_private=eq.false' },
        handleNewPublicWish
      )
      .subscribe((status) => {
        setWsConnected(status === 'SUBSCRIBED');
      });

    return channel;
  }, [handleNewPublicWish]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true);
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
        setProfileFetched(false);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    const channel = setupWishesSubscription();

    return () => {
      subscription.unsubscribe();
      channel.unsubscribe();
    }
  }, [fetchUserProfile, setupWishesSubscription]);

  const fetchUserStatistics = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.rpc('get_user_statistics', { p_user_id: user.id });
    if (error) {
      console.error('Error fetching user statistics:', error);
    } else if (data && data.length > 0) {
      setUserStatistics({
        totalWishes: data[0].total_wishes_made,
        wishesShared: data[0].wishes_shared,
        wishesSupported: data[0].wishes_supported
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserStatistics();
    }
  }, [user, fetchUserStatistics]);

  const clearNewWishNotification = useCallback(() => {
    setNewWishNotification(null)
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      setProfileFetched(false);
      await fetchUserProfile(data.user.id);
      await syncLocalWishes(data.user.id);
    }
    router.push('/my-wishes');
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { username }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({ 
            id: data.user.id, 
            username: username,
            is_public: false,
            is_premium: false
          })
          .single();

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          throw profileError;
        }

        await fetchUserProfile(data.user.id);
        await syncLocalWishes(data.user.id);
      }
      router.push('/my-wishes');
    } catch (error) {
      console.error('Error during sign up:', error);
      throw error;
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setProfileFetched(false);
    router.push('/');
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update(data)
      .eq('id', user.id);

    if (error) throw error;
    await fetchUserProfile(user.id); 
  }
  
  const sendMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/my-wishes`,
      },
    });
    if (error) throw error;
  }

  const reconnectWebSocket = useCallback(() => {
    const channel = setupWishesSubscription();
    return () => channel.unsubscribe();
  }, [setupWishesSubscription]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      session, 
      signIn, 
      signUp, 
      signOut, 
      updateProfile, 
      isLoading,
      userStatistics,
      fetchUserStatistics,
      newWishNotification,
      clearNewWishNotification,
      sendMagicLink,
      wsConnected,
      reconnectWebSocket
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
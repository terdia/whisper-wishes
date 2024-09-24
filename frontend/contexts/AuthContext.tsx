import React, { createContext, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../utils/supabaseClient'
import { Session, User } from '@supabase/supabase-js'
import getConfig from 'next/config';

interface UserProfile {
  id: string
  username?: string
  bio?: string
  avatar_url?: string
  is_premium?: boolean
  is_public?: boolean
}

interface UserStats {
  user_id: string
  xp: number
  level: number
  login_streak: number
  last_login: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  userStats: UserStats | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
  updateUserStats: (newStats: Partial<UserStats>) => void 
  userSubscription: UserSubscription | null;
  fetchUserSubscription: (userId: string) => Promise<void>;
}

interface UserSubscription {
  tier: 'free' | 'premium';
  features: {
    amplifications_per_month: number | 'unlimited';
    messages_per_wish: number | 'unlimited';
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const { publicRuntimeConfig } = getConfig();
const isProduction = publicRuntimeConfig.NODE_ENV === 'production';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    const storedSession = localStorage.getItem('supabase.auth.token')
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession)
      setSession(parsedSession)
      setUser(parsedSession.user)
      fetchUserProfile(parsedSession.user.id)
      fetchUserStats(parsedSession.user.id)
      fetchUserSubscription(parsedSession.user.id)
      updateLoginStreak(parsedSession.user.id)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
        fetchUserStats(session.user.id);
        fetchUserSubscription(session.user.id);
        localStorage.setItem('supabase.auth.token', JSON.stringify(session))
      } else {
        setUserProfile(null)
        setUserSubscription(null);
        localStorage.removeItem('supabase.auth.token')
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserSubscription = async (userId: string): Promise<void> => {
    if (!userId) {
      console.error('Attempted to fetch user subscription with undefined userId');
      return;
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .single();
  
    if (error) {
      console.error('Error fetching user subscription:', error);
    } else if (data) {
      const subscription: UserSubscription = {
        tier: data.subscription_plans.name.toLowerCase() === 'Free Tier' ? 'free' : 'premium',
        features: {
          amplifications_per_month: data.subscription_plans.features.amplifications_per_month,
          messages_per_wish: data.subscription_plans.features.messages_per_wish,
        },
      };
      setUserSubscription(subscription);
    }
  };

  const fetchUserProfile = async (userId: string): Promise<void> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
    } else if (data) {
      setUserProfile(data)
    }
  }

  const fetchUserStats = async (userId: string): Promise<void> => {
    let { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // User stats don't exist, create them
        const newUserStats: UserStats = {
          user_id: userId,
          xp: 0,
          level: 1,
          login_streak: 1,
          last_login: new Date().toISOString()
        }

        const { data: newData, error: insertError } = await supabase
          .from('user_stats')
          .insert(newUserStats)
          .single()

        if (insertError) {
          console.error('Error creating user stats:', insertError)
        } else {
          data = newData
        }
      } else {
        console.error('Error fetching user stats:', error)
      }
    }

    if (data) {
      setUserStats(data)
    }
  }

  const updateUserStats = async (newStats: Partial<UserStats>): Promise<void> => {
    if (!user) return

    const { data, error } = await supabase
      .from('user_stats')
      .update(newStats)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error updating user stats:', error)
      throw error
    } 

    // Fetch the updated user stats
    const { data: updatedStats, error: fetchError } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

    if (fetchError) throw fetchError

    setUserStats(updatedStats)
  }

  const updateLoginStreak = async (userId: string): Promise<void> => {
    const { data, error } = await supabase.rpc('update_login_streak', { p_user_id: userId })

    if (error) {
      console.error('Error updating login streak:', error)
    } else if (data) {
      fetchUserStats(userId)
    }
  }

  const signIn = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) {
      router.push('/wishboard')
    }
  }

  const signUp = async (email: string, password: string, username: string): Promise<void> => {
    try {
      const redirectTo = isProduction
        ? 'https://www.dandywishes.app/welcome'
        : 'http://localhost:3000/welcome';

      // Attempt to sign up the user
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { username },
          emailRedirectTo: redirectTo
        }
      });
      
      if (error) {
        // If Confirm email is disabled, this error will be thrown for existing users
        if (error.message === 'User already registered') {
          throw new Error('Email already in use');
        }
        throw error;
      }
      
      if (!data.user) {
        throw new Error('User creation failed');
      }
  
      // Check if the user already exists (Confirm email enabled case)
      if (data.user.identities && data.user.identities.length === 0) {
        throw new Error('Email already in use');
      }
  
      // Proceed with creating user profile, stats, and onboarding entry
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
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error('Failed to create user profile');
      }
  
      // Create user stats
      const { error: statsError } = await supabase
        .from('user_stats')
        .insert({
          user_id: data.user.id,
          xp: 0,
          level: 1,
          last_login: new Date().toISOString(),
          login_streak: 1
        });
  
      if (statsError) {
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error('Failed to create user stats');
      }
  
      // Create user onboarding entry
      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .insert({
          user_id: data.user.id,
          welcome_screen_viewed: false
        });
    
      if (onboardingError) {
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error('Failed to create user onboarding');
      }
  
      // Create user subscription for free plan
      const { data: freePlan, error: planError } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('name', 'Free Tier')
        .single();

      if (planError || !freePlan) {
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error('Failed to fetch free plan');
      }

      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: data.user.id,
          plan_id: freePlan.id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString() // 100 years from now
        });

      if (subscriptionError) {
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error('Failed to create user subscription');
      }

    } catch (error) {
      console.error('Error during sign up:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    router.push('/')
  }

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user) return

    const { error } = await supabase
      .from('user_profiles')
      .update(data)
      .eq('id', user.id)

    if (error) throw error
    setUserProfile(prevProfile => prevProfile ? { ...prevProfile, ...data } : null)
  }

  const sendMagicLink = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/my-wishes`,
      },
    })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      userStats,
      session, 
      userSubscription,
      fetchUserSubscription,
      signIn, 
      signUp, 
      signOut, 
      updateProfile, 
      updateUserStats,
      isLoading,
      sendMagicLink
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
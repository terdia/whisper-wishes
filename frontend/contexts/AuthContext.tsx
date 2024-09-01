import React, { createContext, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../utils/supabaseClient'
import { User, Session } from '@supabase/supabase-js'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true) 
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true) 
      setSession(session)
      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setIsLoading(false) 
    })

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
    } else if (data) {
      // Always get the public URL for the avatar
      if (data.avatar_url) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.avatar_url);
        data.avatar_url = publicUrlData.publicUrl;
      }
      setUserProfile(data);
      console.log('User profile fetched:', data);
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) {
      await fetchUserProfile(data.user.id)
    }
    router.push('/my-wishes')
  }

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { username }
      }
    })
    if (error) throw error
    if (data.user) {
      await supabase.from('user_profiles').insert({ id: data.user.id, username })
      await fetchUserProfile(data.user.id)
    }
    router.push('/my-wishes')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    router.push('/')
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

  return (
    <AuthContext.Provider value={{ user, userProfile, session, signIn, signUp, signOut, updateProfile, isLoading }}>
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
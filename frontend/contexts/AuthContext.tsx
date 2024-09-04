import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../utils/supabaseClient'
import { Session, User } from '@supabase/supabase-js'
import { UserProfile } from '../types/UserProfile'

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedSession = localStorage.getItem('supabase.auth.token')
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession)
      setSession(parsedSession)
      setUser(parsedSession.user)
      fetchUserProfile(parsedSession.user.id)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
        localStorage.setItem('supabase.auth.token', JSON.stringify(session))
      } else {
        setUserProfile(null)
        localStorage.removeItem('supabase.auth.token')
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
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

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) {
      router.push('/my-wishes')
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { username }
        }
      })
      
      if (error) throw error
      
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({ 
            id: data.user.id, 
            username: username,
            is_public: false,
            is_premium: false
          })
          .single()

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          throw profileError
        }

        router.push('/my-wishes')
      }
    } catch (error) {
      console.error('Error during sign up:', error)
      throw error
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    router.push('/')
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return

    const { error } = await supabase
      .from('user_profiles')
      .update(data)
      .eq('id', user.id)

    if (error) throw error
    setUserProfile(prevProfile => prevProfile ? { ...prevProfile, ...data } : null)
  }

  const sendMagicLink = async (email: string) => {
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
      session, 
      signIn, 
      signUp, 
      signOut, 
      updateProfile, 
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
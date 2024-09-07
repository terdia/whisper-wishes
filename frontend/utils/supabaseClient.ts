import { createClient } from '@supabase/supabase-js'

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  //throw new Error('Missing Supabase environment variables')
  supabaseUrl = 'https://nkiihhvzbpgylqarnhls.supabase.co'
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5raWloaHZ6YnBneWxxYXJuaGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUxMzEwNzgsImV4cCI6MjA0MDcwNzA3OH0.IqR7KFrcvdoFVcH4AayO5Y-UW2qE-1rLuTcJ9KPEY10'
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test the connection
supabase.from('wishes').select('*', { count: 'exact' }).then(
  ({ data, error }) => {
    if (error) {
      console.error('Supabase connection error pre-build:', error)
    } else {
      console.log('Supabase connection successful')
    }
  }
)
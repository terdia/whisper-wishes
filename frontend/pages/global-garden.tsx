import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import UnauthenticatedUserPrompt from '../components/UnauthenticatedUserPrompt'
import { toast } from 'react-toastify'
import { Loader2 } from 'lucide-react';

interface Wish {
  id: string;
  wish_text: string;
  category: string;
  user_id: string;
  support_count: number;
  user_profile: {
    username: string;
  };
}

export default function GlobalGarden() {
  const { user } = useAuth()
  const [wishes, setWishes] = useState<Wish[]>([])
  const [category, setCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchWishes = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('wishes')
        .select(`
          *,
          user_profile:user_profiles(username)
        `)
        .eq('is_private', false)
        .order('support_count', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedWishes = data.map(wish => ({
        ...wish,
        user_profile: wish.user_profile[0]
      }))
      setWishes(formattedWishes)
    } catch (error) {
      console.error('Error fetching wishes:', error)
      toast.error('Failed to fetch wishes')
    } finally {
      setIsLoading(false)
    }
  }, [category])

  useEffect(() => {
    if (user) {
      fetchWishes()
      
      const wishesSubscription = supabase
        .channel('public:wishes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes' }, handleWishUpdate)
        .subscribe()

      return () => {
        supabase.removeChannel(wishesSubscription)
      }
    } else {
      setIsLoading(false)
    }
  }, [user, fetchWishes])

  const handleWishUpdate = (payload: any) => {
    console.log('Wish update received:', payload);
    if (payload.eventType === 'UPDATE') {
      setWishes(currentWishes => 
        currentWishes.map(wish => 
          wish.id === payload.new.id ? { ...wish, ...payload.new } : wish
        ).sort((a, b) => b.support_count - a.support_count)
      )

      if (payload.new.user_id === user.id) {
        toast.info(`Your wish "${payload.new.wish_text}" has received a new support!`)
      }
    } else if (payload.eventType === 'INSERT') {
      setWishes(currentWishes => 
        [...currentWishes, payload.new]
          .sort((a, b) => b.support_count - a.support_count)
      )
    } else if (payload.eventType === 'DELETE') {
      setWishes(currentWishes => currentWishes.filter(wish => wish.id !== payload.old.id))
    }
  }

  async function supportWish(wishId: string) {
    try {
      const { data, error } = await supabase
        .rpc('support_wish', { p_user_id: user.id, p_wish_id: wishId })

      if (error) {
        console.error('Error supporting wish:', error);
        toast.error('Failed to support wish');
        return;
      }

      if (data) {
        // The actual update will come through the real-time subscription
        toast.success('Wish supported successfully!');
      } else {
        toast.error('You cannot support this wish');
      }
    } catch (error) {
      console.error('Error supporting wish:', error);
      toast.error('Failed to support wish');
    }
  }
  if (!user) {
    return <UnauthenticatedUserPrompt />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading Whisper Wishes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Global Wish Garden</h1>
      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Filter by Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="">All Categories</option>
          <option value="personal">Personal</option>
          <option value="career">Career</option>
          <option value="health">Health</option>
          <option value="relationships">Relationships</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishes.map((wish) => (
          <div key={wish.id} className="bg-white p-4 rounded shadow">
            <p className="text-lg font-semibold mb-2">{wish.wish_text}</p>
            <p className="text-sm text-gray-500">Category: {wish.category}</p>
            <p className="text-sm text-gray-500">Support: {wish.support_count}</p>
            <button
              onClick={() => supportWish(wish.id)}
              disabled={wish.user_id === user.id}
              className={`mt-2 ${wish.user_id === user.id ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-700'} text-white font-bold py-1 px-2 rounded text-sm`}
            >
              {wish.user_id === user.id ? 'Your Wish' : 'Water this Wish'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
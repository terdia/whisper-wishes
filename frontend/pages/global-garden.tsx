import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function GlobalGarden() {
  const [wishes, setWishes] = useState([])
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchWishes()
  }, [category])

  async function fetchWishes() {
    if (!supabase) return; // Add this check

    let query = supabase
      .from('wishes')
      .select('*')
      .eq('is_private', false)
      .order('support_count', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) console.log('error', error)
    else setWishes(data)
  }

  async function supportWish(wishId: string) {
    const { data, error } = await supabase
      .rpc('support_wish', { p_user_id: user.id, p_wish_id: wishId })

    if (error) console.error('Error supporting wish:', error)
    else fetchWishes()
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
              className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Water this Wish
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
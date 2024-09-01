import withAuth from '../components/withAuth'
import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'

export default function CreateWish() {
  const [wishText, setWishText] = useState('')
  const [category, setCategory] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (!user) {
      // Store wish in local storage for non-authenticated users
      const localWish = {
        wish_text: wishText,
        category,
        is_private: isPrivate,
        created_at: new Date().toISOString()
      }
      const localWishes = JSON.parse(localStorage.getItem('localWishes') || '[]')
      localWishes.push(localWish)
      localStorage.setItem('localWishes', JSON.stringify(localWishes))
      
      setWishText('')
      setCategory('')
      setIsPrivate(false)
      setIsSubmitting(false)
      router.push('/')
      return
    }

    try {
      const { data, error } = await supabase
        .from('wishes')
        .insert({ 
          wish_text: wishText, 
          user_id: user.id,
          category,
          is_private: isPrivate
        })

      if (error) throw error

      console.log('Wish created:', data)
      setWishText('')
      setCategory('')
      setIsPrivate(false)
      router.push('/my-wishes')
    } catch (error) {
      console.error('Error creating wish:', error)
      setError('Failed to create wish. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Dandelions */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 text-white opacity-20 text-9xl"
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          ❁
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 text-white opacity-20 text-9xl"
          animate={{ y: [0, 20, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          ❁
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white bg-opacity-90 p-10 rounded-xl shadow-2xl relative z-10"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a New Wish
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let your dreams take flight
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="wishText" className="sr-only">Your Wish</label>
              <textarea
                id="wishText"
                name="wishText"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your wish (max 200 characters)"
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
                maxLength={200}
                rows={4}
              />
            </div>
            <div>
              <label htmlFor="category" className="sr-only">Category</label>
              <select
                id="category"
                name="category"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                <option value="personal">Personal Growth</option>
                <option value="career">Career & Education</option>
                <option value="health">Health & Wellness</option>
                <option value="relationships">Relationships & Family</option>
                <option value="financial">Financial Goals</option>
                <option value="travel">Travel & Adventure</option>
                <option value="creativity">Creativity & Hobbies</option>
                <option value="spiritual">Spiritual & Mindfulness</option>
                <option value="community">Community & Social Impact</option>
                <option value="environmental">Environmental & Sustainability</option>
                <option value="learning">Learning & Skills</option>
                <option value="lifestyle">Lifestyle & Home</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="isPrivate"
              name="isPrivate"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
              Keep this wish private
            </label>
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? 'Creating Wish...' : 'Make a Wish'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
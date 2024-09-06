import React, { useEffect, useState, useMemo } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Trash2, Calendar as CalendarIcon, List, Wind, Moon, Sun, Grid, Edit2, X, Check } from 'lucide-react'
import UnauthenticatedUserPrompt from '../components/UnauthenticatedUserPrompt'
import { syncLocalWishes } from '../utils/wishSync'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/LoadingSpinner'
import SEO from '../components/SEO'

interface Wish {
  id: string
  wish_text: string
  is_private: boolean
  category: string
  created_at: string
}

const localizer = momentLocalizer(moment)

const themes = {
  nightSky: 'from-indigo-900 to-blue-900',
  meadow: 'from-green-400 to-green-700',
  ocean: 'from-blue-400 to-blue-800',
}

const MyWishes: React.FC = () => {
  const { user, userProfile, isLoading: authLoading } = useAuth()
  const [wishes, setWishes] = useState<Wish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState('nightSky')
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'grid'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingWish, setEditingWish] = useState<Wish | null>(null)

  useEffect(() => {
    if (user && userProfile && !authLoading) {
      syncLocalWishes(user.id).then(() => {
        fetchWishes()
      })
    }
  }, [user, userProfile, authLoading])

  const fetchWishes = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWishes(data || [])
    } catch (error) {
      console.error('Error fetching wishes:', error)
      toast.error('Failed to fetch wishes')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredWishes = useMemo(() => {
    return wishes.filter(wish => !selectedCategory || wish.category === selectedCategory)
  }, [wishes, selectedCategory])

  const calendarEvents = useMemo(() => {
    return filteredWishes.map(wish => ({
      id: wish.id,
      title: wish.wish_text,
      start: new Date(wish.created_at),
      end: new Date(wish.created_at),
      allDay: true,
      resource: wish,
    }))
  }, [filteredWishes])

  const deleteWish = async (id: string) => {
    const { error } = await supabase
      .from('wishes')
      .delete()
      .match({ id })

    if (error) {
      console.error('Error deleting wish:', error)
      toast.error('Failed to delete wish')
    } else {
      setWishes(wishes.filter(wish => wish.id !== id))
      setShowDeleteModal(false)
      setSelectedWish(null)
      toast.success('Wish deleted successfully')
    }
  }

  const updateWish = async (updatedWish: Wish) => {
    const { error } = await supabase
      .from('wishes')
      .update(updatedWish)
      .match({ id: updatedWish.id })

    if (error) {
      console.error('Error updating wish:', error)
      toast.error('Failed to update wish')
    } else {
      setWishes(wishes.map(wish => wish.id === updatedWish.id ? updatedWish : wish))
      setEditingWish(null)
      toast.success('Wish updated successfully')
    }
  }

  const WishCard: React.FC<{ wish: Wish }> = ({ wish }) => {
    const [editedWish, setEditedWish] = useState(wish)

    const handleEdit = () => {
      setEditingWish(wish)
      setEditedWish(wish)
    }

    const handleCancelEdit = () => {
      setEditingWish(null)
      setEditedWish(wish)
    }

    const handleSaveEdit = () => {
      updateWish(editedWish)
    }

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`p-6 rounded-lg shadow-lg ${
          editingWish?.id === wish.id ? 'bg-gray-100' : wish.is_private ? 'bg-purple-100' : 'bg-blue-100'
        } relative overflow-hidden`}
      >
        {editingWish?.id === wish.id ? (
          <>
            <textarea
              value={editedWish.wish_text}
              onChange={(e) => setEditedWish({...editedWish, wish_text: e.target.value})}
              className="w-full p-2 mb-2 border rounded text-gray-800"
            />
            <select
              value={editedWish.category}
              onChange={(e) => setEditedWish({...editedWish, category: e.target.value})}
              className="w-full p-2 mb-2 border rounded text-gray-800"
            >
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
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={editedWish.is_private}
                onChange={(e) => setEditedWish({...editedWish, is_private: e.target.checked})}
                className="mr-2"
              />
              <span className="text-gray-800">Private</span>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={handleCancelEdit} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
                <X size={16} />
              </button>
              <button onClick={handleSaveEdit} className="p-2 bg-green-500 text-white rounded hover:bg-green-600">
                <Check size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={handleEdit}
                className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => {
                  setSelectedWish(wish)
                  setShowDeleteModal(true)
                }}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 pr-6 text-gray-800">{wish.wish_text}</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${wish.is_private ? 'bg-purple-200 text-purple-800' : 'bg-blue-200 text-blue-800'}`}>
                {wish.is_private ? 'Private' : 'Public'}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-2">
              <div>
                <span className="mr-2">📅</span>
                {new Date(wish.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="mr-2">🏷️</span>
                {wish.category}
              </div>
            </div>
          </>
        )}
      </motion.div>
    )
  }

  const DeleteModal: React.FC = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 p-6 rounded-lg max-w-sm w-full text-white"
      >
        <h2 className="text-xl font-bold mb-4">Delete Wish</h2>
        <p>Are you sure you want to delete this wish?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedWish && deleteWish(selectedWish.id)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )

  if (!user || !userProfile) {
    return (
      <>
        <SEO
          title="My Wishes - Manage Your Personal Wishes"
          description="Create, organize, and track your personal wishes. Sign up or log in to start your wishing journey!"
        />
        <UnauthenticatedUserPrompt />
      </>
    );
  }

  if (authLoading || isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className={`min-h-[calc(100vh-20rem)] bg-gradient-to-br ${themes[theme]} text-white`}>
      <SEO 
        title="My Wishes"
        description="View and manage your personal wishes."
        noindex={false}
      />
      <div className="container mx-auto px-4 py-12">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          My Wishes
        </motion.h1>
        
        <motion.div 
          className="mb-8 flex flex-wrap gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="p-2 rounded bg-white bg-opacity-20 text-white"
          >
            <option value="nightSky">Night Sky</option>
            <option value="meadow">Meadow</option>
            <option value="ocean">Ocean</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded bg-white bg-opacity-20 text-white"
          >
            <option value="">All Categories</option>
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
          <div className="flex bg-white bg-opacity-20 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-white bg-opacity-30' : ''}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-white bg-opacity-30' : ''}`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 ${viewMode === 'calendar' ? 'bg-white bg-opacity-30' : ''}`}
            >
              <CalendarIcon size={20} />
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {viewMode === 'grid' && (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredWishes.map((wish) => (
                <WishCard key={wish.id} wish={wish} />
              ))}
            </motion.div>
          )}
          
          {viewMode === 'list' && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredWishes.map((wish) => (
                  <WishCard key={wish.id} wish={wish} />
                ))}
              </motion.div>
            )}
          
          {viewMode === 'calendar' && (
            <motion.div 
              className="bg-white rounded-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                views={['month', 'week', 'day']}
                tooltipAccessor={(event) => event.title}
                onSelectEvent={(event) => {
                  const wish = event.resource as Wish;
                  setSelectedWish(wish);
                }}
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor: event.resource.is_private ? '#9F7AEA' : '#4299E1',
                  },
                })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {showDeleteModal && <DeleteModal />}
      </AnimatePresence>
      
      {selectedWish && viewMode === 'calendar' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
          >
            <WishCard wish={selectedWish} />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedWish(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="fixed bottom-4 right-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-white text-purple-600 rounded-full p-3 shadow-lg"
          onClick={() => setTheme(theme === 'nightSky' ? 'meadow' : 'nightSky')}
        >
          {theme === 'nightSky' ? <Sun size={24} /> : <Moon size={24} />}
        </motion.button>
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white text-opacity-20 select-none"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
              x: [null, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'loop'
            }}
          >
            ❁
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default MyWishes
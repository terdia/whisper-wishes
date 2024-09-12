import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Calendar as CalendarIcon, List, Moon, Sun, Grid } from 'lucide-react'
import UnauthenticatedUserPrompt from '../components/UnauthenticatedUserPrompt'
import { syncLocalWishes } from '../utils/wishSync'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/LoadingSpinner'
import SEO from '../components/SEO'
import { Wish } from '../components/amplify/types'
import { AmplificationManager } from '../components/amplify/AmplificationManager'
import { ProgressTracker } from '../components/amplify/ProgressTracker'
import UpgradeModal from '../components/UpgradeModal'
import { useRouter } from 'next/router'
import debounce from 'lodash/debounce'
import WishCard from '../components/WishCard'
import AmplificationModal from '../components/AmplificationModal'

const localizer = momentLocalizer(moment)

const themes = {
  nightSky: 'from-indigo-900 to-blue-900',
  meadow: 'from-green-400 to-green-700',
  ocean: 'from-blue-400 to-blue-800',
}

const MyWishes: React.FC = () => {
  const { user, userProfile, isLoading: authLoading, updateUserStats, fetchUserSubscription } = useAuth()
  const [wishes, setWishes] = useState<Wish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState('nightSky')
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'grid'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [amplifiedWishes, setAmplifiedWishes] = useState<Set<string>>(new Set())
  const router = useRouter()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedWishForAmplification, setSelectedWishForAmplification] = useState<Wish | null>(null);

  useEffect(() => {
    if (user && userProfile && !authLoading) {
      syncLocalWishes(user.id).then(() => {
        fetchWishes()
        fetchAmplifiedWishes()
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

  const fetchAmplifiedWishes = async () => {
    if (!user) return
    try {
      const result = await AmplificationManager.getAmplifiedWishes(user.id)
      setAmplifiedWishes(new Set(result.amplifiedWishes.map(aw => aw.wish_id)))
    } catch (error) {
      console.error('Error fetching amplified wishes:', error)
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
    if (!user) return

    try {
      const { data: oldWishData, error: fetchError } = await supabase
        .from('wishes')
        .select('is_private')
        .eq('id', updatedWish.id)
        .single()

      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('wishes')
        .update(updatedWish)
        .match({ id: updatedWish.id })

      if (error) throw error

      setWishes(wishes.map(wish => wish.id === updatedWish.id ? updatedWish : wish))

      if (oldWishData.is_private && !updatedWish.is_private) {
        const { data: xpData, error: xpError } = await supabase.rpc('update_xp_and_level', {
          p_user_id: user.id,
          p_xp_gained: 15
        })

        if (xpError) throw xpError

        if (xpData) {
          updateUserStats({
            xp: xpData.new_xp,
            level: xpData.new_level
          })
        }

        toast.success('Wish updated and made public! You earned 15 XP.')
      } else {
        toast.success('Wish updated successfully')
      }
    } catch (error) {
      console.error('Error updating wish:', error)
      toast.error('Failed to update wish')
    }
  }

  const handleDelete = (wish: Wish) => {
    setSelectedWish(wish)
    setShowDeleteModal(true)
  }

  const handleAmplify = (wish: Wish) => {
    setSelectedWishForAmplification(wish);
  };

  const handleAmplificationComplete = async (amplifiedWish) => {
    setSelectedWishForAmplification(null);
    toast.success('Wish amplified successfully!');
    await fetchUserSubscription(amplifiedWish.user_id);
    await fetchAmplifiedWishes();
  };

  const handleProgressChange = useCallback(
    debounce(async (wishId: string, newProgress: number) => {
      if (!user) {
        toast.error('You need to be logged in to update wish progress.')
        return
      }
    
      try {
        const updatedWish = await ProgressTracker.updateProgress(wishId, newProgress, user.id)
        setWishes(wishes.map(w => w.id === wishId ? { ...w, progress: updatedWish.progress } : w))
        toast.success('Progress updated successfully!')
      } catch (error) {
        console.error('Error updating progress:', error)
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error('Failed to update progress. Please try again later.')
        }
      }
    }, 500),
    [user, wishes]
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
    )
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
            onChange={(e) => setTheme(e.target.value as keyof typeof themes)}
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
                <WishCard
                  key={wish.id}
                  wish={wish}
                  isAmplified={amplifiedWishes.has(wish.id)}
                  onEdit={updateWish}
                  onDelete={() => handleDelete(wish)}
                  onAmplify={() => handleAmplify(wish)}
                  onProgressChange={(progress) => handleProgressChange(wish.id, progress)}
                  viewMode="grid"
                />
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
                <WishCard
                  key={wish.id}
                  wish={wish}
                  isAmplified={amplifiedWishes.has(wish.id)}
                  onEdit={updateWish}
                  onDelete={() => handleDelete(wish)}
                  onAmplify={() => handleAmplify(wish)}
                  onProgressChange={(progress) => handleProgressChange(wish.id, progress)}
                  viewMode="list"
                />
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
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{scale: 1, opacity: 1 }}
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
        )}
      </AnimatePresence>
      
      {selectedWish && viewMode === 'calendar' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
          >
            <WishCard
              wish={selectedWish}
              isAmplified={amplifiedWishes.has(selectedWish.id)}
              onEdit={updateWish}
              onDelete={() => handleDelete(selectedWish)}
              onAmplify={() => handleAmplify(selectedWish)}
              onProgressChange={(progress) => handleProgressChange(selectedWish.id, progress)}
              viewMode="grid"
            />
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

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          router.push('/subscription');
        }}
        message="You've used all your free amplifications for this month. Upgrade to premium for unlimited amplifications and more features!"
      />

      {selectedWishForAmplification && (
        <AmplificationModal
          isOpen={!!selectedWishForAmplification}
          onClose={() => setSelectedWishForAmplification(null)}
          wishId={selectedWishForAmplification.id}
          isPrivate={selectedWishForAmplification.is_private}
          onAmplificationComplete={handleAmplificationComplete}
          onAmplificationError={(error) => {
            console.error('Error amplifying wish:', error);
            if (error === 'No amplifications left') {
              setShowUpgradeModal(true);
            } else if (error === 'Unauthorized') {
              toast.error('You are not authorized to amplify this wish.');
            } else {
              toast.error(error || 'Failed to amplify wish. Please try again.');
            }
            setSelectedWishForAmplification(null);
          }}
        />
      )}
    </div>
  )
}

export default MyWishes
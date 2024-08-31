import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import withAuth from '../components/withAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Trash2 } from 'lucide-react'

interface Wish {
  id: string
  wish_text: string
  is_private: boolean
  category: string
  created_at: string
}

const localizer = momentLocalizer(moment)

const themes = {
  nightSky: 'bg-gradient-to-b from-indigo-900 to-blue-900',
  meadow: 'bg-gradient-to-b from-green-400 to-green-700',
  ocean: 'bg-gradient-to-b from-blue-400 to-blue-800',
}

const MyWishes = () => {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [theme, setTheme] = useState('nightSky')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchWishes()
  }, [user])

  async function fetchWishes() {
    if (!user) return

    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching wishes:', error)
    else setWishes(data || [])
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
    } else {
      setWishes(wishes.filter(wish => wish.id !== id))
      setShowDeleteModal(false)
      setSelectedWish(null)
    }
  }

  const WishCard = ({ wish }: { wish: Wish }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`p-4 rounded-lg shadow-lg ${
        wish.is_private ? 'bg-purple-100' : 'bg-blue-100'
      } relative`}
    >
      <div className="absolute top-2 right-2">
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
        <h3 className="text-lg font-semibold mb-2 pr-6">{wish.wish_text}</h3>
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
    </motion.div>
  )

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Delete Wish</h2>
        <p>Are you sure you want to delete this wish?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedWish && deleteWish(selectedWish.id)}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`min-h-[calc(100vh-10rem)] p-8 ${themes[theme]}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">My Wishes</h1>
        
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center">
            <label htmlFor="theme" className="text-white mr-2">Theme:</label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="p-2 rounded bg-white bg-opacity-20 text-white"
            >
              <option value="nightSky">Night Sky</option>
              <option value="meadow">Meadow</option>
              <option value="ocean">Ocean</option>
            </select>
          </div>
          <div className="flex items-center">
            <label htmlFor="category" className="text-white mr-2">Category:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 rounded bg-white bg-opacity-20 text-white"
            >
              <option value="">All Categories</option>
              <option value="personal">Personal</option>
              <option value="career">Career</option>
              <option value="health">Health</option>
              <option value="relationships">Relationships</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            className="bg-white text-purple-800 px-4 py-2 rounded hover:bg-opacity-90 transition-colors duration-200"
          >
            {viewMode === 'list' ? 'Calendar View' : 'List View'}
          </button>
        </div>

        {viewMode === 'list' ? (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWishes.map((wish) => (
                <WishCard key={wish.id} wish={wish} />
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <div className="bg-white rounded-lg p-4">
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
          </div>
        )}
      </div>
      {showDeleteModal && <DeleteModal />}
      {selectedWish && viewMode === 'calendar' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <WishCard wish={selectedWish} />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedWish(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default withAuth(MyWishes)
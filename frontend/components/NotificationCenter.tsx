import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Bell, X, MessageCircle, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  content: any;
  is_read: boolean;
  created_at: string;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const subscription = supabase
        .channel('public:notifications')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          handleNewNotification
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false) // Only fetch unread notifications
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data);
      setUnreadCount(data.length);
    }
  };

  const handleNewNotification = (payload: any) => {
    setNotifications(prev => [payload.new, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    } else {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => prev - 1);
    }
  };

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'WISH_SUPPORT':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'NEW_MESSAGE':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderNotification = (notification: Notification) => {
    const icon = renderNotificationIcon(notification.type);
    const formattedDate = format(new Date(notification.created_at), 'MMM d, yyyy');

    return (
      <div className="p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
        <div className="flex items-start">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.type === 'WISH_SUPPORT' && (
                <>
                  <span className="font-semibold">{notification.content.supporterName}</span> supported your wish
                </>
              )}
              {notification.type === 'NEW_MESSAGE' && (
                <>
                  New message from <span className="font-semibold">{notification.content.senderName || 'Unknown'}</span>
                </>
              )}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {notification.type === 'WISH_SUPPORT' && `"${notification.content.wishText}"`}
              {notification.type === 'NEW_MESSAGE' && `"${notification.content.message_preview || 'No preview available'}"`}
            </p>
            <p className="mt-1 text-xs text-gray-400">{formattedDate}</p>
          </div>
        </div>
      </div>
    );
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user!.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative inline-block" ref={notificationRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative"
      >
        <Bell className="h-6 w-6 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-0 sm:absolute sm:right-0 sm:top-auto sm:left-auto mt-2 w-full sm:w-96 bg-white rounded-b-lg sm:rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-[calc(100vh-120px)] sm:max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`border-b border-gray-200 ${!notification.is_read ? 'bg-indigo-50' : ''} flex justify-between items-start`}
                  >
                    {renderNotification(notification)}
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                        title="Mark as read"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm font-medium">No notifications</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
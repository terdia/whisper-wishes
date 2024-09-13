import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  content: any;
  is_read: boolean;
  created_at: string;
}

interface NotificationCenterProps {
  onUnreadCountChange: (count: number) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

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

  useEffect(() => {
    onUnreadCountChange(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data);
      const newUnreadCount = data.filter(n => !n.is_read).length;
      setUnreadCount(newUnreadCount);
      onUnreadCountChange(newUnreadCount);
    }
  };

  const handleNewNotification = (payload: any) => {
    setNotifications(prev => [payload.new, ...prev]);
    setUnreadCount(prev => {
      const newCount = prev + 1;
      onUnreadCountChange(newCount);
      return newCount;
    });
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    } else {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => {
        const newCount = prev - 1;
        onUnreadCountChange(newCount);
        return newCount;
      });
    }
  };

  const renderNotification = (notification: Notification) => {
    switch (notification.type) {
      case 'WISH_SUPPORT':
        return (
          <div className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => markAsRead(notification.id)}>
            <p>{notification.content.supporterName} supported your wish: "{notification.content.wishText}"</p>
          </div>
        );
      case 'NEW_MESSAGE':
        return (
          <div className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => markAsRead(notification.id)}>
            <p>New message from {notification.content.senderName}: "{notification.content.messagePreview}"</p>
          </div>
        );
      // Add more cases for other notification types
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2">
        <Bell />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10">
          <div className="p-2 border-b">
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map(notification => (
              <div key={notification.id} className={`border-b ${!notification.is_read ? 'bg-blue-50' : ''}`}>
                {renderNotification(notification)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

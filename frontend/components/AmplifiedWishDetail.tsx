import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { AmplificationManager } from './amplify/AmplificationManager';
import { MessageManager } from './amplify/MessageManager';
import { Wish, Message } from './amplify/types';
import LoadingSpinner from './LoadingSpinner';
import ReportModal from './ReportModal';
import UpgradeModal from './UpgradeModal';
import { Send, AlertTriangle, PauseCircle, PlayCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

interface AmplifiedWishDetailProps {
  wishId: string;
}

const AmplifiedWishDetail: React.FC<AmplifiedWishDetailProps> = ({ wishId }) => {
  const router = useRouter();
  const { user, userSubscription } = useAuth();
  const [wish, setWish] = useState<Wish | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagingPaused, setIsMessagingPaused] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    if (wishId && user) {
      fetchWishDetails();
      fetchMessages();
      checkMessagingPaused();
    }
  }, [wishId, user]);

  const fetchWishDetails = async () => {
    try {
      const wishDetails = await AmplificationManager.getAmplifiedWishDetails(wishId);
      setWish(wishDetails);
    } catch (error) {
      console.error('Error fetching wish details:', error);
      toast.error('Failed to load wish details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const fetchedMessages = await MessageManager.getMessages(wishId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const checkMessagingPaused = async () => {
    try {
      const paused = await MessageManager.isMessagingPaused(wishId);
      setIsMessagingPaused(paused);
    } catch (error) {
      console.error('Error checking messaging pause status:', error);
    }
  };

  const handleSendMessage = async () => {
    console.log("handleSendMessage called");
    
    if (!user || !userSubscription) {
      console.log("No user logged in");
      toast.error("You must be logged in to send messages");
      return;
    }
    
    if (!wish) {
      console.log("No wish selected");
      toast.error("Unable to send message: No wish selected");
      return;
    }
    
    if (!newMessage.trim()) {
      console.log("Message is empty");
      toast.error("Please enter a message");
      return;
    }  

    console.log("Sending message", {
      wishId,
      senderId: user.id,
      message: newMessage,
    });
  
    try {
      await MessageManager.createMessage(
        wishId,
        user.id,
        newMessage,
        userSubscription
      );
      console.log("Message sent successfully");
      setNewMessage('');
      toast.success('Message sent successfully');
      
      // Fetch updated messages after sending a new one
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      if (error instanceof Error) {
        if (error.message === 'Message limit reached for this wish') {
          setIsUpgradeModalOpen(true);
        } else {
          toast.error(`Failed to send message: ${error.message}`);
        }
      } else {
        toast.error('An unknown error occurred while sending the message');
      }
    }
  };

  const handleToggleMessagingPause = async () => {
    if (!wish) return;
    try {
      await MessageManager.toggleMessagingPause(wishId, user.id, !isMessagingPaused);
      setIsMessagingPaused(!isMessagingPaused);
      toast.success(isMessagingPaused ? 'Messaging resumed' : 'Messaging paused');
    } catch (error) {
      console.error('Error toggling messaging pause:', error);
      toast.error('Failed to update messaging status');
    }
  };

  const handleReport = (reason: string, details: string) => {
    if (!user || !wish) return;

    AmplificationManager.submitReport(wishId, user.id, reason, details)
      .then(() => {
        toast.success('Report submitted successfully');
      })
      .catch((error) => {
        console.error('Error submitting report:', error);
        toast.error('Failed to submit report');
      });
  };

  const handleUpgrade = () => {
    router.push('/subscription');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!wish) {
    return <div>Wish not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <p className="text-3xl font-bold mb-4">{wish.wish_text}</p>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-600 mb-4">Category: {wish.category}</p>
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${wish.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Progress: {wish.progress}%</p>
        </div>
        {user && user.id === wish.user_id && (
          <button
            onClick={handleToggleMessagingPause}
            className={`flex items-center ${
              isMessagingPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'
            } text-white px-4 py-2 rounded-full transition-colors duration-200`}
          >
            {isMessagingPaused ? (
              <>
                <PlayCircle size={20} className="mr-2" />
                Resume Messaging
              </>
            ) : (
              <>
                <PauseCircle size={20} className="mr-2" />
                Pause Messaging
              </>
            )}
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Messages</h2>
        
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.sender_id === user?.id ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
              } max-w-[70%] flex items-start`}
            >
              <div className="mr-3 flex-shrink-0">
                <img 
                  className="h-8 w-8 rounded-full object-cover" 
                  src={message.user_profiles && 
                       message.user_profiles[0] && 
                       message.user_profiles[0].is_public && 
                       message.user_profiles[0].avatar_url
                    ? message.user_profiles[0].avatar_url
                    : "https://www.gravatar.com/avatar/?d=mp"
                  } 
                  alt="" 
                />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {message.user_profiles && 
                   message.user_profiles[0] && 
                   message.user_profiles[0].is_public 
                    ? message.user_profiles[0].username 
                    : "Anonymous"}
                </p>
                <p className="text-sm">{message.message}</p>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {!isMessagingPaused && (
          <div className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow mr-2 p-2 border rounded"
              placeholder="Type your message..."
            />
           <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={!newMessage.trim() || isMessagingPaused}
            >
            <Send size={20} />
            </button>
          </div>
        )}
        {isMessagingPaused && (
          <p className="text-yellow-600 font-semibold">Messaging is currently paused for this wish.</p>
        )}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 flex items-center mx-auto"
        >
          <AlertTriangle size={20} className="mr-2" />
          Report This Wish
        </button>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReport}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={handleUpgrade}
        message="You've reached the message limit for this wish. Upgrade to send more messages!"
      />
    </div>
  );
};

export default AmplifiedWishDetail;
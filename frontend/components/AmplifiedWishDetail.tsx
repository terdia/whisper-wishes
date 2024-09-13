import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { AmplificationManager } from './amplify/AmplificationManager';
import { MessageManager } from './amplify/MessageManager';
import { Wish, Message, Conversation, UserProfile, UserSubscription } from './amplify/types';
import LoadingSpinner from './LoadingSpinner';
import ReportModal from './ReportModal';
import UpgradeModal from './UpgradeModal';
import { Send, AlertTriangle, PauseCircle, PlayCircle } from 'lucide-react';
import { toast } from 'react-toastify';

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

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    if (wishId && user) {
      fetchWishDetails();
      fetchConversations();
      checkMessagingPaused();
    }
  }, [wishId, user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation]);

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
    if (!user || !selectedConversation) return;
    try {
      const fetchedMessages = await MessageManager.getMessages(selectedConversation.id);
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
    
    if (!user) {
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
    
    if (!userSubscription) {
      console.log("No user subscription");
      toast.error("Unable to send message: Subscription information not available");
      return;
    }
    
    if (!selectedConversation) {
      console.log("No conversation selected");
      toast.error("Unable to send message: No conversation selected");
      return;
    }
  
    const recipientId = selectedConversation.participant1_id === user.id
      ? selectedConversation.participant2_id
      : selectedConversation.participant1_id;
  
    console.log("Sending message", {
      wishId,
      senderId: user.id,
      recipientId,
      message: newMessage
    });
  
    try {
      const sentMessage = await MessageManager.createMessage(
        wishId,
        user.id,
        recipientId,
        newMessage,
        userSubscription
      );
      console.log("Message sent successfully", sentMessage);
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessage('');
      toast.success('Message sent successfully');
      fetchConversations();
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

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const fetchedConversations = await MessageManager.getConversations(wishId, user.id);
      setConversations(fetchedConversations);
      if (fetchedConversations.length > 0) {
        setSelectedConversation(fetchedConversations[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const getParticipantName = (conversation: Conversation, currentUserId: string) => {
    const otherParticipant: UserProfile = conversation.participant1_id === currentUserId 
      ? conversation.participant2 
      : conversation.participant1;
    
    if (!otherParticipant) {
      return 'Unknown User';
    }
    
    return otherParticipant.is_public && otherParticipant.username
      ? otherParticipant.username
      : 'Anonymous User';
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
      <h1 className="text-3xl font-bold mb-4">{wish.wish_text}</h1>
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
        
        {user?.id === wish?.user_id && conversations.length > 1 && (
          <div className="mb-4">
            <select 
              value={selectedConversation?.id || ''}
              onChange={(e) => {
                const selected = conversations.find(c => c.id === e.target.value);
                if (selected) setSelectedConversation(selected);
              }}
              className="w-full p-2 border rounded"
            >
              {conversations.map((conv) => (
                <option key={conv.id} value={conv.id}>
                  Conversation with {getParticipantName(conv, user.id)}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedConversation && (
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.sender_id === user?.id ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
                } max-w-[70%]`}
              >
                <p className="text-sm">{message.message}</p>
                <span className="text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

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
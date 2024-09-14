import { Message, UserSubscription } from './types';
import { supabase } from '../../utils/supabaseClient';

export class MessageManager {
  static async createMessage(
    wishId: string,
    senderId: string,
    message: string,
    userSubscription: UserSubscription
  ): Promise<Message> {
    // Check if messaging is paused for this wish
    const { data: pauseData, error: pauseError } = await supabase
      .from('message_pauses')
      .select('*')
      .eq('wish_id', wishId)
      .maybeSingle();

    if (pauseError) throw pauseError;
    if (pauseData) throw new Error('Messaging is currently paused for this wish');

    // Check if the user has reached their message limit
    if (userSubscription.features.messages_per_wish !== 'unlimited') {
      const { count, error } = await supabase
        .from('wish_messages')
        .select('*', { count: 'exact' })
        .eq('wish_id', wishId)
        .eq('sender_id', senderId);

      if (error) throw error;

      if (count >= userSubscription.features.messages_per_wish) {
        throw new Error('Message limit reached for this wish');
      }
    }

    // Start a Supabase transaction
    const { data, error } = await supabase.rpc('create_message_and_notify', {
      p_wish_id: wishId,
      p_sender_id: senderId,
      p_message: message,
      p_message_limit: userSubscription.features.messages_per_wish
    });

    if (error) throw error;

    return data.message;
  }

  static async getMessages(wishId: string, page: number = 1, limit: number = 20): Promise<Message[]> {
    // Fetch messages
    const { data: messages, error: messagesError } = await supabase
      .from('wish_messages')
      .select('*')
      .eq('wish_id', wishId)
      .order('created_at', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (messagesError) throw messagesError;

    if (!messages || messages.length === 0) {
      return [];
    }

    // Get unique sender IDs
    const senderIds = Array.from(new Set(messages.map(message => message.sender_id)));

    // Fetch user profiles
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url, is_public')
      .in('id', senderIds);

    if (profilesError) throw profilesError;

    // Create a map of user profiles
    const userProfileMap = new Map(userProfiles.map(profile => [profile.id, profile]));

    // Combine messages with user profiles
    const messagesWithProfiles: Message[] = messages.map(message => ({
      ...message,
      user_profiles: [userProfileMap.get(message.sender_id) || {
        id: message.sender_id,
        username: 'Unknown User',
        avatar_url: null,
        is_public: false
      }]
    }));

    return messagesWithProfiles;
  }

  static async isMessagingPaused(wishId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('message_pauses')
      .select('*')
      .eq('wish_id', wishId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    return !!data;
  }

  static async toggleMessagingPause(wishId: string, userId: string, isPaused: boolean): Promise<void> {
    if (isPaused) {
      const { error } = await supabase
        .from('message_pauses')
        .insert({ wish_id: wishId, paused_by: userId });

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('message_pauses')
        .delete()
        .eq('wish_id', wishId);

      if (error) throw error;
    }
  }
}
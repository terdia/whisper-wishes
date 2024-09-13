import { Message, UserSubscription, Conversation, UserProfile } from './types';
import { supabase } from '../../utils/supabaseClient';

export class MessageManager {
  static async createMessage(
    wishId: string,
    senderId: string,
    recipientId: string,
    message: string,
    userSubscription: UserSubscription
  ): Promise<Message> {
    console.log("MessageManager.createMessage called", {
      wishId,
      senderId,
      recipientId,
      message
    });
    // Get or create the conversation
    const conversationId = await this.getOrCreateConversation(wishId, senderId, recipientId);

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

    const { data, error } = await supabase
      .from('wish_messages')
      .insert({
        wish_id: wishId,
        sender_id: senderId,
        recipient_id: recipientId,
        conversation_id: conversationId,
        message: message,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async getMessages(conversationId: string, page: number = 1, limit: number = 20): Promise<Message[]> {
    const { data, error } = await supabase
      .from('wish_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return data || [];
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

  static async getOrCreateConversation(wishId: string, senderId: string, recipientId: string): Promise<string> {
    // Ensure consistent ordering of participant IDs
    const [participantA, participantB] = [senderId, recipientId].sort();

    // Check if a conversation already exists
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('wish_id', wishId)
      .eq('participant1_id', participantA)
      .eq('participant2_id', participantB)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingConversation) return existingConversation.id;

    // If no conversation exists, create a new one
    const { data: newConversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        wish_id: wishId,
        participant1_id: participantA,
        participant2_id: participantB
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return newConversation.id;
  }

  static async getConversations(wishId: string, userId: string): Promise<Conversation[]> {
    // Step 1: Fetch conversations
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .eq('wish_id', wishId)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

    if (conversationsError) throw conversationsError;

    if (!conversationsData || conversationsData.length === 0) {
      return [];
    }

    // Step 2: Fetch user profiles
    const participantIds = new Set(
      conversationsData.flatMap(conv => [conv.participant1_id, conv.participant2_id])
    );

    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url, is_premium, is_public')
      .in('id', Array.from(participantIds));

    if (profilesError) throw profilesError;

    // Create a map for quick profile lookup
    const profileMap = new Map(profilesData.map(profile => [profile.id, profile]));

    // Step 3: Combine data
    const conversations: Conversation[] = conversationsData.map(conv => ({
      ...conv,
      participant1: profileMap.get(conv.participant1_id) as UserProfile,
      participant2: profileMap.get(conv.participant2_id) as UserProfile
    }));

    return conversations;
  }
}
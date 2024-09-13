// components/amplify/AmplificationManager.ts

import { Amplification, UserSubscription, Wish } from './types';
import { supabase } from '../../utils/supabaseClient';

export class AmplificationManager {
  static async amplifyWish(
    wishId: string,
    userId: string,
    userSubscription: UserSubscription,
    objective: 'support' | 'help' | 'mentorship',
    context?: string
  ): Promise<Amplification | null> {
    try {
      const amplificationsPerMonth = userSubscription.features.amplifications_per_month;

      if (amplificationsPerMonth !== 'unlimited') {
        // Check if the user has used all their amplifications for the current month
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        
        const { count, error: amplificationError } = await supabase
          .from('wish_amplifications')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .gte('amplified_at', firstDayOfMonth.toISOString());

        if (amplificationError) throw amplificationError;

        if (count >= amplificationsPerMonth) {
          throw new Error('No amplifications left');
        }
      }

      // Check if the wish exists and belongs to the user
      const { data: wishData, error: wishError } = await supabase
        .from('wishes')
        .select('*')
        .eq('id', wishId)
        .single();

      if (wishError) throw wishError;

      if (!wishData) {
        throw new Error('Wish not found');
      }

      if (wishData.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      // Update wish visibility if it's private
      if (wishData.is_private) {
        await this.updateWishVisibility(wishId, false);
      }

      // Insert a new record into wish_amplifications table
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Set expiration to 7 days from now

      const { data: amplificationData, error: amplificationError } = await supabase
        .from('wish_amplifications')
        .insert({
          wish_id: wishId,
          user_id: userId,
          expires_at: expiresAt.toISOString(),
          objective: objective,
          context: context
        })
        .select()
        .single();

      if (amplificationError) throw amplificationError;

      return amplificationData;
    } catch (error) {
      console.error('Error amplifying wish:', error);
      throw error;
    }
  }

  static async updateWishVisibility(wishId: string, isPrivate: boolean): Promise<void> {
    const { error } = await supabase
      .from('wishes')
      .update({ is_private: isPrivate })
      .eq('id', wishId);

    if (error) {
      console.error('Error updating wish visibility:', error);
      throw error;
    }
  }

  static async getAmplifiedWishes(userId: string | null, page: number = 1, limit: number = 10): Promise<{ amplifiedWishes: Amplification[], totalCount: number, currentPage: number, totalPages: number }> {
    try {
      const offset = (page - 1) * limit;
      const currentDate = new Date().toISOString();

      let query = supabase
        .from('wish_amplifications')
        .select(`
          *,
          wishes:wishes (
            id,
            wish_text,
            category,
            user_id,
            progress,
            milestones,
            support_count,
            is_private,
            user_profiles:user_profiles (
              username,
              avatar_url
            )
          )
        `, { count: 'exact' })
        .gt('expires_at', currentDate) 
        .order('amplified_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: amplifiedWishes, error, count } = await query;

      if (error) throw error;

      return {
        amplifiedWishes,
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error fetching amplified wishes:', error);
      throw error;
    }
  }

  static async submitReport(wishId: string, reporterId: string, reason: string, details: string): Promise<void> {
    const { error } = await supabase
      .from('wish_reports')
      .insert({
        wish_id: wishId,
        reporter_id: reporterId,
        reason: reason,
        details: details,
        status: 'pending'
      });

    if (error) throw error;
  }

  static async getAmplifiedWishDetails(wishId: string): Promise<Wish> {
    const { data, error } = await supabase
      .from('wishes')
      .select(`
        *,
        user_profiles:user_id (username, avatar_url),
        wish_amplifications (*)
      `)
      .eq('id', wishId)
      .single();

    if (error) throw error;
    return data;
  }

  static async removeAmplification(amplificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wish_amplifications')
        .delete()
        .eq('id', amplificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing amplification:', error);
      throw error;
    }
  }
}
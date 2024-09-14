// components/amplify/ProgressTracker.ts
import { supabase } from '../../utils/supabaseClient';
import { Wish } from './types';

export class ProgressTracker {
  static async updateProgress(wishId: string, progress: number, userId: string): Promise<Wish> {
    // First, check if the wish belongs to the user
    const { data: wish, error: wishError } = await supabase
      .from('wishes')
      .select('*')
      .eq('id', wishId)
      .eq('user_id', userId)
      .single();

    if (wishError || !wish) {
      throw new Error('Wish not found or unauthorized');
    }

    // Update the wish progress
    const { data, error } = await supabase
      .from('wishes')
      .update({ progress: Math.round(progress) })
      .eq('id', wishId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
import { supabase } from './supabaseClient';

export const syncLocalWishes = async (userId: string) => {
  const localWishes = JSON.parse(localStorage.getItem('localWishes') || '[]');
  if (localWishes.length > 0) {
    // First, fetch existing wishes for this user to avoid duplicates
    const { data: existingWishes, error: fetchError } = await supabase
      .from('wishes')
      .select('wish_text')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Error fetching existing wishes:', fetchError);
      return null;
    }

    const existingWishTexts = new Set(existingWishes.map(wish => wish.wish_text));

    // Filter out wishes that already exist in the database
    const newWishes = localWishes.filter(wish => !existingWishTexts.has(wish.text));

    if (newWishes.length > 0) {
      const { data, error } = await supabase
        .from('wishes')
        .insert(newWishes.map(wish => ({
          wish_text: wish.text,
          user_id: userId,
          category: wish.category,
          is_private: wish.is_private || false,
          is_visible: true
        })));

      if (error) {
        console.error('Error syncing local wishes:', error);
      } else {
        localStorage.removeItem('localWishes');
        console.log('Local wishes synced successfully');
      }
      return data;
    } else {
      console.log('No new wishes to sync');
      localStorage.removeItem('localWishes');
    }
  }
  return null;
};
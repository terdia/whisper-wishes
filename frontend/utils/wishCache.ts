// utils/wishCache.ts

import { supabase } from '../utils/supabaseClient';

interface Wish {
  id: string;
  wish_text: string;
  category: string;
  user_id: string;
  support_count: number;
  is_private: boolean;
  user_profile: {
    id: string;
    username?: string;
    avatar_url?: string;
    is_public?: boolean;
  };
  x: number;
  y: number;
  z: number;
}

interface CacheEntry {
  wishes: Wish[];
  timestamp: number;
}

interface WaterWishResult {
    success: boolean;
    userXp?: number;
    userLevel?: number;
    creatorXp?: number;
    creatorLevel?: number;
    error?: any;
    wish?: Wish;
  }

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

class WishCache {
  private cache: { [key: string]: CacheEntry } = {};

  private getCacheKey(sortOrder: string, category: string, searchTerm: string): string {
    return `${sortOrder}-${category}-${searchTerm}`;
  }

  async fetchWishes(
    userId: string | undefined,
    sortOrder: 'newest' | 'mostWatered',
    category: string,
    searchTerm: string,
    page: number
  ): Promise<Wish[]> {
    if (!userId) return [];

    const cacheKey = this.getCacheKey(sortOrder, category, searchTerm);
    const cachedEntry = this.cache[cacheKey];

    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
      return cachedEntry.wishes.slice(page * 50, (page + 1) * 50);
    }

    try {
      let query = supabase
        .from('wishes')
        .select(`
          *,
          user_profile:user_profiles(id, username, avatar_url, is_public)
        `)
        .eq('is_private', false)
        .range(page * 50, (page + 1) * 50 - 1);

      if (sortOrder === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('support_count', { ascending: false });
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (searchTerm) {
        query = query.ilike('wish_text', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const newWishes = (data as Wish[]).map(wish => ({
        ...wish,
        x: Math.random(),
        y: Math.random(),
        z: Math.random()
      }));

      this.cache[cacheKey] = { wishes: newWishes, timestamp: Date.now() };

      return newWishes;
    } catch (error) {
      console.error('Error fetching wishes:', error);
      return [];
    }
  }

  invalidateCache(): void {
    this.cache = {};
  }

  async waterWish(userId: string, wishId: string): Promise<WaterWishResult> {
    try {
      const { data: existingSupport, error: supportCheckError } = await supabase
        .from('wish_supports')
        .select('id')
        .eq('user_id', userId)
        .eq('wish_id', wishId)
        .maybeSingle();

      if (supportCheckError && supportCheckError.code !== 'PGRST116') {
        throw supportCheckError;
      }

      if (existingSupport) {
        return { success: false };
      }

      const { data: wish, error: wishError } = await supabase
        .from('wishes')
        .select(`
          *,
          user_profile:user_profiles(id, username, avatar_url, is_public)
        `)
        .eq('id', wishId)
        .single();

      if (wishError) throw wishError;

      const { data, error } = await supabase
        .rpc('support_wish', { p_user_id: userId, p_wish_id: wishId });

      if (error) throw error;

      // Award XP for supporting a wish
      const { data: userXpData, error: userXpError } = await supabase.rpc('update_xp_and_level', {
        p_user_id: userId,
        p_xp_gained: 5
      });

      if (userXpError) throw userXpError;

      // Award XP to the wish creator
      const { data: creatorStats, error: creatorStatsError } = await supabase
        .from('user_stats')
        .select('user_id')
        .eq('user_id', wish.user_id)
        .maybeSingle();

      if (creatorStatsError && creatorStatsError.code !== 'PGRST116') {
        throw creatorStatsError;
      }

      let creatorXpData;

      if (!creatorStats) {
        // Create user_stats for the creator if it doesn't exist
        const { error: createStatsError } = await supabase
          .from('user_stats')
          .insert({
            user_id: wish.user_id,
            xp: 3,
            level: 1,
            last_login: new Date().toISOString(),
            login_streak: 1
          });

        if (createStatsError) throw createStatsError;

        creatorXpData = { new_xp: 3, new_level: 1 };
      } else {
        // Update XP for the creator
        const { data: xpData, error: creatorXpError } = await supabase.rpc('update_xp_and_level', {
          p_user_id: wish.user_id,
          p_xp_gained: 3
        });

        if (creatorXpError) throw creatorXpError;

        creatorXpData = xpData;
      }

      // Invalidate cache after successful water
      this.invalidateCache();

      // Map the wish data to match the Wish interface
      const mappedWish: Wish = {
        ...wish,
        x: Math.random(),
        y: Math.random(),
        z: Math.random()
      };

      return {
        success: true,
        userXp: userXpData.new_xp,
        userLevel: userXpData.new_level,
        creatorXp: creatorXpData.new_xp,
        creatorLevel: creatorXpData.new_level,
        wish: mappedWish
      };
    } catch (error) {
      console.error('Error watering wish:', error);
      return { success: false, error };
    }
  }

  async fetchAllWishes(userId: string, sortOrder: 'newest' | 'mostWatered', category: string, searchTerm: string) {
    let allWishes: Wish[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const newWishes = await this.fetchWishes(userId, sortOrder, category, searchTerm, page);
      allWishes = [...allWishes, ...newWishes];
      hasMore = newWishes.length === 20;
      page++;
    }

    return allWishes;
  }
}

export const wishCache = new WishCache();
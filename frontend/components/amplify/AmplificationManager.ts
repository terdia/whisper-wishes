import { Amplification, UserSubscription } from './types';

export class AmplificationManager {
  static async amplifyWish(wishId: string, userId: string, userSubscription: UserSubscription): Promise<Amplification | null> {
    const response = await fetch('/api/amplify-wish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wishId, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to amplify wish');
    }

    return response.json();
  }

  static async getAmplifiedWishes(userId: string | null, page: number = 1, limit: number = 10): Promise<Amplification[]> {
    const response = await fetch(`/api/get-amplified-wishes?userId=${userId}&page=${page}&limit=${limit}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get amplified wishes');
    }

    return response.json();
  }

  // Note: Expiring amplifications should be handled server-side, 
  // possibly with a scheduled function or cron job
}
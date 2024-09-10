import { Wish } from './types';

export class ProgressTracker {
  static async updateProgress(wishId: string, progress: number): Promise<Wish> {
    const response = await fetch('/api/update-wish-progress', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wishId, progress }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update progress');
    }

    return response.json();
  }

  static async getWishProgress(wishId: string): Promise<number> {
    const response = await fetch(`/api/get-wish-progress?wishId=${wishId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get wish progress');
    }

    const data = await response.json();
    return data.progress;
  }
}
import { Wish, Milestone, UserSubscription } from './types';

export class MilestoneManager {
  static async addMilestone(wishId: string, milestone: Omit<Milestone, 'id'>, userSubscription: UserSubscription): Promise<Wish> {
    const response = await fetch('/api/add-wish-milestone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wishId, milestone, userSubscription }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add milestone');
    }

    return response.json();
  }

  static async updateMilestone(wishId: string, milestoneId: string, updates: Partial<Milestone>): Promise<Wish> {
    const response = await fetch('/api/update-wish-milestone', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wishId, milestoneId, updates }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update milestone');
    }

    return response.json();
  }

  static async getMilestones(wishId: string): Promise<Milestone[]> {
    const response = await fetch(`/api/get-wish-milestones?wishId=${wishId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get milestones');
    }

    return response.json();
  }
}
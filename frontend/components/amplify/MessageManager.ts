import { Message, UserSubscription } from './types';

export class MessageManager {
  static async createMessage(wishId: string, senderId: string, recipientId: string, message: string, userSubscription: UserSubscription): Promise<Message> {
    const response = await fetch('/api/create-wish-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wishId, senderId, recipientId, message, userSubscription }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create message');
    }

    return response.json();
  }

  static async getMessages(wishId: string, userId: string, page: number = 1, limit: number = 20): Promise<Message[]> {
    const response = await fetch(`/api/get-wish-messages?wishId=${wishId}&userId=${userId}&page=${page}&limit=${limit}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get messages');
    }

    return response.json();
  }
}
// components/amplify/types.ts

export interface Wish {
    id: string;
    user_id: string;
    wish_text: string;
    category: string;
    progress: number;
    is_private: boolean;
    milestones: Milestone[];
  }
  
  export interface Milestone {
    id: string;
    title: string;
    completed: boolean;
  }
  
  export interface Amplification {
    id: string;
    wish_id: string;
    user_id: string;
    amplified_at: string;
    expires_at: string;
  }
  
  export interface Message {
    id: string;
    wish_id: string;
    sender_id: string;
    recipient_id: string;
    message: string;
    created_at: string;
  }
  
  export interface UserSubscription {
    tier: 'free' | 'premium';
    features: {
      amplifications_per_month: number | 'unlimited';
      messages_per_wish: number | 'unlimited';
    };
  }
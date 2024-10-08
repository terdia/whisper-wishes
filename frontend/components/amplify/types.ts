// components/amplify/types.ts

export interface Wish {
  id: string;
  user_id: string;
  wish_text: string;
  category: string;
  progress: number;
  created_at: string;
  support_count: number;
  is_private: boolean;
  milestones: Milestone[];
}

export interface ExtendedWish extends Wish {
  user_profiles: {
    username: string;
    avatar_url: string;
    is_public: boolean;
  };
  wish_amplifications: {
    objective: 'support' | 'help' | 'mentorship';
    context?: string;
  }[];
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
  objective: 'support' | 'help' | 'mentorship';
  context?: string;
  wish: Wish;
}

export interface AmplifiedWish {
  id: string;
  wish_id: string;
  user_id: string;
  amplified_at: string;
  expires_at: string;
  wishes: ExtendedWish;
  objective: 'support' | 'help' | 'mentorship';
  context?: string;
}

export interface UserSubscription {
  tier: 'free' | 'premium';
  features: {
    amplifications_per_month: number | 'unlimited';
    messages_per_wish: number | 'unlimited';
  };
}

export interface UserProfile {
  id: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  is_premium?: boolean;
  is_public?: boolean;
}

export interface Message {
  id: string;
  wish_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  user_profiles: UserProfile[];
}
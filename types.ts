export enum SubscriptionTier {
  NONE = 'NONE',
  BASIC = 'BASIC', // $20
  PRO = 'PRO' // $40
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  tier: SubscriptionTier;
  calls_remaining: number;
  is_admin: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  status: 'pending' | 'verified' | 'missed';
  notes?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  date: string;
}

export interface AnalyticsData {
  totalUsers: number;
  totalRevenue: number;
  conversionRate: number;
  dailyActiveUsers: number[];
  revenueOverTime: { date: string; amount: number }[];
}
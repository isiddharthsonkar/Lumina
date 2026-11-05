import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  color: string;
  sort_order: number;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  youtube_video_id: string;
  category_id: string | null;
  thumbnail_url: string;
  instructor: string;
  difficulty: string;
  duration_text: string;
  tags: string[];
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  category?: Category;
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  youtube_video_id: string;
  duration_text: string;
  sort_order: number;
  created_at: string;
};

export type CourseInteraction = {
  id: string;
  user_id: string;
  course_id: string;
  interaction_type: 'like' | 'dislike' | 'bookmark';
  created_at: string;
};

export type Review = {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  headline: string;
  body: string;
  is_top_review: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profile?: Profile;
  course?: { id: string; title: string; slug: string };
};

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  company_headline: string;
  is_admin: boolean;
  created_at: string;
};

export type Promotion = {
  id: string;
  name: string;
  channel: string;
  course_link: string;
  budget: string;
  message: string;
  status: 'new' | 'contacted' | 'approved' | 'rejected';
  created_at: string;
};

export type InteractionType = 'like' | 'dislike' | 'bookmark';

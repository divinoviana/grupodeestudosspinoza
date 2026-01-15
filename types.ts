
export type UserRole = 'admin' | 'member';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  bio?: string;
  academic_info?: string;
  role: UserRole;
  avatar_url?: string;
  lattes_url?: string;
}

export interface Publication {
  id: string;
  title: string;
  author_id: string;
  author_name: string;
  abstract: string;
  link: string;
  category: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  meeting_link: string;
}

export type ForumCategory = 'Ética' | 'Ontologia' | 'Política' | 'Epistemologia' | 'Metafísica' | 'Teologia';

export interface ForumTopic {
  id: string;
  category: ForumCategory;
  title: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  target_id: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
}

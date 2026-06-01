export type User = {
  id: string;
  email?: string;
  username: string;
  avatarUrl: string;
  role: 'admin' | 'editor' | 'reporter' | 'contributor' | 'user';
  onboarded?: boolean;
  banned?: boolean;
};

export type Article = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  authorId: string;
  authorName?: string;
  published: boolean;
  slug: string;
  commentCount?: number;
  sectionId?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  scheduledAt?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  version?: number;
  autoSaveContent?: string;
};

export type Comment = {
  id: string;
  createdAt: string;
  articleId: string;
  userId: string;
  username?: string;
  content: string;
  approved: boolean;
  articleTitle?: string;
};

export type Whisper = {
  id: string;
  createdAt: string;
  title: string;
  content: string;
  featuredImage: string;
  published: boolean;
};

export type JokeTrivia = {
  id: string;
  createdAt: string;
  content: string;
  type: 'joke' | 'trivia';
  published: boolean;
};

export type Section = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  icon: string;
  color: string;
  createdAt: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type Media = {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  folder: string;
  tags: string[];
  altText?: string;
  uploadedBy?: string;
  createdAt: string;
};

export type Advertisement = {
  id: string;
  title: string;
  type: 'banner' | 'sidebar' | 'in-article' | 'sponsored';
  imageUrl: string;
  targetUrl: string;
  position: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
};

export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
};

export type Notification = {
  id: string;
  type: 'comment' | 'publish' | 'health' | 'alert';
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
};

export type ArticleAnalytics = {
  id: string;
  articleId: string;
  views: number;
  shares: number;
  avgReadTime: number;
  date: string;
};

export type HomepageConfig = {
  id: string;
  sectionOrder: string[];
  pinnedArticles: string[];
  featuredArticleId?: string;
  breakingNews?: string;
  editorsPicks: string[];
  updatedAt: string;
};
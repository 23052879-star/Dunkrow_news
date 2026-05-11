export type User = {
  id: string;
  email?: string;
  username: string;
  avatarUrl: string;
  role: 'admin' | 'user';
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
};

export type Comment = {
  id: string;
  createdAt: string;
  articleId: string;
  userId: string;
  username?: string;
  content: string;
  approved: boolean;
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
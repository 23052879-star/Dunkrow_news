import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Article } from '../types';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return supabaseUrl && 
         supabaseKey && 
         supabaseUrl !== 'your-supabase-url' && 
         supabaseKey !== 'your-supabase-anon-key' &&
         !supabaseUrl.includes('your-project-id') &&
         !supabaseUrl.includes('undefined') &&
         !supabaseKey.includes('undefined') &&
         supabaseUrl.startsWith('https://') &&
         supabaseUrl.includes('.supabase.co');
};

interface ArticleState {
  articles: Article[];
  featuredArticles: Article[];
  isLoading: boolean;
  error: string | null;
  fetchArticles: (limit?: number) => Promise<void>;
  fetchFeaturedArticles: () => Promise<void>;
  fetchArticleBySlug: (slug: string) => Promise<Article | null>;
  createArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Article | null>;
  updateArticle: (id: string, updates: Partial<Article>) => Promise<Article | null>;
  deleteArticle: (id: string) => Promise<boolean>;
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  featuredArticles: [],
  isLoading: false,
  error: null,

  fetchArticles: async (limit = 10) => {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured properly, using demo data');
      set({ 
        articles: [], 
        isLoading: false,
        error: null 
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          profiles(username)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const articles = data?.map(article => ({
        id: article.id,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        featuredImage: article.featured_image,
        category: article.category,
        authorId: article.author_id,
        authorName: article.profiles?.username,
        published: article.published,
        slug: article.slug
      })) || [];

      set({ articles, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      set({ 
        error: error.message, 
        isLoading: false,
        articles: [] // Set empty array on error
      });
    }
  },

  fetchFeaturedArticles: async () => {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured properly, using demo data');
      set({ 
        featuredArticles: [], 
        isLoading: false,
        error: null 
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          profiles(username)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const featuredArticles = data?.map(article => ({
        id: article.id,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        featuredImage: article.featured_image,
        category: article.category,
        authorId: article.author_id,
        authorName: article.profiles?.username,
        published: article.published,
        slug: article.slug
      })) || [];

      set({ featuredArticles, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching featured articles:', error);
      set({ 
        error: error.message, 
        isLoading: false,
        featuredArticles: [] // Set empty array on error
      });
    }
  },

  fetchArticleBySlug: async (slug: string) => {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured properly');
      set({ isLoading: false, error: null });
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          profiles(username)
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;

      const article: Article = {
        id: data.id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: data.featured_image,
        category: data.category,
        authorId: data.author_id,
        authorName: data.profiles?.username,
        published: data.published,
        slug: data.slug
      };

      set({ isLoading: false });
      return article;
    } catch (error: any) {
      console.error('Error fetching article by slug:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  createArticle: async (article) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured properly');
      set({ error: 'Database not configured', isLoading: false });
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          featured_image: article.featuredImage,
          category: article.category,
          author_id: article.authorId,
          published: article.published,
          slug: article.slug
        })
        .select()
        .single();

      if (error) throw error;

      const newArticle: Article = {
        id: data.id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: data.featured_image,
        category: data.category,
        authorId: data.author_id,
        published: data.published,
        slug: data.slug
      };

      const articles = [...get().articles, newArticle];
      set({ articles, isLoading: false });
      return newArticle;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  updateArticle: async (id, updates) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured properly');
      set({ error: 'Database not configured', isLoading: false });
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('articles')
        .update({
          title: updates.title,
          content: updates.content,
          excerpt: updates.excerpt,
          featured_image: updates.featuredImage,
          category: updates.category,
          published: updates.published,
          slug: updates.slug,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedArticle: Article = {
        id: data.id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: data.featured_image,
        category: data.category,
        authorId: data.author_id,
        published: data.published,
        slug: data.slug
      };

      const articles = get().articles.map(article => 
        article.id === id ? updatedArticle : article
      );
      
      set({ articles, isLoading: false });
      return updatedArticle;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  deleteArticle: async (id) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured properly');
      set({ error: 'Database not configured', isLoading: false });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const articles = get().articles.filter(article => article.id !== id);
      set({ articles, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  }
}));
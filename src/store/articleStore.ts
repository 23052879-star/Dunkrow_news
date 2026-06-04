import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { postToBuffer } from '../lib/buffer';
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
  fetchAllArticles: () => Promise<void>; // Fetch all for admin
  fetchFeaturedArticles: () => Promise<void>;
  fetchArticleBySlug: (slug: string) => Promise<Article | null>;
  createArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'published' | 'status'> & { status?: 'draft' | 'published' | 'scheduled' | 'archived' }) => Promise<Article | null>;
  updateArticle: (id: string, updates: Partial<Article>) => Promise<Article | null>;
  deleteArticle: (id: string) => Promise<boolean>;
  autoSaveArticle: (id: string, content: string) => Promise<boolean>;
}

const mapDbArticleToArticle = (dbArt: any): Article => ({
  id: dbArt.id,
  createdAt: dbArt.created_at,
  updatedAt: dbArt.updated_at,
  title: dbArt.title,
  content: dbArt.content,
  excerpt: dbArt.excerpt,
  featuredImage: dbArt.featured_image,
  category: dbArt.category,
  authorId: dbArt.author_id,
  authorName: dbArt.profiles?.username || 'Reporter',
  published: dbArt.published,
  slug: dbArt.slug,
  sectionId: dbArt.section_id || undefined,
  seoTitle: dbArt.seo_title || undefined,
  metaDescription: dbArt.meta_description || undefined,
  canonicalUrl: dbArt.canonical_url || undefined,
  ogImage: dbArt.og_image || undefined,
  scheduledAt: dbArt.scheduled_at || undefined,
  status: dbArt.status || 'draft',
  version: dbArt.version || 1,
  autoSaveContent: dbArt.auto_save_content || undefined
});

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  featuredArticles: [],
  isLoading: false,
  error: null,

  fetchArticles: async (limit = 10) => {
    if (!isSupabaseConfigured()) {
      set({ articles: [], isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    const safetyTimeout = setTimeout(() => {
      if (get().isLoading) {
        console.warn('fetchArticles query timed out.');
        set({ isLoading: false });
      }
    }, 5000);

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

      clearTimeout(safetyTimeout);

      if (error) throw error;

      const articles = data?.map(mapDbArticleToArticle) || [];
      set({ articles, isLoading: false });
    } catch (error: any) {
      clearTimeout(safetyTimeout);
      console.error('Error fetching articles:', error);
      set({ error: error.message, isLoading: false, articles: [] });
    }
  },

  fetchAllArticles: async () => {
    if (!isSupabaseConfigured()) {
      set({ articles: [], isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    const safetyTimeout = setTimeout(() => {
      if (get().isLoading) {
        console.warn('fetchAllArticles query timed out.');
        set({ isLoading: false });
      }
    }, 5000);

    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          profiles(username)
        `)
        .order('created_at', { ascending: false });

      clearTimeout(safetyTimeout);

      if (error) throw error;

      const articles = data?.map(mapDbArticleToArticle) || [];
      set({ articles, isLoading: false });
    } catch (error: any) {
      clearTimeout(safetyTimeout);
      console.error('Error fetching all articles for admin:', error);
      set({ error: error.message, isLoading: false, articles: [] });
    }
  },

  fetchFeaturedArticles: async () => {
    if (!isSupabaseConfigured()) {
      set({ featuredArticles: [], isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    const safetyTimeout = setTimeout(() => {
      if (get().isLoading) {
        console.warn('fetchFeaturedArticles query timed out.');
        set({ isLoading: false });
      }
    }, 5000);

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

      clearTimeout(safetyTimeout);

      if (error) throw error;

      const featuredArticles = data?.map(mapDbArticleToArticle) || [];
      set({ featuredArticles, isLoading: false });
    } catch (error: any) {
      clearTimeout(safetyTimeout);
      console.error('Error fetching featured articles:', error);
      set({ error: error.message, isLoading: false, featuredArticles: [] });
    }
  },

  fetchArticleBySlug: async (slug: string) => {
    if (!isSupabaseConfigured()) return null;

    set({ isLoading: true, error: null });
    const safetyTimeout = setTimeout(() => {
      if (get().isLoading) {
        console.warn('fetchArticleBySlug query timed out.');
        set({ isLoading: false });
      }
    }, 5000);

    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          profiles(username)
        `)
        .eq('slug', slug)
        .single();

      clearTimeout(safetyTimeout);

      if (error) throw error;

      set({ isLoading: false });
      return mapDbArticleToArticle(data);
    } catch (error: any) {
      clearTimeout(safetyTimeout);
      console.error('Error fetching article by slug:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  createArticle: async (article) => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Database not configured', isLoading: false });
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      // Get current logged in user as author fallback
      let authorId = article.authorId;
      if (authorId === 'current-user-id') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          authorId = user.id;
        } else {
          throw new Error('Not authenticated to create article.');
        }
      }

      const status = article.status || 'draft';
      const published = status === 'published';

      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          featured_image: article.featuredImage,
          category: article.category,
          author_id: authorId,
          published,
          status,
          slug: article.slug,
          section_id: article.sectionId || null,
          seo_title: article.seoTitle || null,
          meta_description: article.metaDescription || null,
          canonical_url: article.canonicalUrl || null,
          og_image: article.ogImage || null,
          scheduled_at: article.scheduledAt || null
        })
        .select(`
          *,
          profiles(username)
        `)
        .single();

      if (error) throw error;

      const newArticle = mapDbArticleToArticle(data);
      set({
        articles: [newArticle, ...get().articles],
        isLoading: false
      });

      // Auto-post to Buffer when publishing (fire-and-forget so it
      // doesn't block the publish response or trigger auth race conditions)
      if (published) {
        postToBuffer({
          id: newArticle.id,
          title: newArticle.title,
          excerpt: newArticle.excerpt ?? '',
          slug: newArticle.slug ?? '',
          category: newArticle.category ?? '',
          featuredImage: newArticle.featuredImage,
        }).catch(bufferErr => {
          console.warn('[Buffer] Post queuing failed (article was saved):', bufferErr);
        });
      }

      return newArticle;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  updateArticle: async (id, updates) => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Database not configured', isLoading: false });
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.excerpt !== undefined) dbUpdates.excerpt = updates.excerpt;
      if (updates.featuredImage !== undefined) dbUpdates.featured_image = updates.featuredImage;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.sectionId !== undefined) dbUpdates.section_id = updates.sectionId || null;
      if (updates.seoTitle !== undefined) dbUpdates.seo_title = updates.seoTitle || null;
      if (updates.metaDescription !== undefined) dbUpdates.meta_description = updates.metaDescription || null;
      if (updates.canonicalUrl !== undefined) dbUpdates.canonical_url = updates.canonicalUrl || null;
      if (updates.ogImage !== undefined) dbUpdates.og_image = updates.ogImage || null;
      if (updates.scheduledAt !== undefined) dbUpdates.scheduled_at = updates.scheduledAt || null;
      
      if (updates.status !== undefined) {
        dbUpdates.status = updates.status;
        dbUpdates.published = updates.status === 'published';
      }

      const { data, error } = await supabase
        .from('articles')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          profiles(username)
        `)
        .single();

      if (error) throw error;

      const updatedArticle = mapDbArticleToArticle(data);
      const articles = get().articles.map(article => 
        article.id === id ? updatedArticle : article
      );
      
      set({ articles, isLoading: false });

      // Auto-post to Buffer when status changes to published (fire-and-forget
      // so it doesn't block the update response or trigger auth race conditions)
      if (dbUpdates.published === true) {
        postToBuffer({
          id: updatedArticle.id,
          title: updatedArticle.title,
          excerpt: updatedArticle.excerpt ?? '',
          slug: updatedArticle.slug ?? '',
          category: updatedArticle.category ?? '',
          featuredImage: updatedArticle.featuredImage,
        }).catch(bufferErr => {
          console.warn('[Buffer] Post queuing failed (article was saved):', bufferErr);
        });
      }

      return updatedArticle;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  deleteArticle: async (id) => {
    if (!isSupabaseConfigured()) {
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
  },

  autoSaveArticle: async (id, content) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({
          auto_save_content: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        articles: state.articles.map(art => art.id === id ? { ...art, autoSaveContent: content } : art)
      }));
      return true;
    } catch (err) {
      console.error('Error auto-saving article:', err);
      return false;
    }
  }
}));

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Comment } from '../types';

interface CommentState {
  comments: Comment[];
  pendingComments: Comment[];
  isLoading: boolean;
  error: string | null;
  fetchComments: (articleId: string) => Promise<void>;
  fetchPendingComments: () => Promise<void>;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<Comment | null>;
  approveComment: (id: string) => Promise<boolean>;
  deleteComment: (id: string) => Promise<boolean>;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  pendingComments: [],
  isLoading: false,
  error: null,

  fetchComments: async (articleId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles(username)
        `)
        .eq('article_id', articleId)
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const comments = data.map(comment => ({
        id: comment.id,
        createdAt: comment.created_at,
        articleId: comment.article_id,
        userId: comment.user_id,
        username: comment.profiles?.username,
        content: comment.content,
        approved: comment.approved
      }));

      set({ comments, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPendingComments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles(username),
          articles(title)
        `)
        .eq('approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const pendingComments = data.map(comment => ({
        id: comment.id,
        createdAt: comment.created_at,
        articleId: comment.article_id,
        userId: comment.user_id,
        username: comment.profiles?.username,
        content: comment.content,
        approved: comment.approved,
        articleTitle: comment.articles?.title
      }));

      set({ pendingComments, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addComment: async (comment) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: comment.articleId,
          user_id: comment.userId,
          content: comment.content,
          approved: false // All comments need approval
        })
        .select(`
          *,
          profiles(username)
        `)
        .single();

      if (error) throw error;

      const newComment: Comment = {
        id: data.id,
        createdAt: data.created_at,
        articleId: data.article_id,
        userId: data.user_id,
        username: data.profiles?.username,
        content: data.content,
        approved: data.approved
      };

      set({ isLoading: false });
      return newComment;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  approveComment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('comments')
        .update({ approved: true })
        .eq('id', id);

      if (error) throw error;

      const pendingComments = get().pendingComments.filter(
        comment => comment.id !== id
      );
      
      set({ pendingComments, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  deleteComment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const comments = get().comments.filter(comment => comment.id !== id);
      const pendingComments = get().pendingComments.filter(
        comment => comment.id !== id
      );
      
      set({ comments, pendingComments, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  }
}));
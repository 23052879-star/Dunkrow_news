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
  fetchAllComments: () => Promise<void>;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'approved'>) => Promise<Comment | null>;
  approveComment: (id: string) => Promise<boolean>;
  deleteComment: (id: string) => Promise<boolean>;
  bulkApprove: (ids: string[]) => Promise<boolean>;
  bulkDelete: (ids: string[]) => Promise<boolean>;
}

const mapDbCommentToComment = (item: any): Comment => ({
  id: item.id,
  createdAt: item.created_at,
  articleId: item.article_id,
  userId: item.user_id,
  username: item.profiles?.username || 'Guest',
  content: item.content,
  approved: item.approved,
  articleTitle: item.articles?.title || undefined
});

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
        .order('created_at', { ascending: true });

      if (error) throw error;

      const comments = data?.map(mapDbCommentToComment) || [];
      set({ comments, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      set({ error: err.message, isLoading: false, comments: [] });
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

      const pendingComments = data?.map(mapDbCommentToComment) || [];
      set({ pendingComments, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching pending comments:', err);
      set({ error: err.message, isLoading: false, pendingComments: [] });
    }
  },

  fetchAllComments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles(username),
          articles(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allComments = data?.map(mapDbCommentToComment) || [];
      set({
        comments: allComments,
        pendingComments: allComments.filter(c => !c.approved),
        isLoading: false
      });
    } catch (err: any) {
      console.error('Error fetching all comments:', err);
      set({ error: err.message, isLoading: false });
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
          approved: false // All comments require moderation by default
        })
        .select(`
          *,
          profiles(username)
        `)
        .single();

      if (error) throw error;

      const newComment = mapDbCommentToComment(data);
      set({
        pendingComments: [newComment, ...get().pendingComments],
        isLoading: false
      });
      return newComment;
    } catch (err: any) {
      console.error('Error adding comment:', err);
      set({ error: err.message, isLoading: false });
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

      const approved = get().pendingComments.find(c => c.id === id);
      const remainingPending = get().pendingComments.filter(c => c.id !== id);
      
      let comments = get().comments;
      if (approved) {
        comments = [...comments, { ...approved, approved: true }].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      set({
        pendingComments: remainingPending,
        comments,
        isLoading: false
      });
      return true;
    } catch (err: any) {
      console.error('Error approving comment:', err);
      set({ error: err.message, isLoading: false });
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

      set({
        comments: get().comments.filter(c => c.id !== id),
        pendingComments: get().pendingComments.filter(c => c.id !== id),
        isLoading: false
      });
      return true;
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  bulkApprove: async (ids) => {
    if (!ids.length) return true;
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('comments')
        .update({ approved: true })
        .in('id', ids);

      if (error) throw error;

      const approvedItems = get().pendingComments.filter(c => ids.includes(c.id));
      const remainingPending = get().pendingComments.filter(c => !ids.includes(c.id));

      const comments = [...get().comments, ...approvedItems.map(c => ({ ...c, approved: true }))]
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      set({
        pendingComments: remainingPending,
        comments,
        isLoading: false
      });
      return true;
    } catch (err: any) {
      console.error('Error bulk approving comments:', err);
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  bulkDelete: async (ids) => {
    if (!ids.length) return true;
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .in('id', ids);

      if (error) throw error;

      set({
        comments: get().comments.filter(c => !ids.includes(c.id)),
        pendingComments: get().pendingComments.filter(c => !ids.includes(c.id)),
        isLoading: false
      });
      return true;
    } catch (err: any) {
      console.error('Error bulk deleting comments:', err);
      set({ error: err.message, isLoading: false });
      return false;
    }
  }
}));
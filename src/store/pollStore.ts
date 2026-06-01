import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Poll } from '../types';

interface PollState {
  polls: Poll[];
  isLoading: boolean;
  error: string | null;
  fetchPolls: () => Promise<void>;
  createPoll: (poll: Omit<Poll, 'id' | 'createdAt'>) => Promise<Poll | null>;
  updatePoll: (id: string, updates: Partial<Poll>) => Promise<Poll | null>;
  deletePoll: (id: string) => Promise<boolean>;
  votePoll: (pollId: string, optionId: string) => Promise<boolean>;
}

export const usePollStore = create<PollState>((set, get) => ({
  polls: [],
  isLoading: false,
  error: null,

  fetchPolls: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Polls table not ready:', error.message);
        set({ polls: [], isLoading: false });
        return;
      }

      const polls: Poll[] = data?.map(item => ({
        id: item.id,
        question: item.question,
        options: (typeof item.options === 'string' ? JSON.parse(item.options) : item.options) || [],
        isActive: item.is_active,
        createdAt: item.created_at,
        expiresAt: item.expires_at || undefined
      })) || [];

      set({ polls, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching polls:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  createPoll: async (poll) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('polls')
        .insert({
          question: poll.question,
          options: JSON.stringify(poll.options),
          is_active: poll.isActive,
          expires_at: poll.expiresAt
        })
        .select()
        .single();

      if (error) throw error;

      const newPoll: Poll = {
        id: data.id,
        question: data.question,
        options: (typeof data.options === 'string' ? JSON.parse(data.options) : data.options) || [],
        isActive: data.is_active,
        createdAt: data.created_at,
        expiresAt: data.expires_at || undefined
      };

      set({
        polls: [newPoll, ...get().polls],
        isLoading: false
      });
      return newPoll;
    } catch (err: any) {
      console.error('Error creating poll:', err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  updatePoll: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const dbUpdates: any = {};
      if (updates.question !== undefined) dbUpdates.question = updates.question;
      if (updates.options !== undefined) dbUpdates.options = updates.options;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.expiresAt !== undefined) dbUpdates.expires_at = updates.expiresAt;

      const { data, error } = await supabase
        .from('polls')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedPoll: Poll = {
        id: data.id,
        question: data.question,
        options: (typeof data.options === 'string' ? JSON.parse(data.options) : data.options) || [],
        isActive: data.is_active,
        createdAt: data.created_at,
        expiresAt: data.expires_at || undefined
      };

      set({
        polls: get().polls.map(item => item.id === id ? updatedPoll : item),
        isLoading: false
      });
      return updatedPoll;
    } catch (err: any) {
      console.error('Error updating poll:', err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  deletePoll: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('polls').delete().eq('id', id);
      if (error) throw error;

      set({
        polls: get().polls.filter(item => item.id !== id),
        isLoading: false
      });
      return true;
    } catch (err: any) {
      console.error('Error deleting poll:', err);
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  votePoll: async (pollId, optionId) => {
    const poll = get().polls.find(p => p.id === pollId);
    if (!poll || !poll.isActive) return false;

    const newOptions = poll.options.map(opt =>
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );

    try {
      const { error } = await supabase
        .from('polls')
        .update({ options: newOptions })
        .eq('id', pollId);

      if (error) throw error;

      set({
        polls: get().polls.map(p => p.id === pollId ? { ...p, options: newOptions } : p)
      });
      return true;
    } catch (err: any) {
      console.error('Error voting in poll:', err);
      return false;
    }
  }
}));

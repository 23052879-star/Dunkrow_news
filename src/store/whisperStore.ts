import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Whisper } from '../types';

interface WhisperState {
  whispers: Whisper[];
  isLoading: boolean;
  error: string | null;
  fetchWhispers: () => Promise<void>;
  fetchAllWhispers: () => Promise<void>;
  createWhisper: (whisper: Omit<Whisper, 'id' | 'createdAt'>) => Promise<Whisper | null>;
  updateWhisper: (id: string, updates: Partial<Whisper>) => Promise<Whisper | null>;
  deleteWhisper: (id: string) => Promise<boolean>;
}

const mapDbWhisperToWhisper = (item: any): Whisper => ({
  id: item.id,
  createdAt: item.created_at,
  title: item.title,
  content: item.content,
  featuredImage: item.featured_image,
  published: item.published
});

export const useWhisperStore = create<WhisperState>((set, get) => ({
  whispers: [],
  isLoading: false,
  error: null,

  fetchWhispers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('whispers')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const whispers = data?.map(mapDbWhisperToWhisper) || [];
      set({ whispers, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching whispers:', err);
      set({ error: err.message, isLoading: false, whispers: [] });
    }
  },

  fetchAllWhispers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('whispers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const whispers = data?.map(mapDbWhisperToWhisper) || [];
      set({ whispers, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching all whispers:', err);
      set({ error: err.message, isLoading: false, whispers: [] });
    }
  },

  createWhisper: async (whisper) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('whispers')
        .insert({
          title: whisper.title,
          content: whisper.content,
          featured_image: whisper.featuredImage,
          published: whisper.published
        })
        .select()
        .single();

      if (error) throw error;

      const newWhisper = mapDbWhisperToWhisper(data);
      set({
        whispers: [newWhisper, ...get().whispers],
        isLoading: false
      });
      return newWhisper;
    } catch (err: any) {
      console.error('Error creating whisper:', err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  updateWhisper: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.featuredImage !== undefined) dbUpdates.featured_image = updates.featuredImage;
      if (updates.published !== undefined) dbUpdates.published = updates.published;

      const { data, error } = await supabase
        .from('whispers')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedWhisper = mapDbWhisperToWhisper(data);
      set({
        whispers: get().whispers.map(item => item.id === id ? updatedWhisper : item),
        isLoading: false
      });
      return updatedWhisper;
    } catch (err: any) {
      console.error('Error updating whisper:', err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  deleteWhisper: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('whispers').delete().eq('id', id);
      if (error) throw error;

      set({
        whispers: get().whispers.filter(item => item.id !== id),
        isLoading: false
      });
      return true;
    } catch (err: any) {
      console.error('Error deleting whisper:', err);
      set({ error: err.message, isLoading: false });
      return false;
    }
  }
}));
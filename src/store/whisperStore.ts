import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Whisper } from '../types';

interface WhisperState {
  whispers: Whisper[];
  isLoading: boolean;
  error: string | null;
  fetchWhispers: () => Promise<void>;
  createWhisper: (whisper: Omit<Whisper, 'id' | 'createdAt'>) => Promise<Whisper | null>;
  updateWhisper: (id: string, updates: Partial<Whisper>) => Promise<Whisper | null>;
  deleteWhisper: (id: string) => Promise<boolean>;
}

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

      const whispers = data.map(whisper => ({
        id: whisper.id,
        createdAt: whisper.created_at,
        title: whisper.title,
        content: whisper.content,
        featuredImage: whisper.featured_image,
        published: whisper.published
      }));

      set({ whispers, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
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

      const newWhisper: Whisper = {
        id: data.id,
        createdAt: data.created_at,
        title: data.title,
        content: data.content,
        featuredImage: data.featured_image,
        published: data.published
      };

      const whispers = [...get().whispers, newWhisper];
      set({ whispers, isLoading: false });
      return newWhisper;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  updateWhisper: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('whispers')
        .update({
          title: updates.title,
          content: updates.content,
          featured_image: updates.featuredImage,
          published: updates.published
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedWhisper: Whisper = {
        id: data.id,
        createdAt: data.created_at,
        title: data.title,
        content: data.content,
        featuredImage: data.featured_image,
        published: data.published
      };

      const whispers = get().whispers.map(whisper => 
        whisper.id === id ? updatedWhisper : whisper
      );
      
      set({ whispers, isLoading: false });
      return updatedWhisper;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  deleteWhisper: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('whispers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const whispers = get().whispers.filter(whisper => whisper.id !== id);
      set({ whispers, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  }
}));
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { JokeTrivia } from '../types';

interface JokeTriviaState {
  jokesTrivia: JokeTrivia[];
  jokes: JokeTrivia[];
  trivia: JokeTrivia[];
  isLoading: boolean;
  error: string | null;
  fetchJokesTrivia: () => Promise<void>;
  fetchAllJokesTrivia: () => Promise<void>;
  createJokeTrivia: (item: Omit<JokeTrivia, 'id' | 'createdAt'>) => Promise<JokeTrivia | null>;
  updateJokeTrivia: (id: string, updates: Partial<JokeTrivia>) => Promise<JokeTrivia | null>;
  deleteJokeTrivia: (id: string) => Promise<boolean>;
}

const mapDbToJokeTrivia = (item: any): JokeTrivia => ({
  id: item.id,
  createdAt: item.created_at,
  content: item.content,
  type: item.type,
  published: item.published
});

export const useJokeTriviaStore = create<JokeTriviaState>((set, get) => ({
  jokesTrivia: [],
  jokes: [],
  trivia: [],
  isLoading: false,
  error: null,

  fetchJokesTrivia: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('jokes_trivia')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const jokesTrivia = data?.map(mapDbToJokeTrivia) || [];
      const jokes = jokesTrivia.filter(item => item.type === 'joke');
      const trivia = jokesTrivia.filter(item => item.type === 'trivia');

      set({ jokesTrivia, jokes, trivia, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching jokes/trivia:', err);
      set({ error: err.message, isLoading: false, jokesTrivia: [], jokes: [], trivia: [] });
    }
  },

  fetchAllJokesTrivia: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('jokes_trivia')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const jokesTrivia = data?.map(mapDbToJokeTrivia) || [];
      const jokes = jokesTrivia.filter(item => item.type === 'joke');
      const trivia = jokesTrivia.filter(item => item.type === 'trivia');

      set({ jokesTrivia, jokes, trivia, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching all jokes/trivia:', err);
      set({ error: err.message, isLoading: false, jokesTrivia: [], jokes: [], trivia: [] });
    }
  },

  createJokeTrivia: async (item) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('jokes_trivia')
        .insert({
          content: item.content,
          type: item.type,
          published: item.published
        })
        .select()
        .single();

      if (error) throw error;

      const newItem = mapDbToJokeTrivia(data);
      const jokesTrivia = [newItem, ...get().jokesTrivia];
      
      set({
        jokesTrivia,
        jokes: jokesTrivia.filter(i => i.type === 'joke'),
        trivia: jokesTrivia.filter(i => i.type === 'trivia'),
        isLoading: false
      });
      return newItem;
    } catch (err: any) {
      console.error('Error creating joke/trivia:', err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  updateJokeTrivia: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const dbUpdates: any = {};
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.published !== undefined) dbUpdates.published = updates.published;

      const { data, error } = await supabase
        .from('jokes_trivia')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedItem = mapDbToJokeTrivia(data);
      const jokesTrivia = get().jokesTrivia.map(item => item.id === id ? updatedItem : item);

      set({
        jokesTrivia,
        jokes: jokesTrivia.filter(i => i.type === 'joke'),
        trivia: jokesTrivia.filter(i => i.type === 'trivia'),
        isLoading: false
      });
      return updatedItem;
    } catch (err: any) {
      console.error('Error updating joke/trivia:', err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  deleteJokeTrivia: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('jokes_trivia').delete().eq('id', id);
      if (error) throw error;

      const jokesTrivia = get().jokesTrivia.filter(item => item.id !== id);
      set({
        jokesTrivia,
        jokes: jokesTrivia.filter(i => i.type === 'joke'),
        trivia: jokesTrivia.filter(i => i.type === 'trivia'),
        isLoading: false
      });
      return true;
    } catch (err: any) {
      console.error('Error deleting joke/trivia:', err);
      set({ error: err.message, isLoading: false });
      return false;
    }
  }
}));
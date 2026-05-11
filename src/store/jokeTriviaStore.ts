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
  createJokeTrivia: (jokeTrivia: Omit<JokeTrivia, 'id' | 'createdAt'>) => Promise<JokeTrivia | null>;
  updateJokeTrivia: (id: string, updates: Partial<JokeTrivia>) => Promise<JokeTrivia | null>;
  deleteJokeTrivia: (id: string) => Promise<boolean>;
}

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

      const jokesTrivia = data.map(item => ({
        id: item.id,
        createdAt: item.created_at,
        content: item.content,
        type: item.type,
        published: item.published
      }));

      const jokes = jokesTrivia.filter(item => item.type === 'joke');
      const trivia = jokesTrivia.filter(item => item.type === 'trivia');

      set({ jokesTrivia, jokes, trivia, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createJokeTrivia: async (jokeTrivia) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('jokes_trivia')
        .insert({
          content: jokeTrivia.content,
          type: jokeTrivia.type,
          published: jokeTrivia.published
        })
        .select()
        .single();

      if (error) throw error;

      const newJokeTrivia: JokeTrivia = {
        id: data.id,
        createdAt: data.created_at,
        content: data.content,
        type: data.type,
        published: data.published
      };

      const jokesTrivia = [...get().jokesTrivia, newJokeTrivia];
      const jokes = jokeTrivia.type === 'joke' 
        ? [...get().jokes, newJokeTrivia] 
        : get().jokes;
      const trivia = jokeTrivia.type === 'trivia' 
        ? [...get().trivia, newJokeTrivia] 
        : get().trivia;

      set({ jokesTrivia, jokes, trivia, isLoading: false });
      return newJokeTrivia;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  updateJokeTrivia: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('jokes_trivia')
        .update({
          content: updates.content,
          type: updates.type,
          published: updates.published
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedJokeTrivia: JokeTrivia = {
        id: data.id,
        createdAt: data.created_at,
        content: data.content,
        type: data.type,
        published: data.published
      };

      const jokesTrivia = get().jokesTrivia.map(item => 
        item.id === id ? updatedJokeTrivia : item
      );
      
      const jokes = jokesTrivia.filter(item => item.type === 'joke');
      const trivia = jokesTrivia.filter(item => item.type === 'trivia');
      
      set({ jokesTrivia, jokes, trivia, isLoading: false });
      return updatedJokeTrivia;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  deleteJokeTrivia: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('jokes_trivia')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const jokesTrivia = get().jokesTrivia.filter(item => item.id !== id);
      const jokes = get().jokes.filter(item => item.id !== id);
      const trivia = get().trivia.filter(item => item.id !== id);
      
      set({ jokesTrivia, jokes, trivia, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  }
}));
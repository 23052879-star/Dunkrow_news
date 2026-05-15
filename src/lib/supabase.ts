import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl !== 'your-supabase-url' && 
         supabaseAnonKey !== 'your-supabase-anon-key' &&
         !supabaseUrl.includes('your-project-id') &&
         !supabaseUrl.includes('undefined') &&
         !supabaseAnonKey.includes('undefined') &&
         supabaseUrl.startsWith('https://') &&
         supabaseUrl.includes('.supabase.co');
};

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Running in demo mode.');
} else if (!isSupabaseConfigured()) {
  console.warn('Supabase not properly configured. Using placeholder values.');
} else {
  console.log('Supabase client initialized with URL:', supabaseUrl);
}

// Create a safe Supabase client that won't throw errors
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_REQUEST_TIMEOUT_MS = 15000;
const SUPABASE_AUTH_STORAGE_KEY = 'dunkrow-supabase-auth-v2';
const LEGACY_AUTH_STORAGE_PREFIX = 'sb-';
const LEGACY_AUTH_STORAGE_SUFFIX = '-auth-token';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
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

export const withTimeout = async <T,>(
  promise: PromiseLike<T>,
  timeoutMs = SUPABASE_REQUEST_TIMEOUT_MS,
  message = 'Request timed out. Please check your connection and try again.'
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const isRetryableMethod = (method?: string) => {
  const normalized = (method || 'GET').toUpperCase();
  return normalized === 'GET' || normalized === 'HEAD';
};

const fetchWithTimeout: typeof fetch = async (input, init = {}) => {
  const method = init.method || (input instanceof Request ? input.method : 'GET');
  const maxAttempts = isRetryableMethod(method) ? 2 : 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS);
    const originalSignal = init.signal;

    if (originalSignal) {
      if (originalSignal.aborted) controller.abort();
      originalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    try {
      const response = await fetch(input, {
        ...init,
        cache: 'no-store',
        signal: controller.signal,
      });

      if (
        attempt < maxAttempts &&
        [408, 429, 500, 502, 503, 504].includes(response.status)
      ) {
        await wait(300 * attempt);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts || (originalSignal && originalSignal.aborted)) {
        throw error;
      }
      await wait(300 * attempt);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError;
};

export const clearSupabaseAuthStorage = () => {
  try {
    localStorage.removeItem(SUPABASE_AUTH_STORAGE_KEY);

    for (let index = localStorage.length - 1; index >= 0; index--) {
      const key = localStorage.key(index);
      if (key?.startsWith(LEGACY_AUTH_STORAGE_PREFIX) && key.endsWith(LEGACY_AUTH_STORAGE_SUFFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn('Unable to clear Supabase auth storage:', error);
  }
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
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: SUPABASE_AUTH_STORAGE_KEY,
      storage: window.localStorage,
    },
    global: {
      fetch: fetchWithTimeout,
    },
  }
);

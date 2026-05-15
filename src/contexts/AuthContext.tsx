import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/ui/LoadingScreen';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, username: string) => Promise<{ error: any; session: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrCreateProfile = async (sessionUser: any) => {
    try {
      // 1. Try to fetch existing profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();
      
      if (!profileError && profile) {
        return {
          id: profile.id,
          username: profile.username,
          avatarUrl: profile.avatar_url,
          role: profile.role,
          email: sessionUser.email
        };
      }

      // 2. Profile doesn't exist or error fetching — attempt to create one
      // Extract base username from various metadata sources
      let baseUsername = sessionUser.user_metadata?.username
        || sessionUser.user_metadata?.full_name 
        || sessionUser.user_metadata?.name 
        || sessionUser.email?.split('@')[0] 
        || 'user';

      // Sanitize username: lowercase, replace non-alphanumeric with underscores
      baseUsername = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
      if (!baseUsername) baseUsername = 'user';

      const avatarUrl = sessionUser.user_metadata?.avatar_url 
        || sessionUser.user_metadata?.picture 
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(baseUsername)}&background=random`;

      // 3. Handle potential username conflicts (retry loop)
      let finalUsername = baseUsername;
      let counter = 0;
      let profileCreated = false;
      let lastError = null;

      // Try up to 5 times with different usernames if there's a conflict
      while (counter < 5 && !profileCreated) {
        const { data: newProfile, error: insertError } = await supabase.from('profiles').upsert({
          id: sessionUser.id,
          username: finalUsername,
          avatar_url: avatarUrl,
          role: 'user'
        }).select().single();

        if (!insertError && newProfile) {
          profileCreated = true;
          return {
            id: newProfile.id,
            username: newProfile.username,
            avatarUrl: newProfile.avatar_url,
            role: newProfile.role,
            email: sessionUser.email
          };
        }

        // Log the exact error for debugging
        if (insertError) {
          console.error(`Profile creation attempt ${counter + 1} failed:`, {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          });
        }

        // If error is a unique constraint violation on username, increment and retry
        if (insertError?.code === '23505' && insertError?.message?.includes('username')) {
          counter++;
          finalUsername = `${baseUsername}${counter}`;
        } else {
          lastError = insertError;
          break; // Stop if it's a different error
        }
      }

      if (lastError) {
        console.error('Failed to create profile after retries:', lastError);
      }

      // Return a temporary local user object even if DB insert failed
      // so the app remains functional for the session
      return {
        id: sessionUser.id,
        username: finalUsername,
        avatarUrl,
        role: 'user' as const,
        email: sessionUser.email
      };
    } catch (error) {
      console.error('Unexpected error in fetchOrCreateProfile:', error);
      return {
        id: sessionUser.id,
        username: sessionUser.email?.split('@')[0] || 'user',
        avatarUrl: '',
        role: 'user' as const,
        email: sessionUser.email
      };
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl === 'your-supabase-url' || 
          supabaseKey === 'your-supabase-anon-key' ||
          supabaseUrl.includes('your-project-id') ||
          supabaseUrl.includes('undefined') ||
          supabaseKey.includes('undefined') ||
          !supabaseUrl.startsWith('https://') ||
          !supabaseUrl.includes('.supabase.co')) {
        console.warn('Supabase not configured properly. Authentication disabled.');
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        // Log the URL to see if we have a hash token
        console.log('Current URL on checkSession:', window.location.href);
        if (window.location.hash.includes('access_token')) {
          console.log('Hash contains access_token, Supabase should process this.');
        } else if (window.location.search.includes('error=')) {
          console.error('URL contains error:', window.location.search);
          alert('Authentication Error: ' + window.location.search);
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          alert('Session Error: ' + sessionError.message);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }
        
        if (session?.user && mounted) {
          const userData = await fetchOrCreateProfile(session.user);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    checkSession();

    // Only set up auth listener if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    let subscription: any = null;
    
    if (supabaseUrl && supabaseKey && 
        supabaseUrl !== 'your-supabase-url' && 
        supabaseKey !== 'your-supabase-anon-key' &&
        !supabaseUrl.includes('your-project-id') &&
        !supabaseUrl.includes('undefined') &&
        !supabaseKey.includes('undefined') &&
        supabaseUrl.startsWith('https://') &&
        supabaseUrl.includes('.supabase.co')) {
      
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        console.log(`Auth event: ${event}`, session ? 'Session found' : 'No session');

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          try {
            const userData = await fetchOrCreateProfile(session.user);
            setUser(userData);
          } catch (err) {
            console.error('Error in fetchOrCreateProfile during auth change:', err);
            alert('Error creating profile after sign in. Check console.');
          } finally {
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        }
      });
      
      subscription = authSubscription;
    }
    
    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) console.error('Login error:', error);
      return { error };
    } catch (error) {
      console.error('Unexpected login error:', error);
      return { error };
    }
  };
  
  const register = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { username }
        }
      });
      
      if (error) {
        console.error('Supabase registration error:', error);
        return { error, session: null };
      }
      
      return { error: null, session: data?.session || null };
    } catch (error: any) {
      console.error('Unexpected registration error:', error);
      return { error: error, session: null };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };
  
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAdmin: user?.role === 'admin',
      login, 
      register,
      signInWithGoogle,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
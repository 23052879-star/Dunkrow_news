import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/ui/LoadingScreen';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, username: string) => Promise<{ error: any }>;
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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();
      
      if (profileError || !profile) {
        // Profile doesn't exist — create one (common for OAuth users)
        const username = sessionUser.user_metadata?.full_name 
          || sessionUser.user_metadata?.name 
          || sessionUser.email?.split('@')[0] 
          || 'user';
        const avatarUrl = sessionUser.user_metadata?.avatar_url 
          || sessionUser.user_metadata?.picture 
          || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;

        try {
          await supabase.from('profiles').upsert({
            id: sessionUser.id,
            username,
            avatar_url: avatarUrl,
            role: 'user'
          });
        } catch (insertError) {
          console.error('Error creating profile:', insertError);
        }

        return {
          id: sessionUser.id,
          username,
          avatarUrl,
          role: 'user' as const,
          email: sessionUser.email
        };
      }

      return {
        id: profile.id,
        username: profile.username,
        avatarUrl: profile.avatar_url,
        role: profile.role,
        email: sessionUser.email
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
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

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          const userData = await fetchOrCreateProfile(session.user);
          setUser(userData);
          setIsLoading(false);
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
      return { error };
    } catch (error) {
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
      
      if (!error && data.user) {
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            username,
            avatar_url: `https://ui-avatars.com/api/?name=${username}&background=random`,
            role: 'user'
          });
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't fail registration if profile creation fails
        }
      }
      
      return { error };
    } catch (error) {
      return { error };
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
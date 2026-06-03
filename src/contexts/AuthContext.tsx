import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/ui/LoadingScreen';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, username: string) => Promise<{ error: any; needsConfirmation: boolean }>;
  signInWithGoogle: (intent?: 'login' | 'register') => Promise<{ error: any }>;
  logout: () => Promise<void>;
  completeOnboarding: (username: string) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url.startsWith('https://') && url.includes('.supabase.co') &&
    !url.includes('undefined') && !key.includes('undefined') &&
    url !== 'your-supabase-url' && key !== 'your-supabase-anon-key');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const processingRef = useRef(false);

  const fetchProfile = useCallback(async (sessionUser: any): Promise<User> => {
    try {
      // Try fetching profile with a small retry for race conditions
      // (e.g. trigger hasn't finished creating profile yet after email confirm)
      let profile = null;
      let fetchError = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabase
          .from('profiles').select('*').eq('id', sessionUser.id).single();
        
        if (!error && data) {
          profile = data;
          break;
        }
        fetchError = error;
        
        // Only retry if it's a "not found" error (PGRST116), not a real error
        if (error?.code !== 'PGRST116') break;
        
        // Wait a bit before retrying (trigger may still be running)
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      if (profile) {
        return {
          id: profile.id,
          username: profile.username,
          avatarUrl: profile.avatar_url,
          role: profile.role,
          email: sessionUser.email,
          onboarded: true,
        };
      }

      // No profile found → user needs onboarding (Google/OAuth user without profile)
      const name = sessionUser.user_metadata?.full_name 
        || sessionUser.user_metadata?.name 
        || sessionUser.email?.split('@')[0] 
        || 'user';
      const avatar = sessionUser.user_metadata?.avatar_url 
        || sessionUser.user_metadata?.picture 
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
      
      return {
        id: sessionUser.id,
        username: name,
        avatarUrl: avatar,
        role: 'user',
        email: sessionUser.email,
        onboarded: false,
      };
    } catch (err) {
      console.error('fetchProfile error:', err);
      return {
        id: sessionUser.id,
        username: sessionUser.email?.split('@')[0] || 'user',
        avatarUrl: '',
        role: 'user',
        email: sessionUser.email,
        onboarded: false,
      };
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!isSupabaseConfigured()) { setIsLoading(false); return; }

    const safetyTimeout = setTimeout(() => { if (mounted) setIsLoading(false); }, 2500);

    const handleSession = async (session: any | null) => {
      if (!mounted) return;
      
      // Prevent duplicate processing
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        if (session?.user) {
          const userData = await fetchProfile(session.user);
          
          // Check if this was a Google LOGIN attempt for a non-existent account
          const intent = localStorage.getItem('auth_intent');
          
          if (intent) {
            localStorage.removeItem('auth_intent');
            
            if (!userData.onboarded && intent === 'login') {
              // No profile found — user was trying to LOGIN with Google but has no account
              // Sign them out and set an error flag
              await supabase.auth.signOut();
              if (mounted) {
                setUser(null);
                setIsLoading(false);
                // Store error for LoginPage to pick up
                sessionStorage.setItem('auth_error', 'no_account');
              }
              return;
            }
          }
          
          if (mounted) setUser(userData);
        } else {
          if (mounted) setUser(null);
        }
        if (mounted) setIsLoading(false);
      } finally {
        processingRef.current = false;
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
        processingRef.current = false;
      }
    });

    return () => { mounted = false; clearTimeout(safetyTimeout); subscription.unsubscribe(); };
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Map Supabase error messages to user-friendly messages
        let userMessage = error.message;
        if (error.message?.includes('Invalid login credentials')) {
          userMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message?.includes('Email not confirmed')) {
          userMessage = 'Please confirm your email address before logging in. Check your inbox for the verification link.';
        }
        return { error: { ...error, message: userMessage } };
      }
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'An unexpected error occurred.' } };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username: string) => {
    try {
      // 1. Pre-check: Check if username already exists in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingProfile) {
        return {
          error: { message: 'Username is already taken. Please choose another one.' },
          needsConfirmation: false,
        };
      }

      // 2. Perform Supabase registration
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });

      if (error) {
        let userMessage = error.message;
        if (error.message?.includes('already registered') || error.message?.includes('already been registered')) {
          userMessage = 'This email is already registered. Please sign in instead.';
        } else if (error.message?.includes('valid email')) {
          userMessage = 'Please enter a valid email address.';
        } else if (error.message?.includes('at least')) {
          userMessage = 'Password must be at least 6 characters long.';
        }
        return { error: { ...error, message: userMessage }, needsConfirmation: false };
      }

      // 3. Post-check: If email confirmation is enabled, Supabase returns 200 OK for already-registered emails
      // but leaves the identities array empty []. Let's catch this case.
      const userIdentities = data?.user?.identities;
      if (data?.user && (!userIdentities || userIdentities.length === 0)) {
        return {
          error: { message: 'This email is already registered. Please sign in instead.' },
          needsConfirmation: false,
        };
      }

      // Check if email confirmation is required
      // Supabase returns a session if auto-confirm is ON, null session if confirmation is needed
      const needsConfirmation = !data?.session;

      if (data?.session && data?.user) {
        // Auto-confirmed: the DB trigger should create the profile.
        // But as a safety net, try to create it directly too if the trigger hasn't run yet.
        const { data: profileCheck } = await supabase
          .from('profiles').select('id').eq('id', data.user.id).single();
        
        if (!profileCheck) {
          // Trigger hasn't created the profile yet — create it manually
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
            role: 'user',
          });
        }
      }

      return { error: null, needsConfirmation };
    } catch (error: any) {
      return { error: { message: error.message || 'An unexpected error occurred.' }, needsConfirmation: false };
    }
  }, []);

  const signInWithGoogle = useCallback(async (intent: 'login' | 'register' = 'register') => {
    try {
      localStorage.setItem('auth_intent', intent);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) {
        localStorage.removeItem('auth_intent');
      }
      return { error };
    } catch (error) {
      localStorage.removeItem('auth_intent');
      return { error };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('auth_intent');
  }, []);

  const completeOnboarding = useCallback(async (username: string) => {
    if (!user) return { error: new Error('Not logged in') };
    
    try {
      const avatarUrl = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
      
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        username,
        avatar_url: avatarUrl,
        role: 'user',
      });

      if (profileError) {
        if (profileError.code === '23505') {
          return { error: new Error('Username is already taken. Please choose a different one.') };
        }
        console.error('Profile upsert error:', profileError);
        return { error: new Error(profileError.message || 'Failed to create profile.') };
      }

      setUser({ ...user, username, avatarUrl, onboarded: true });
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'An unexpected error occurred.') };
    }
  }, [user]);

  if (isLoading) return <LoadingScreen />;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin: user?.role === 'admin', login, register, signInWithGoogle, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};
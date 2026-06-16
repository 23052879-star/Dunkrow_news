import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User } from '../types';
import { clearSupabaseAuthStorage, isSupabaseConfigured, supabase, withTimeout } from '../lib/supabase';
import LoadingScreen from '../components/ui/LoadingScreen';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, username: string) => Promise<{ error: any; needsConfirmation: boolean }>;
  signInWithGoogle: (intent?: 'login' | 'register') => Promise<{ error: any }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Latest-wins counter: each handleSession call gets a unique ID.
  // Only the most recent call is allowed to commit state changes.
  // This replaces the old processingRef guard which silently DROPPED
  // concurrent auth events, causing desynchronized auth state.
  const sessionCounterRef = useRef(0);

  const fetchProfile = useCallback(async (sessionUser: any, existingUser?: User | null): Promise<User> => {
    try {
      // Try fetching profile with a small retry for race conditions
      // (e.g. trigger hasn't finished creating profile yet after email confirm)
      let profile = null;
      let fetchError = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await withTimeout(
          supabase.from('profiles').select('*').eq('id', sessionUser.id).single(),
          10000,
          'Profile request timed out.'
        );
        
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

      // Profile not found — if we already have a user in state with the same id,
      // keep their existing data (especially role) instead of overwriting to 'user'
      if (existingUser && existingUser.id === sessionUser.id) {
        return existingUser;
      }

      // Truly new user with no profile
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
        onboarded: true,
      };
    } catch (err) {
      console.error('fetchProfile error:', err);
      // On error, preserve existing user data if available
      if (existingUser && existingUser.id === sessionUser.id) {
        return existingUser;
      }
      return {
        id: sessionUser.id,
        username: sessionUser.email?.split('@')[0] || 'user',
        avatarUrl: '',
        role: 'user',
        email: sessionUser.email,
        onboarded: true,
      };
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!isSupabaseConfigured()) { setIsLoading(false); return; }

    const safetyTimeout = setTimeout(() => { if (mounted) setIsLoading(false); }, 10000);

    const handleSession = async (session: any | null) => {
      if (!mounted) return;
      
      // Increment counter — this call is now the "latest"
      const myId = ++sessionCounterRef.current;

      try {
        if (session?.user) {
          // Pass current user state so fetchProfile can preserve role on failure
          const currentUser = user;
          const userData = await fetchProfile(session.user, currentUser);

          // After await: check if a NEWER call has started; if so, bail out
          if (myId !== sessionCounterRef.current || !mounted) return;
          
          // Check if this was a Google LOGIN attempt for a non-existent account
          const intent = localStorage.getItem('auth_intent');
          
          if (intent) {
            localStorage.removeItem('auth_intent');
            
            if (!userData.onboarded && intent === 'login') {
              // No profile found — user was trying to LOGIN with Google but has no account
              // Sign them out and set an error flag
              await supabase.auth.signOut();
              if (mounted && myId === sessionCounterRef.current) {
                setUser(null);
                setIsLoading(false);
                // Store error for LoginPage to pick up
                sessionStorage.setItem('auth_error', 'no_account');
              }
              return;
            }
          }
          
          if (mounted && myId === sessionCounterRef.current) setUser(userData);
        } else {
          if (mounted && myId === sessionCounterRef.current) setUser(null);
        }
        if (mounted && myId === sessionCounterRef.current) setIsLoading(false);
      } catch (err) {
        console.error('handleSession error:', err);
        if (mounted && myId === sessionCounterRef.current) {
          // Don't clear user on errors — keep existing state
          setIsLoading(false);
        }
      }
    };

    const refreshSession = async () => {
      try {
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          15000,
          'Session restore timed out.'
        );
        if (error) {
          console.error('getSession error:', error);
          // On initial load, mark loading as done but keep existing user
          if (mounted && !user) {
            setIsLoading(false);
          }
          return;
        }
        await handleSession(data.session);
      } catch (error) {
        console.error('getSession failed:', error);
        // Don't clear user on network errors - keep existing auth state
        if (mounted && !user) {
          setIsLoading(false);
        }
      }
    };

    refreshSession();

    // Only refresh session on visibility change, not on every focus event
    // to avoid aggressive re-fetches that can clear auth state
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Silently refresh token without resetting user state on failure
        supabase.auth.getSession().then(({ data, error }) => {
          if (!mounted || error) return;
          if (data.session?.user) {
            // Token is still valid, refresh profile but preserve existing role on failure
            const currentUser = user;
            fetchProfile(data.session.user, currentUser).then(userData => {
              if (mounted) setUser(userData);
            }).catch(() => { /* keep existing user */ });
          }
          // If no session and we previously had a user, the onAuthStateChange
          // SIGNED_OUT event will handle cleanup — don't clear here
        }).catch(() => { /* network error, keep existing state */ });
      }
    };

    const handleOnline = () => {
      // On reconnect, just validate the session silently
      supabase.auth.getSession().catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        // Increment counter so any in-flight handleSession calls bail out
        ++sessionCounterRef.current;
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        15000,
        'Login timed out. Please check your connection and try again.'
      );
      if (error) {
        setIsLoading(false);
        // Map Supabase error messages to user-friendly messages
        let userMessage = error.message;
        if (error.message?.includes('Invalid login credentials')) {
          userMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message?.includes('Email not confirmed')) {
          userMessage = 'Please confirm your email address before logging in. Check your inbox for the verification link.';
        }
        return { error: { ...error, message: userMessage } };
      }

      if (data.user) {
        const userData = await fetchProfile(data.user);
        setUser(userData);
      }

      setIsLoading(false);
      return { error: null };
    } catch (error: any) {
      setIsLoading(false);
      return { error: { message: error.message || 'An unexpected error occurred.' } };
    }
  }, [fetchProfile]);

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


  if (isLoading) return <LoadingScreen />;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin: user?.role === 'admin', login, register, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

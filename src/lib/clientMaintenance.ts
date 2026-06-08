import { clearSupabaseAuthStorage } from './supabase';

const STORAGE_VERSION_KEY = 'dunkrow-client-storage-version';
const CURRENT_STORAGE_VERSION = '2026-06-08-auth-cache-v2';

export const runClientMaintenance = () => {
  try {
    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);

    if (storedVersion === CURRENT_STORAGE_VERSION) {
      return;
    }

    clearSupabaseAuthStorage();
    localStorage.removeItem('auth_intent');
    sessionStorage.removeItem('auth_error');
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
  } catch (error) {
    console.warn('Unable to run client maintenance:', error);
  }
};

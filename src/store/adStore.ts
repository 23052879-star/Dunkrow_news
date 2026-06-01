import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Advertisement } from '../types';

interface AdState {
  ads: Advertisement[];
  isLoading: boolean;
  error: string | null;
  fetchAds: () => Promise<void>;
  createAd: (ad: Omit<Advertisement, 'id' | 'createdAt' | 'impressions' | 'clicks'>) => Promise<Advertisement | null>;
  updateAd: (id: string, updates: Partial<Advertisement>) => Promise<Advertisement | null>;
  deleteAd: (id: string) => Promise<boolean>;
  trackImpression: (id: string) => Promise<void>;
  trackClick: (id: string) => Promise<void>;
}

export const useAdStore = create<AdState>((set, get) => ({
  ads: [],
  isLoading: false,
  error: null,

  fetchAds: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });

      // Gracefully handle if table doesn't exist yet
      if (error) {
        console.warn('Ads table not ready:', error.message);
        set({ ads: [], isLoading: false });
        return;
      }

      const ads: Advertisement[] = data?.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        imageUrl: item.image_url,
        targetUrl: item.target_url,
        position: item.position || 'homepage-top',
        isActive: item.is_active,
        impressions: item.impressions || 0,
        clicks: item.clicks || 0,
        startDate: item.start_date || undefined,
        endDate: item.end_date || undefined,
        createdAt: item.created_at
      })) || [];

      set({ ads, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching ads:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  createAd: async (ad) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .insert({
          title: ad.title,
          type: ad.type,
          image_url: ad.imageUrl,
          target_url: ad.targetUrl,
          position: ad.position,
          is_active: ad.isActive,
          start_date: ad.startDate,
          end_date: ad.endDate
        })
        .select()
        .single();

      if (error) throw error;

      const newAd: Advertisement = {
        id: data.id,
        title: data.title,
        type: data.type,
        imageUrl: data.image_url,
        targetUrl: data.target_url,
        position: data.position || 'homepage-top',
        isActive: data.is_active,
        impressions: data.impressions || 0,
        clicks: data.clicks || 0,
        startDate: data.start_date || undefined,
        endDate: data.end_date || undefined,
        createdAt: data.created_at
      };

      set({
        ads: [newAd, ...get().ads],
        isLoading: false
      });
      return newAd;
    } catch (err: any) {
      console.error('Error creating ad:', err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  updateAd: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.targetUrl !== undefined) dbUpdates.target_url = updates.targetUrl;
      if (updates.position !== undefined) dbUpdates.position = updates.position;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;

      const { data, error } = await supabase
        .from('advertisements')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedAd: Advertisement = {
        id: data.id,
        title: data.title,
        type: data.type,
        imageUrl: data.image_url,
        targetUrl: data.target_url,
        position: data.position || 'homepage-top',
        isActive: data.is_active,
        impressions: data.impressions || 0,
        clicks: data.clicks || 0,
        startDate: data.start_date || undefined,
        endDate: data.end_date || undefined,
        createdAt: data.created_at
      };

      set({
        ads: get().ads.map(item => item.id === id ? updatedAd : item),
        isLoading: false
      });
      return updatedAd;
    } catch (err: any) {
      console.error('Error updating ad:', err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  deleteAd: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('advertisements').delete().eq('id', id);
      if (error) throw error;

      set({
        ads: get().ads.filter(item => item.id !== id),
        isLoading: false
      });
      return true;
    } catch (err: any) {
      console.error('Error deleting ad:', err);
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  trackImpression: async (id) => {
    try {
      // In a real app we'd throttle or batch. For simplicity, direct increment
      await supabase.rpc('increment_ad_impressions', { ad_id: id }).catch(async () => {
        // Fallback if RPC doesn't exist
        const ad = get().ads.find(a => a.id === id);
        if (ad) {
          await supabase.from('advertisements').update({ impressions: ad.impressions + 1 }).eq('id', id);
        }
      });
    } catch (err) {
      console.error('Error tracking ad impression:', err);
    }
  },

  trackClick: async (id) => {
    try {
      await supabase.rpc('increment_ad_clicks', { ad_id: id }).catch(async () => {
        // Fallback if RPC doesn't exist
        const ad = get().ads.find(a => a.id === id);
        if (ad) {
          await supabase.from('advertisements').update({ clicks: ad.clicks + 1 }).eq('id', id);
        }
      });
    } catch (err) {
      console.error('Error tracking ad click:', err);
    }
  }
}));

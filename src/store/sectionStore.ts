import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Section } from '../types';

interface SectionState {
  sections: Section[];
  isLoading: boolean;
  error: string | null;
  fetchSections: () => Promise<void>;
  createSection: (section: Omit<Section, 'id' | 'createdAt'>) => Promise<Section | null>;
  updateSection: (id: string, updates: Partial<Section>) => Promise<Section | null>;
  deleteSection: (id: string) => Promise<boolean>;
  reorderSections: (sections: Section[]) => Promise<boolean>;
}

export const useSectionStore = create<SectionState>((set, get) => ({
  sections: [],
  isLoading: false,
  error: null,

  fetchSections: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Sections table not ready:', error.message);
        set({ sections: [], isLoading: false });
        return;
      }

      const sections = data?.map(sec => ({
        id: sec.id,
        name: sec.name,
        slug: sec.slug,
        description: sec.description || undefined,
        displayOrder: sec.display_order,
        isActive: sec.is_active,
        icon: sec.icon,
        color: sec.color,
        createdAt: sec.created_at
      })) || [];

      set({ sections, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching sections:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  createSection: async (section) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('sections')
        .insert({
          name: section.name,
          slug: section.slug,
          description: section.description,
          display_order: section.displayOrder,
          is_active: section.isActive,
          icon: section.icon,
          color: section.color
        })
        .select()
        .single();

      if (error) throw error;

      const newSec: Section = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        displayOrder: data.display_order,
        isActive: data.is_active,
        icon: data.icon,
        color: data.color,
        createdAt: data.created_at
      };

      set({
        sections: [...get().sections, newSec].sort((a, b) => a.displayOrder - b.displayOrder),
        isLoading: false
      });
      return newSec;
    } catch (err: any) {
      console.error('Error creating section:', err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  updateSection: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('sections')
        .update({
          name: updates.name,
          slug: updates.slug,
          description: updates.description,
          display_order: updates.displayOrder,
          is_active: updates.isActive,
          icon: updates.icon,
          color: updates.color
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedSec: Section = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        displayOrder: data.display_order,
        isActive: data.is_active,
        icon: data.icon,
        color: data.color,
        createdAt: data.created_at
      };

      const sections = get().sections.map(sec => sec.id === id ? updatedSec : sec)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      set({ sections, isLoading: false });
      return updatedSec;
    } catch (err: any) {
      console.error('Error updating section:', err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  deleteSection: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({
        sections: get().sections.filter(sec => sec.id !== id),
        isLoading: false
      });
      return true;
    } catch (err: any) {
      console.error('Error deleting section:', err);
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  reorderSections: async (reorderedSections) => {
    set({ isLoading: true, error: null });
    try {
      // Perform updates concurrently
      const promises = reorderedSections.map((sec, index) => {
        return supabase
          .from('sections')
          .update({ display_order: index + 1 })
          .eq('id', sec.id);
      });

      const results = await Promise.all(promises);
      const error = results.find(res => res.error)?.error;
      if (error) throw error;

      const updatedSections = reorderedSections.map((sec, index) => ({
        ...sec,
        displayOrder: index + 1
      }));

      set({ sections: updatedSections, isLoading: false });
      return true;
    } catch (err: any) {
      console.error('Error reordering sections:', err);
      set({ error: err.message, isLoading: false });
      return false;
    }
  }
}));

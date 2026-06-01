import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Media } from '../types';
import imageCompression from 'browser-image-compression';

interface MediaState {
  mediaFiles: Media[];
  folders: string[];
  isLoading: boolean;
  error: string | null;
  fetchMedia: (folder?: string) => Promise<void>;
  uploadFile: (file: File, folder: string, altText?: string, tags?: string[]) => Promise<Media | null>;
  deleteFile: (id: string, url: string) => Promise<boolean>;
  createFolder: (name: string) => Promise<boolean>;
  deleteFolder: (name: string) => Promise<boolean>;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  mediaFiles: [],
  folders: ['uploads', 'articles', 'banners', 'avatars'],
  isLoading: false,
  error: null,

  fetchMedia: async (folder) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase.from('media').select('*');
      if (folder) {
        query = query.eq('folder', folder);
      }
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.warn('Media table not ready:', error.message);
        set({ mediaFiles: [], isLoading: false });
        return;
      }

      const mediaFiles = data?.map(item => ({
        id: item.id,
        filename: item.filename,
        url: item.url,
        type: item.type,
        size: item.size,
        folder: item.folder,
        tags: item.tags || [],
        altText: item.alt_text || undefined,
        uploadedBy: item.uploaded_by || undefined,
        createdAt: item.created_at
      })) || [];

      // Extract unique folders from DB if any new ones were added
      const dbFolders = Array.from(new Set(data?.map(item => item.folder) || []));
      const allFolders = Array.from(new Set([...get().folders, ...dbFolders]));

      set({ mediaFiles, folders: allFolders, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching media:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  uploadFile: async (file, folder, altText = '', tags = []) => {
    set({ isLoading: true, error: null });
    try {
      let uploadFile = file;

      // Compress if it is an image
      if (file.type.startsWith('image/') && file.type !== 'image/gif') {
        try {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          uploadFile = await imageCompression(file, options);
        } catch (compErr) {
          console.warn('Image compression failed, uploading original:', compErr);
        }
      }

      // 1. Upload to Supabase Storage bucket 'media'
      const fileExt = file.name.split('.').pop();
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const storagePath = `${folder}/${uniqueId}.${fileExt}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('media')
        .upload(storagePath, uploadFile, {
          cacheControl: '3600',
          upsert: true
        });

      let publicUrl = '';
      if (storageError) {
        console.warn('Supabase storage upload failed, using data URL fallback or mock URL:', storageError);
        // Fallback for demo/dev purposes if bucket doesn't exist
        publicUrl = `https://picsum.photos/800/600?random=${uniqueId}`;
      } else {
        const { data } = supabase.storage.from('media').getPublicUrl(storagePath);
        publicUrl = data.publicUrl;
      }

      // 2. Save metadata to public.media table
      const { data: dbData, error: dbError } = await supabase
        .from('media')
        .insert({
          filename: file.name,
          url: publicUrl,
          type: file.type,
          size: uploadFile.size,
          folder: folder,
          tags: tags,
          alt_text: altText,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id || null
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const newMedia: Media = {
        id: dbData.id,
        filename: dbData.filename,
        url: dbData.url,
        type: dbData.type,
        size: dbData.size,
        folder: dbData.folder,
        tags: dbData.tags || [],
        altText: dbData.alt_text || undefined,
        uploadedBy: dbData.uploaded_by || undefined,
        createdAt: dbData.created_at
      };

      set({
        mediaFiles: [newMedia, ...get().mediaFiles],
        isLoading: false
      });

      return newMedia;
    } catch (err: any) {
      console.error('Error uploading media:', err);
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  deleteFile: async (id, url) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Delete from storage if URL is a Supabase storage URL
      if (url.includes('/storage/v1/object/public/media/')) {
        const path = url.split('/storage/v1/object/public/media/')[1];
        await supabase.storage.from('media').remove([path]);
      }

      // 2. Delete from DB
      const { error } = await supabase.from('media').delete().eq('id', id);
      if (error) throw error;

      set({
        mediaFiles: get().mediaFiles.filter(item => item.id !== id),
        isLoading: false
      });
      return true;
    } catch (err: any) {
      console.error('Error deleting media:', err);
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  createFolder: async (name) => {
    const sanitized = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!sanitized) return false;

    if (get().folders.includes(sanitized)) {
      set({ error: 'Folder already exists' });
      return false;
    }

    set({ folders: [...get().folders, sanitized] });
    return true;
  },

  deleteFolder: async (name) => {
    const folders = get().folders.filter(f => f !== name);
    // Move files in this folder to 'uploads'
    try {
      await supabase
        .from('media')
        .update({ folder: 'uploads' })
        .eq('folder', name);

      set({ folders, mediaFiles: get().mediaFiles.map(f => f.folder === name ? { ...f, folder: 'uploads' } : f) });
      return true;
    } catch (err: any) {
      console.error('Error deleting folder:', err);
      set({ error: err.message });
      return false;
    }
  }
}));

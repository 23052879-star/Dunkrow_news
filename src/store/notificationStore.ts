import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addSystemNotification: (type: 'comment' | 'publish' | 'health' | 'alert', title: string, message: string) => Promise<void>;
  subscribeNotifications: () => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;
      if (!userId) {
        set({ isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Notifications table not ready:', error.message);
        set({ notifications: [], unreadCount: 0, isLoading: false });
        return;
      }

      const notifications: Notification[] = data?.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        isRead: item.is_read,
        userId: item.user_id,
        createdAt: item.created_at
      })) || [];

      const unreadCount = notifications.filter(n => !n.isRead).length;

      set({ notifications, unreadCount, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      const notifications = get().notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      );
      const unreadCount = notifications.filter(n => !n.isRead).length;

      set({ notifications, unreadCount });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;
      if (!userId) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      const notifications = get().notifications.map(n => ({ ...n, isRead: true }));
      set({ notifications, unreadCount: 0 });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  },

  addSystemNotification: async (type, title, message) => {
    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          type,
          title,
          message,
          user_id: userId,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      const newNotif: Notification = {
        id: data.id,
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: data.is_read,
        userId: data.user_id,
        createdAt: data.created_at
      };

      set({
        notifications: [newNotif, ...get().notifications],
        unreadCount: get().unreadCount + 1
      });
    } catch (err) {
      console.error('Error adding system notification:', err);
    }
  },

  subscribeNotifications: () => {
    const userRes = supabase.auth.getUser();
    let channel: any = null;

    userRes.then(({ data: { user } }) => {
      if (!user) return;

      channel = supabase
        .channel(`public:notifications:user_id=eq.${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const item = payload.new;
            const newNotif: Notification = {
              id: item.id,
              type: item.type,
              title: item.title,
              message: item.message,
              isRead: item.is_read,
              userId: item.user_id,
              createdAt: item.created_at
            };

            set((state) => ({
              notifications: [newNotif, ...state.notifications],
              unreadCount: state.unreadCount + 1
            }));
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }
}));

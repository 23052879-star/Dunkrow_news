export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          excerpt: string
          featured_image: string
          category: string
          category_id: string | null
          author_id: string
          published: boolean
          slug: string
          section_id: string | null
          seo_title: string | null
          meta_description: string | null
          canonical_url: string | null
          og_image: string | null
          scheduled_at: string | null
          status: 'draft' | 'published' | 'scheduled' | 'archived'
          version: number
          auto_save_content: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          excerpt: string
          featured_image: string
          category: string
          category_id?: string | null
          author_id: string
          published?: boolean
          slug: string
          section_id?: string | null
          seo_title?: string | null
          meta_description?: string | null
          canonical_url?: string | null
          og_image?: string | null
          scheduled_at?: string | null
          status?: 'draft' | 'published' | 'scheduled' | 'archived'
          version?: number
          auto_save_content?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          excerpt?: string
          featured_image?: string
          category?: string
          category_id?: string | null
          author_id?: string
          published?: boolean
          slug?: string
          section_id?: string | null
          seo_title?: string | null
          meta_description?: string | null
          canonical_url?: string | null
          og_image?: string | null
          scheduled_at?: string | null
          status?: 'draft' | 'published' | 'scheduled' | 'archived'
          version?: number
          auto_save_content?: string | null
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          article_id: string
          user_id: string
          content: string
          approved: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          article_id: string
          user_id: string
          content: string
          approved?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          article_id?: string
          user_id?: string
          content?: string
          approved?: boolean
        }
      }
      whispers: {
        Row: {
          id: string
          created_at: string
          title: string
          content: string
          featured_image: string
          published: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          content: string
          featured_image: string
          published?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          content?: string
          featured_image?: string
          published?: boolean
        }
      }
      jokes_trivia: {
        Row: {
          id: string
          created_at: string
          content: string
          type: 'joke' | 'trivia'
          published: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          type: 'joke' | 'trivia'
          published?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          type?: 'joke' | 'trivia'
          published?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          username: string
          avatar_url: string
          role: 'admin' | 'editor' | 'reporter' | 'contributor' | 'user'
          banned: boolean
          bio: string | null
          website: string | null
          location: string | null
          updated_at: string
        }
        Insert: {
          id: string
          created_at?: string
          username: string
          avatar_url?: string
          role?: 'admin' | 'editor' | 'reporter' | 'contributor' | 'user'
          banned?: boolean
          bio?: string | null
          website?: string | null
          location?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          username?: string
          avatar_url?: string
          role?: 'admin' | 'editor' | 'reporter' | 'contributor' | 'user'
          banned?: boolean
          bio?: string | null
          website?: string | null
          location?: string | null
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          display_order: number
          is_active: boolean
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          icon?: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          icon?: string
          color?: string
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
      }
      media: {
        Row: {
          id: string
          filename: string
          url: string
          type: string
          size: number
          folder: string
          tags: string[]
          alt_text: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          url: string
          type: string
          size: number
          folder?: string
          tags?: string[]
          alt_text?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          url?: string
          type?: string
          size?: number
          folder?: string
          tags?: string[]
          alt_text?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
      }
      advertisements: {
        Row: {
          id: string
          title: string
          type: 'banner' | 'sidebar' | 'in-article' | 'sponsored'
          image_url: string
          target_url: string
          position: string
          is_active: boolean
          impressions: number
          clicks: number
          start_date: string | null
          end_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          type: 'banner' | 'sidebar' | 'in-article' | 'sponsored'
          image_url: string
          target_url: string
          position?: string
          is_active?: boolean
          impressions?: integer
          clicks?: integer
          start_date?: string | null
          end_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: 'banner' | 'sidebar' | 'in-article' | 'sponsored'
          image_url?: string
          target_url?: string
          position?: string
          is_active?: boolean
          impressions?: number
          clicks?: number
          start_date?: string | null
          end_date?: string | null
          created_at?: string
        }
      }
      polls: {
        Row: {
          id: string
          question: string
          options: Json
          is_active: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          question: string
          options?: Json
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          question?: string
          options?: Json
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          type: 'comment' | 'publish' | 'health' | 'alert'
          title: string
          message: string
          is_read: boolean
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          type: 'comment' | 'publish' | 'health' | 'alert'
          title: string
          message: string
          is_read?: boolean
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'comment' | 'publish' | 'health' | 'alert'
          title?: string
          message?: string
          is_read?: boolean
          user_id?: string
          created_at?: string
        }
      }
      article_analytics: {
        Row: {
          id: string
          article_id: string
          views: number
          shares: number
          avg_read_time: number
          date: string
        }
        Insert: {
          id?: string
          article_id: string
          views?: number
          shares?: number
          avg_read_time?: number
          date?: string
        }
        Update: {
          id?: string
          article_id?: string
          views?: number
          shares?: number
          avg_read_time?: number
          date?: string
        }
      }
      homepage_config: {
        Row: {
          id: string
          section_order: Json
          pinned_articles: Json
          featured_article_id: string | null
          breaking_news: string | null
          editors_picks: Json
          updated_at: string
        }
        Insert: {
          id: string
          section_order?: Json
          pinned_articles?: Json
          featured_article_id?: string | null
          breaking_news?: string | null
          editors_picks?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          section_order?: Json
          pinned_articles?: Json
          featured_article_id?: string | null
          breaking_news?: string | null
          editors_picks?: Json
          updated_at?: string
        }
      }
      newsletter_subscriptions: {
        Row: {
          id: string
          email: string
          subscribed_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string
          is_active?: boolean
        }
      }
    }
  }
}
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
          author_id: string
          published: boolean
          slug: string
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
          author_id: string
          published?: boolean
          slug: string
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
          author_id?: string
          published?: boolean
          slug?: string
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
          role: 'admin' | 'user'
        }
        Insert: {
          id: string
          created_at?: string
          username: string
          avatar_url?: string
          role?: 'admin' | 'user'
        }
        Update: {
          id?: string
          created_at?: string
          username?: string
          avatar_url?: string
          role?: 'admin' | 'user'
        }
      }
    }
  }
}
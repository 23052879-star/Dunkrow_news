/**
 * Buffer GraphQL API integration for Dunkrow.
 *
 * Invokes the Supabase Edge Function that queues a formatted social media
 * update to every configured Buffer channel when an article is published.
 */

import { supabase } from './supabase';

export interface BufferArticle {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  featuredImage?: string;
}

/**
 * Queue a published article to every configured Buffer channel.
 *
 * Returns the Edge Function response, or throws when the function reports a
 * failure. Buffer credentials remain server-side in Supabase secrets.
 */
export async function postToBuffer(
  article: BufferArticle
): Promise<{ ok?: boolean; skipped?: boolean; posts?: Record<string, string>; error?: string }> {
  const { data, error } = await supabase.functions.invoke('post-to-buffer', {
    body: {
      record: {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        featured_image: article.featuredImage,
        category: article.category,
        slug: article.slug,
        published: true,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (data?.ok === false) {
    throw new Error(data.error ?? 'Buffer post failed');
  }

  return data ?? {};
}

/** Returns true because Buffer credentials are managed by Supabase secrets. */
export function isBufferConfigured(): boolean {
  return true;
}

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

/** How long to wait for the edge function before giving up (ms). */
const BUFFER_TIMEOUT_MS = 10_000;

/**
 * Queue a published article to every configured Buffer channel.
 *
 * Returns the Edge Function response. Never throws — callers always get
 * a result object so a Buffer failure can never cascade into the UI.
 */
export async function postToBuffer(
  article: BufferArticle
): Promise<{ ok?: boolean; skipped?: boolean; posts?: Record<string, string>; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BUFFER_TIMEOUT_MS);

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

    clearTimeout(timeout);

    if (error) {
      console.warn('[Buffer] Edge function error:', error);
      return { ok: false, error: String(error.message ?? error) };
    }

    if (data?.ok === false) {
      console.warn('[Buffer] Post failed:', data.error);
      return { ok: false, error: data.error ?? 'Buffer post failed' };
    }

    return data ?? {};
  } catch (err: any) {
    // Catch everything — network errors, timeouts, unexpected exceptions.
    // A Buffer failure must NEVER break the rest of the app.
    const message = err?.name === 'AbortError'
      ? 'Buffer request timed out'
      : (err?.message ?? 'Unknown Buffer error');
    console.warn('[Buffer] postToBuffer caught:', message);
    return { ok: false, error: message };
  }
}

/** Returns true because Buffer credentials are managed by Supabase secrets. */
export function isBufferConfigured(): boolean {
  return true;
}


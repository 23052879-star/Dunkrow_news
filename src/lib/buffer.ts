/**
 * Buffer GraphQL API integration for Dunkrow.
 *
 * Posts a formatted social media update to every configured Buffer channel
 * when an article is published from the admin panel.
 */

const BUFFER_API_KEY = import.meta.env.VITE_BUFFER_API_KEY ?? '';
const CHANNEL_IDS = (import.meta.env.VITE_BUFFER_CHANNEL_IDS ?? '')
  .split(',')
  .map((id: string) => id.trim())
  .filter(Boolean);
const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://www.dunkrow.in').replace(/\/$/, '');

export interface BufferArticle {
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  featuredImage?: string;
}

function buildPostText(article: BufferArticle): string {
  const url = `${SITE_URL}/article/${article.slug}`;
  const tags = [
    '#Dunkrow',
    article.category ? `#${article.category.replace(/\s+/g, '')}` : '#News',
  ];

  return [
    article.title,
    '',
    article.excerpt,
    '',
    `Read more: ${url}`,
    '',
    tags.join(' '),
  ]
    .join('\n')
    .trim();
}

async function createBufferPost(
  channelId: string,
  article: BufferArticle
): Promise<{ id: string; channelId: string }> {
  const query = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post {
            id
            dueAt
            channelId
          }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;

  const assets = article.featuredImage
    ? [{ image: { url: article.featuredImage } }]
    : [];

  const response = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${BUFFER_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          text: buildPostText(article),
          channelId,
          schedulingType: 'automatic',
          mode: 'addToQueue',
          assets,
        },
      },
    }),
  });

  const data = await response.json();
  const result = data?.data?.createPost;

  if (!response.ok || data.errors?.length || result?.message) {
    throw new Error(
      result?.message ?? data.errors?.[0]?.message ?? 'Buffer post failed'
    );
  }

  return result.post;
}

/**
 * Queue a published article to every configured Buffer channel.
 *
 * Returns an object mapping channelId → Buffer post id for each
 * successfully created post, or throws on the first failure.
 */
export async function postToBuffer(
  article: BufferArticle
): Promise<Record<string, string>> {
  if (!BUFFER_API_KEY) {
    console.warn('[Buffer] No VITE_BUFFER_API_KEY configured — skipping.');
    return {};
  }

  if (!CHANNEL_IDS.length) {
    console.warn('[Buffer] No VITE_BUFFER_CHANNEL_IDS configured — skipping.');
    return {};
  }

  console.log(
    `[Buffer] Queuing "${article.title}" to ${CHANNEL_IDS.length} channel(s)…`
  );

  const posts: Record<string, string> = {};

  for (const channelId of CHANNEL_IDS) {
    try {
      const post = await createBufferPost(channelId, article);
      posts[channelId] = post.id;
      console.log(`[Buffer] ✓ Queued to channel ${channelId} → post ${post.id}`);
    } catch (err) {
      console.error(`[Buffer] ✗ Failed for channel ${channelId}:`, err);
      throw err; // re-throw so caller knows it failed
    }
  }

  return posts;
}

/** Returns true when Buffer credentials are present. */
export function isBufferConfigured(): boolean {
  return Boolean(BUFFER_API_KEY && CHANNEL_IDS.length);
}

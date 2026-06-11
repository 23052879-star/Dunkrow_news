type ArticleRecord = {
  id: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  category: string | null;
  slug: string;
  published: boolean;
  social_posted_at?: string | null;
  social_post_ids?: Record<string, string> | null;
  social_post_attempt_count?: number | null;
  social_post_next_retry_at?: string | null;
};

type WebhookPayload = {
  type?: string;
  record?: ArticleRecord;
  old_record?: ArticleRecord;
};

type BufferChannel = {
  id: string;
  service: string;
};

const bufferApiKey = Deno.env.get('BUFFER_API_KEY') ?? '';
const channelIds = (Deno.env.get('BUFFER_CHANNEL_IDS') ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);
const siteUrl = (Deno.env.get('SITE_URL') ?? 'https://www.dunkrow.in').replace(/\/$/, '');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  ?? Deno.env.get('SB_SERVICE_ROLE_KEY')
  ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function postText(article: ArticleRecord) {
  const url = `${siteUrl}/article/${article.slug}`;
  const tags = ['#Dunkrow', article.category ? `#${article.category.replace(/\s+/g, '')}` : '#News'];

  return [
    article.title,
    '',
    article.excerpt,
    '',
    `Read more: ${url}`,
    '',
    tags.join(' '),
  ].join('\n').trim();
}

function isRateLimitError(message: string) {
  return /too many requests|rate limit|rate-limit|429/i.test(message);
}

function nextRetryAt(message: string, attemptCount: number) {
  const minutes = isRateLimitError(message)
    ? Math.min(240, 60 * Math.max(1, attemptCount))
    : Math.min(60, 15 * Math.max(1, attemptCount));

  return new Date(Date.now() + minutes * 60_000).toISOString();
}

async function bufferGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const response = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bufferApiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : {};

  if (!response.ok || data.errors?.length) {
    throw new Error(data.errors?.[0]?.message ?? `Buffer request failed (${response.status})`);
  }

  return data.data as T;
}

async function fetchArticle(id: string): Promise<ArticleRecord | null> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/articles?id=eq.${id}&select=id,title,excerpt,featured_image,category,slug,published,social_posted_at,social_post_ids,social_post_attempt_count,social_post_next_retry_at`,
    {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch article social status: ${await response.text()}`);
  }

  const rows = await response.json() as ArticleRecord[];
  return rows[0] ?? null;
}

async function fetchChannel(channelId: string): Promise<BufferChannel> {
  const query = `
    query GetChannel($id: ChannelId!) {
      channel(input: { id: $id }) {
        id
        service
      }
    }
  `;

  const data = await bufferGraphql<{ channel: BufferChannel }>(query, { id: channelId });
  return data.channel;
}

function metadataForService(service: string) {
  const typeMetadata = { type: 'post' };
  const normalizedService = service.toLowerCase();

  switch (normalizedService) {
    case 'instagram':
      return {
        instagram: {
          ...typeMetadata,
          shouldShareToFeed: true,
        },
      };
    case 'facebook':
      return { facebook: typeMetadata };
    case 'threads':
      return { threads: typeMetadata };
    case 'tiktok':
      return { tiktok: typeMetadata };
    case 'mastodon':
    case 'twitter':
    case 'x':
    case 'linkedin':
    case 'bluesky':
    default:
      return undefined;
  }
}

/**
 * Call the generate-social-image Edge Function to produce a branded
 * template image for the article.  Returns the public URL of the PNG
 * or null if generation fails (we fall back to the raw featured_image).
 */
async function generateSocialImage(article: ArticleRecord): Promise<string | null> {
  try {
    const fnUrl = `${supabaseUrl}/functions/v1/generate-social-image`;
    const res = await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        featured_image: article.featured_image,
        slug: article.slug,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('generate-social-image failed:', res.status, text);
      return null;
    }

    const data = await res.json() as { ok: boolean; url?: string };
    return data.url ?? null;
  } catch (err) {
    console.error('generate-social-image error:', err);
    return null;
  }
}

async function createBufferPost(channelId: string, article: ArticleRecord, socialImageUrl?: string | null) {
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

  // Prefer the generated template image; fall back to the raw featured image
  const imageUrl = socialImageUrl || article.featured_image;
  const assets = imageUrl
    ? [{ image: { url: imageUrl } }]
    : [];

  const channel = await fetchChannel(channelId);
  const metadata = metadataForService(channel.service);
  const input = {
    text: postText(article),
    channelId,
    schedulingType: 'automatic',
    mode: 'addToQueue',
    ...(metadata ? { metadata } : {}),
    assets,
  };

  const data = await bufferGraphql<{ createPost: { message?: string; post?: { id: string } } }>(
    query,
    { input },
  );
  const result = data.createPost;
  if (result?.message || !result?.post) {
    throw new Error(result?.message ?? 'Buffer post failed');
  }

  return result.post;
}

async function updateArticle(id: string, body: Record<string, unknown>) {
  const response = await fetch(`${supabaseUrl}/rest/v1/articles?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to update article social status: ${await response.text()}`);
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  let articleForError: ArticleRecord | undefined;

  try {
    if (!bufferApiKey || !channelIds.length || !supabaseUrl || !serviceRoleKey) {
      const missing = [
        !bufferApiKey && 'BUFFER_API_KEY',
        !channelIds.length && 'BUFFER_CHANNEL_IDS',
        !supabaseUrl && 'SUPABASE_URL',
        !serviceRoleKey && 'SUPABASE_SERVICE_ROLE_KEY',
      ].filter(Boolean);

      throw new Error(`Missing required secrets: ${missing.join(', ')}`);
    }

    const payload = await request.json() as WebhookPayload;
    const payloadArticle = payload.record;

    if (!payloadArticle?.id) {
      return Response.json({ skipped: true }, { headers: corsHeaders });
    }

    const article = await fetchArticle(payloadArticle.id);
    articleForError = article ?? payloadArticle;

    if (!article?.published || article.social_posted_at) {
      return Response.json({ skipped: true }, { headers: corsHeaders });
    }

    if (
      article.social_post_next_retry_at
      && new Date(article.social_post_next_retry_at).getTime() > Date.now()
    ) {
      return Response.json({
        skipped: true,
        nextRetryAt: article.social_post_next_retry_at,
      }, { headers: corsHeaders });
    }

    if (!article.title || !article.slug) {
      throw new Error('Article is missing title or slug');
    }

    const attemptCount = (article.social_post_attempt_count ?? 0) + 1;
    await updateArticle(article.id, {
      social_post_attempted_at: new Date().toISOString(),
      social_post_attempt_count: attemptCount,
      social_post_next_retry_at: null,
    });

    // Generate the branded template image before posting to any channel
    const socialImageUrl = await generateSocialImage(article);
    if (socialImageUrl) {
      console.log('Generated social image:', socialImageUrl);
    } else {
      console.warn('Social image generation failed, falling back to raw featured image');
    }

    const posts: Record<string, string> = article.social_post_ids ?? {};
    for (const channelId of channelIds) {
      if (posts[channelId]) {
        continue;
      }

      const post = await createBufferPost(channelId, article, socialImageUrl);
      posts[channelId] = post.id;

      await updateArticle(article.id, {
        social_post_ids: posts,
        social_post_error: null,
      });
    }

    await updateArticle(article.id, {
      social_posted_at: new Date().toISOString(),
      social_post_ids: posts,
      social_post_error: null,
      social_post_next_retry_at: null,
    });

    return Response.json({ ok: true, posts }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (articleForError?.id && supabaseUrl && serviceRoleKey) {
      try {
        const attemptCount = articleForError.social_post_attempt_count ?? 1;
        await updateArticle(articleForError.id, {
          social_post_error: message,
          social_post_next_retry_at: nextRetryAt(message, attemptCount),
        });
      } catch (statusError) {
        console.error('Failed to record Buffer error:', statusError);
      }
    }

    return Response.json({ ok: false, error: message }, { status: 500, headers: corsHeaders });
  }
});

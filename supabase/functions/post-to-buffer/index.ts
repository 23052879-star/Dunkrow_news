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
};

type WebhookPayload = {
  type?: string;
  record?: ArticleRecord;
  old_record?: ArticleRecord;
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(message: string) {
  return /too many requests|rate limit|rate-limit|429/i.test(message);
}

async function fetchArticle(id: string): Promise<ArticleRecord | null> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/articles?id=eq.${id}&select=id,title,excerpt,featured_image,category,slug,published,social_posted_at,social_post_ids`,
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

async function createBufferPost(channelId: string, article: ArticleRecord) {
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

  const assets = article.featured_image
    ? [{ image: { url: article.featured_image } }]
    : [];

  const response = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bufferApiKey}`,
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          text: postText(article),
          channelId,
          schedulingType: 'automatic',
          mode: 'addToQueue',
          assets,
        },
      },
    }),
  });

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : {};
  const result = data?.data?.createPost;
  if (!response.ok || data.errors?.length || result?.message) {
    throw new Error(result?.message ?? data.errors?.[0]?.message ?? `Buffer post failed (${response.status})`);
  }

  return result.post;
}

async function createBufferPostWithRetry(channelId: string, article: ArticleRecord) {
  const delays = [1_500, 5_000, 15_000];
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try {
      return await createBufferPost(channelId, article);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Buffer post failed');
      if (!isRateLimitError(lastError.message) || attempt === delays.length) {
        throw lastError;
      }

      await sleep(delays[attempt]);
    }
  }

  throw lastError ?? new Error('Buffer post failed');
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

    if (!article.title || !article.slug) {
      throw new Error('Article is missing title or slug');
    }

    const posts: Record<string, string> = article.social_post_ids ?? {};
    for (const channelId of channelIds) {
      if (posts[channelId]) {
        continue;
      }

      const post = await createBufferPostWithRetry(channelId, article);
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
    });

    return Response.json({ ok: true, posts }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (articleForError?.id && supabaseUrl && serviceRoleKey) {
      try {
        await updateArticle(articleForError.id, { social_post_error: message });
      } catch (statusError) {
        console.error('Failed to record Buffer error:', statusError);
      }
    }

    return Response.json({ ok: false, error: message }, { status: 500, headers: corsHeaders });
  }
});

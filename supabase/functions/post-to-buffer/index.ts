type ArticleRecord = {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string;
  category: string;
  slug: string;
  published: boolean;
  social_posted_at?: string | null;
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
const serviceRoleKey = Deno.env.get('SB_SERVICE_ROLE_KEY') ?? '';

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

  const data = await response.json();
  const result = data?.data?.createPost;
  if (!response.ok || data.errors?.length || result?.message) {
    throw new Error(result?.message ?? data.errors?.[0]?.message ?? 'Buffer post failed');
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

  try {
    if (!bufferApiKey || !channelIds.length || !supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required secrets');
    }

    const payload = await request.json() as WebhookPayload;
    const article = payload.record;

    if (!article?.id || !article.published || article.social_posted_at) {
      return Response.json({ skipped: true }, { headers: corsHeaders });
    }

    if (!article.title || !article.slug) {
      throw new Error('Article is missing title or slug');
    }

    const posts: Record<string, string> = {};
    for (const channelId of channelIds) {
      const post = await createBufferPost(channelId, article);
      posts[channelId] = post.id;
    }

    await updateArticle(article.id, {
      social_posted_at: new Date().toISOString(),
      social_post_ids: posts,
      social_post_error: null,
    });

    return Response.json({ ok: true, posts }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ ok: false, error: message }, { status: 500, headers: corsHeaders });
  }
});

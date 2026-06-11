/**
 * generate-social-image
 *
 * Accepts article data (title, excerpt, category, featured_image) and
 * renders a branded Dunk Row social-media card matching the editorial
 * template the user designed.  The resulting PNG is uploaded to the
 * `social-images` Supabase Storage bucket and its public URL is returned.
 *
 * Stack: Satori (HTML→SVG) + resvg-wasm (SVG→PNG)
 */

// @deno-types="npm:satori@0.10.14"
import satori from 'npm:satori@0.10.14';
import { initWasm, Resvg } from 'npm:@resvg/resvg-wasm@2.6.2';
// deno-lint-ignore no-unused-vars
import React from 'npm:react@18.2.0';

/* ------------------------------------------------------------------ */
/*  Environment                                                        */
/* ------------------------------------------------------------------ */

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
  Deno.env.get('SB_SERVICE_ROLE_KEY') ??
  '';
const siteUrl = (Deno.env.get('SITE_URL') ?? 'https://www.dunkrow.in').replace(
  /\/$/,
  '',
);

const BUCKET = 'social-images';
const WIDTH = 1080;
const HEIGHT = 1080;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

/* ------------------------------------------------------------------ */
/*  One-time initialisations                                           */
/* ------------------------------------------------------------------ */

let resvgReady = false;

async function ensureResvg() {
  if (resvgReady) return;
  const wasmUrl = 'https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm';
  const wasmResponse = await fetch(wasmUrl);
  const wasmBytes = new Uint8Array(await wasmResponse.arrayBuffer());
  await initWasm(wasmBytes);
  resvgReady = true;
}

/** Fetch the Inter font from Google Fonts (two weights). */
async function loadFonts() {
  const [regular, bold] = await Promise.all([
    fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2',
    ).then((r) => r.arrayBuffer()),
    fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7.woff2',
    ).then((r) => r.arrayBuffer()),
  ]);

  return [
    { name: 'Inter', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: bold, weight: 700 as const, style: 'normal' as const },
  ];
}

/* ------------------------------------------------------------------ */
/*  Image helpers                                                      */
/* ------------------------------------------------------------------ */

/**
 * Fetch an image and return it as a base-64 data-URI so Satori can
 * embed it directly.
 */
async function imageToDataUri(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return '';
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const b64 = btoa(
      new Uint8Array(buf).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        '',
      ),
    );
    return `data:${contentType};base64,${b64}`;
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------------ */
/*  The Dunk Row logo SVG (matches public/logo.svg)                    */
/* ------------------------------------------------------------------ */

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>`;

/* ------------------------------------------------------------------ */
/*  Template renderer (Satori JSX-like)                                */
/* ------------------------------------------------------------------ */

function buildTemplate(article: {
  title: string;
  excerpt: string | null;
  category: string | null;
  featuredImageDataUri: string;
}) {
  const category = article.category || 'Breaking News';

  // Truncate title to ~80 chars, excerpt to ~120 chars for clean layout
  const title =
    article.title.length > 80
      ? article.title.slice(0, 77) + '...'
      : article.title;
  const excerpt = article.excerpt
    ? article.excerpt.length > 120
      ? article.excerpt.slice(0, 117) + '...'
      : article.excerpt
    : '';

  // Build the full JSX tree for Satori
  return {
    type: 'div',
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        fontFamily: 'Inter',
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
      },
      children: [
        // ---- Background featured image (full 100%) ----
        article.featuredImageDataUri
          ? {
              type: 'img',
              props: {
                src: article.featuredImageDataUri,
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: WIDTH,
                  height: HEIGHT,
                  objectFit: 'cover',
                },
              },
            }
          : {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: WIDTH,
                  height: HEIGHT,
                  background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                },
              },
            },

        // ---- Red gradient overlay on the entire bottom half ----
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: WIDTH,
              height: Math.round(HEIGHT * 0.6),
              background:
                'linear-gradient(to bottom, rgba(180,0,0,0) 0%, rgba(180,0,0,0.85) 40%, rgba(180,0,0,0.95) 100%)',
            },
          },
        },

        // ---- Red vertical accent bar (right edge) ----
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              right: 0,
              width: 8,
              height: HEIGHT,
              backgroundColor: '#ff2d2d',
            },
          },
        },

        // ---- Logo section (top-left) ----
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 40,
              left: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            },
            children: [
              {
                type: 'img',
                props: {
                  src: `data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}`,
                  width: 36,
                  height: 36,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    lineHeight: 1.1,
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          color: 'white',
                          fontSize: 22,
                          fontWeight: 700,
                          letterSpacing: 1,
                        },
                        children: 'Dunk',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          color: 'white',
                          fontSize: 22,
                          fontWeight: 700,
                          letterSpacing: 1,
                        },
                        children: 'Row',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // ---- Decorative dots (top-right) ----
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 40,
              right: 30,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            },
            children: [0, 1, 2].map((row) => ({
              type: 'div',
              props: {
                style: { display: 'flex', gap: 6 },
                children: [0, 1, 2, 3, 4].map((col) => ({
                  type: 'div',
                  props: {
                    key: `dot-${row}-${col}`,
                    style: {
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.5)',
                    },
                  },
                })),
              },
            })),
          },
        },

        // ---- Category badge ----
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: Math.round(HEIGHT * 0.54),
              left: 0,
              width: WIDTH,
              display: 'flex',
              justifyContent: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    backgroundColor: '#fff5e6',
                    color: '#cc0000',
                    fontSize: 20,
                    fontWeight: 700,
                    paddingLeft: 28,
                    paddingRight: 28,
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderRadius: 30,
                    letterSpacing: 0.5,
                  },
                  children: category,
                },
              },
            ],
          },
        },

        // ---- Title ----
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: Math.round(HEIGHT * 0.62),
              left: 60,
              right: 60,
              display: 'flex',
              justifyContent: 'center',
              textAlign: 'center',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    color: 'white',
                    fontSize: 42,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    textAlign: 'center',
                  },
                  children: title,
                },
              },
            ],
          },
        },

        // ---- Excerpt ----
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: Math.round(HEIGHT * 0.76),
              left: 80,
              right: 80,
              display: 'flex',
              justifyContent: 'center',
              textAlign: 'center',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: 22,
                    fontWeight: 400,
                    lineHeight: 1.4,
                    textAlign: 'center',
                  },
                  children: excerpt,
                },
              },
            ],
          },
        },

        // ---- Gold divider line ----
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: 100,
              left: 60,
              right: 60,
              height: 2,
              background:
                'linear-gradient(to right, transparent, #d4a843, transparent)',
            },
          },
        },

        // ---- Footer ----
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: 40,
              left: 60,
              right: 60,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 700,
                  },
                  children: 'Read More  →',
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 18,
                    fontWeight: 400,
                  },
                  children: 'Source : www.dunkrow.in',
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Upload helper                                                      */
/* ------------------------------------------------------------------ */

async function uploadToStorage(
  pngBytes: Uint8Array,
  filename: string,
): Promise<string> {
  const path = `${filename}`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/png',
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'x-upsert': 'true',
    },
    body: pngBytes,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Storage upload failed (${res.status}): ${body}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}

/* ------------------------------------------------------------------ */
/*  Handler                                                            */
/* ------------------------------------------------------------------ */

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = (await request.json()) as {
      id: string;
      title: string;
      excerpt?: string | null;
      category?: string | null;
      featured_image?: string | null;
      slug: string;
    };

    if (!body.title || !body.slug) {
      return Response.json(
        { error: 'title and slug are required' },
        { status: 400, headers: corsHeaders },
      );
    }

    // 1. Initialise resvg WASM (once per cold-start)
    await ensureResvg();

    // 2. Load fonts
    const fonts = await loadFonts();

    // 3. Convert the featured image to a data URI so Satori can embed it
    const featuredImageDataUri = body.featured_image
      ? await imageToDataUri(body.featured_image)
      : '';

    // 4. Build the Satori element tree
    const element = buildTemplate({
      title: body.title,
      excerpt: body.excerpt ?? null,
      category: body.category ?? null,
      featuredImageDataUri,
    });

    // 5. Render to SVG
    const svg = await satori(element, {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    });

    // 6. Convert SVG → PNG with resvg
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: WIDTH },
    });
    const pngData = resvg.render();
    const pngBytes = pngData.asPng();

    // 7. Upload to Supabase Storage
    const filename = `${body.id || body.slug}-${Date.now()}.png`;
    const publicUrl = await uploadToStorage(pngBytes, filename);

    return Response.json(
      { ok: true, url: publicUrl },
      { headers: corsHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('generate-social-image error:', message);
    return Response.json(
      { ok: false, error: message },
      { status: 500, headers: corsHeaders },
    );
  }
});

# Dunkrow Buffer Automation

This Supabase Edge Function queues newly published Dunkrow articles in Buffer.

## Required Supabase secrets

```sh
supabase secrets set BUFFER_API_KEY="your_buffer_api_key"
supabase secrets set BUFFER_CHANNEL_IDS="6a1dbdc0c687a22dd44c3e77,6a1dbe0bc687a22dd44c405c,6a1dbe20c687a22dd44c40d2"
supabase secrets set SITE_URL="https://www.dunkrow.in"
supabase secrets set SB_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

Supabase provides `SUPABASE_URL` automatically. `SB_SERVICE_ROLE_KEY` should be
your project service role key from Project Settings > API. Keep it private.

## Deploy

```sh
supabase functions deploy post-to-buffer
```

## Webhook

Create a Supabase Database Webhook:

- Table: `articles`
- Events: `INSERT` and `UPDATE`
- URL: your deployed `post-to-buffer` Edge Function URL

The function ignores unpublished articles and articles that already have
`social_posted_at`.

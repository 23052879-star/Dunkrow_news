# Dunkrow Buffer Automation

This Supabase Edge Function queues newly published Dunkrow articles in Buffer.

## Required Supabase secrets

```sh
supabase secrets set BUFFER_API_KEY="your_buffer_api_key"
supabase secrets set BUFFER_CHANNEL_IDS="6a1dbdc0c687a22dd44c3e77,6a1dbe0bc687a22dd44c405c,6a1dbe20c687a22dd44c40d2"
supabase secrets set SITE_URL="https://www.dunkrow.in"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

Supabase provides `SUPABASE_URL` automatically. `SUPABASE_SERVICE_ROLE_KEY`
should be your project service role key from Project Settings > API. Keep it
private. The function also accepts the older `SB_SERVICE_ROLE_KEY` name.

## Deploy

```sh
supabase functions deploy post-to-buffer
```

This function is called by the database trigger added in
`supabase/migrations/20260605120000_article_buffer_webhook.sql`, so JWT
verification must stay disabled. The repo includes this setting in
`supabase/config.toml`:

```toml
[functions.post-to-buffer]
verify_jwt = false
```

The trigger ignores unpublished articles and the function ignores articles
that already have `social_posted_at`.

/*
  # Create social-images storage bucket

  A public bucket to store dynamically generated social media images
  that are attached to Buffer posts.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('social-images', 'social-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read images (they are public social cards)
CREATE POLICY "Public read access for social images"
ON storage.objects FOR SELECT
USING (bucket_id = 'social-images');

-- Allow the service role (edge functions) to insert images
CREATE POLICY "Service role can upload social images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'social-images');

-- Allow the service role to delete old images
CREATE POLICY "Service role can delete social images"
ON storage.objects FOR DELETE
USING (bucket_id = 'social-images');

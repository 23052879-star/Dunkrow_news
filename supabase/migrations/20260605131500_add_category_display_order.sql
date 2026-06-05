/*
  # Add category display ordering

  Some deployed clients order categories by display_order. Keep the column in
  the database so category reads remain compatible across frontend deploys.
*/

ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS display_order integer;

WITH ordered_categories AS (
  SELECT
    id,
    row_number() OVER (
      ORDER BY
        CASE lower(slug)
          WHEN 'politics' THEN 1
          WHEN 'technology' THEN 2
          WHEN 'business' THEN 3
          WHEN 'sports' THEN 4
          WHEN 'entertainment' THEN 5
          WHEN 'science' THEN 6
          WHEN 'health' THEN 7
          ELSE 100
        END,
        name
    ) AS sort_order
  FROM public.categories
)
UPDATE public.categories
SET display_order = ordered_categories.sort_order
FROM ordered_categories
WHERE categories.id = ordered_categories.id
  AND categories.display_order IS NULL;

ALTER TABLE public.categories
ALTER COLUMN display_order SET DEFAULT 100;

-- Remove seeded star scores for curated templates until a real reviews pipeline exists.
-- Download counts and word counts remain the primary engagement signals in the UI.

UPDATE public.library_documents
SET rating = 0
WHERE COALESCE(source, 'curated') = 'curated';

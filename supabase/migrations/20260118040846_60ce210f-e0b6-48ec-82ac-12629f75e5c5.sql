-- Enable realtime for projects table (check if exists first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chapters'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chapters;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'quality_scores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quality_scores;
  END IF;
END $$;
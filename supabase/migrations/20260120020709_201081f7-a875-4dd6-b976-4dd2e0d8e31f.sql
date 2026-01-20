-- chapters table - 15 new columns
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS analysis_stories JSONB;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS analysis_quotes JSONB;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS outline TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS sections JSONB;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS final_text TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS takeaways TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS examples JSONB;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS reading_level TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS originality_score NUMERIC(3,2);
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS phase_1_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS phase_2_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS phase_3_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS phase_4_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS phase_5_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS phase_6_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS phase_7_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS phase_8_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS phase_9_complete BOOLEAN DEFAULT FALSE;

-- tactics table - 3 new columns
ALTER TABLE public.tactics ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE public.tactics ADD COLUMN IF NOT EXISTS used_in_chapters JSONB;
ALTER TABLE public.tactics ADD COLUMN IF NOT EXISTS duplicate_of UUID REFERENCES public.tactics(id);

-- diagrams table - 2 new columns
ALTER TABLE public.diagrams ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.diagrams ADD COLUMN IF NOT EXISTS render_valid BOOLEAN DEFAULT FALSE;

-- issues table - 2 new columns
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS flagged_by TEXT;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS resolved_by TEXT;

-- glossary table - 1 new column
ALTER TABLE public.glossary ADD COLUMN IF NOT EXISTS introduced_in_chapter UUID REFERENCES public.chapters(id);

-- pipeline_logs table - 1 new column
ALTER TABLE public.pipeline_logs ADD COLUMN IF NOT EXISTS details JSONB;
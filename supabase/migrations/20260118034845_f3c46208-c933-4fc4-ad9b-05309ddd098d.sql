-- Update chapters table with remaining columns
ALTER TABLE public.chapters ADD COLUMN original_text TEXT;
ALTER TABLE public.chapters ADD COLUMN transformed_text TEXT;
ALTER TABLE public.chapters ADD COLUMN draft_text TEXT;
ALTER TABLE public.chapters ADD COLUMN edited_text TEXT;
ALTER TABLE public.chapters ADD COLUMN spanish_text TEXT;
ALTER TABLE public.chapters ADD COLUMN summary TEXT;
ALTER TABLE public.chapters ADD COLUMN word_count INTEGER;
ALTER TABLE public.chapters ADD COLUMN quality_breakdown JSONB;

-- Tactics table
CREATE TABLE public.tactics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('technique', 'script', 'framework', 'mindset', 'tip')),
  category TEXT,
  description TEXT,
  original_context TEXT,
  roofing_context TEXT,
  source_quote TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Diagrams table
CREATE TABLE public.diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  diagram_type TEXT,
  specification JSONB,
  code TEXT,
  file_path TEXT,
  caption_en TEXT,
  caption_es TEXT,
  placement TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Issues table
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  issue_type TEXT,
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
  description TEXT,
  location TEXT,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.tactics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Tactics policies
CREATE POLICY "Users can view tactics of own projects"
  ON public.tactics FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert tactics on own projects"
  ON public.tactics FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- Diagrams policies
CREATE POLICY "Users can view diagrams of own chapters"
  ON public.diagrams FOR SELECT
  USING (chapter_id IN (
    SELECT c.id FROM public.chapters c
    JOIN public.projects p ON c.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert diagrams on own chapters"
  ON public.diagrams FOR INSERT
  WITH CHECK (chapter_id IN (
    SELECT c.id FROM public.chapters c
    JOIN public.projects p ON c.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- Issues policies
CREATE POLICY "Users can view issues of own chapters"
  ON public.issues FOR SELECT
  USING (chapter_id IN (
    SELECT c.id FROM public.chapters c
    JOIN public.projects p ON c.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert issues on own chapters"
  ON public.issues FOR INSERT
  WITH CHECK (chapter_id IN (
    SELECT c.id FROM public.chapters c
    JOIN public.projects p ON c.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update issues of own chapters"
  ON public.issues FOR UPDATE
  USING (chapter_id IN (
    SELECT c.id FROM public.chapters c
    JOIN public.projects p ON c.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- Create diagrams storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('diagrams', 'diagrams', false);

-- Storage policies for diagrams
CREATE POLICY "Users can view diagrams storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'diagrams' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can upload diagrams"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'diagrams' 
    AND auth.uid() IS NOT NULL
  );
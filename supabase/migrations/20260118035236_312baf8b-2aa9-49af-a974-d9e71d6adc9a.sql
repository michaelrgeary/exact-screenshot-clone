-- Quality Scores table
CREATE TABLE public.quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  overall_score NUMERIC(3,2),
  content_fidelity NUMERIC(3,2),
  roofing_relevance NUMERIC(3,2),
  clarity NUMERIC(3,2),
  actionability NUMERIC(3,2),
  engagement NUMERIC(3,2),
  flow NUMERIC(3,2),
  visual_integration NUMERIC(3,2),
  consistency NUMERIC(3,2),
  passes_threshold BOOLEAN,
  feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Output Files table
CREATE TABLE public.output_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  language TEXT NOT NULL,
  file_path TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.output_files ENABLE ROW LEVEL SECURITY;

-- Policies for quality_scores
CREATE POLICY "Users can view quality scores of own chapters"
  ON public.quality_scores FOR SELECT
  USING (chapter_id IN (
    SELECT c.id FROM public.chapters c
    JOIN public.projects p ON c.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert quality scores on own chapters"
  ON public.quality_scores FOR INSERT
  WITH CHECK (chapter_id IN (
    SELECT c.id FROM public.chapters c
    JOIN public.projects p ON c.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- Policies for output_files
CREATE POLICY "Users can view outputs of own projects"
  ON public.output_files FOR SELECT
  USING (project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert outputs on own projects"
  ON public.output_files FOR INSERT
  WITH CHECK (project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  ));

-- Create outputs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('outputs', 'outputs', false);

-- Storage policies for outputs
CREATE POLICY "Users can view outputs storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'outputs' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can download outputs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'outputs' 
    AND auth.uid() IS NOT NULL
  );
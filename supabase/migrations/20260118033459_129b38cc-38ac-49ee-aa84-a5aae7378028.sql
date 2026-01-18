-- Chapters table
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  current_phase INTEGER DEFAULT 0,
  quality_score NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pipeline Logs table
CREATE TABLE public.pipeline_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id),
  phase INTEGER,
  agent_name TEXT,
  log_level TEXT CHECK (log_level IN ('info', 'warning', 'error')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_logs ENABLE ROW LEVEL SECURITY;

-- Chapters policies (access through project ownership)
CREATE POLICY "Users can view chapters of own projects"
  ON public.chapters FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert chapters on own projects"
  ON public.chapters FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update chapters on own projects"
  ON public.chapters FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete chapters on own projects"
  ON public.chapters FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Pipeline logs policies
CREATE POLICY "Users can view logs of own projects"
  ON public.pipeline_logs FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert logs on own projects"
  ON public.pipeline_logs FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Update projects table with new columns
ALTER TABLE public.projects ADD COLUMN overall_quality_score NUMERIC(3,2);
ALTER TABLE public.projects ADD COLUMN processing_mode TEXT DEFAULT 'supervised';

-- Trigger for chapters updated_at
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
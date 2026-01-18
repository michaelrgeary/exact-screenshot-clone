-- Glossary table
CREATE TABLE public.glossary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  english_term text NOT NULL,
  spanish_term text,
  definition text,
  usage_notes text,
  created_at timestamptz DEFAULT now()
);

-- User Settings table
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  default_processing_mode text DEFAULT 'supervised',
  email_notifications boolean DEFAULT true,
  notify_on_error boolean DEFAULT true,
  notify_on_phase_complete boolean DEFAULT false,
  quality_threshold numeric(3,2) DEFAULT 0.80,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Glossary policies
CREATE POLICY "Users can view glossary of own projects"
  ON public.glossary FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert glossary for own projects"
  ON public.glossary FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update glossary of own projects"
  ON public.glossary FOR UPDATE
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete glossary from own projects"
  ON public.glossary FOR DELETE
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- User settings policies
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);
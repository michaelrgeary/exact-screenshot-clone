-- 1. cross_refs - Track inter-chapter references
CREATE TABLE public.cross_refs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    from_chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    to_chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    reason TEXT,
    location_hint TEXT,
    reference_text TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cross_refs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cross_refs" ON public.cross_refs
    FOR SELECT USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own cross_refs" ON public.cross_refs
    FOR INSERT WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own cross_refs" ON public.cross_refs
    FOR UPDATE USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own cross_refs" ON public.cross_refs
    FOR DELETE USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- 2. book_context - Store style guide, structure, metadata as key-value
CREATE TABLE public.book_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, key)
);

ALTER TABLE public.book_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own book_context" ON public.book_context
    FOR SELECT USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own book_context" ON public.book_context
    FOR INSERT WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own book_context" ON public.book_context
    FOR UPDATE USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own book_context" ON public.book_context
    FOR DELETE USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- 3. decisions - Audit log of agent decisions
CREATE TABLE public.decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    decision_type TEXT,
    subject TEXT,
    decision TEXT,
    reasoning TEXT,
    confidence TEXT,
    alternatives JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own decisions" ON public.decisions
    FOR SELECT USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own decisions" ON public.decisions
    FOR INSERT WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own decisions" ON public.decisions
    FOR UPDATE USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own decisions" ON public.decisions
    FOR DELETE USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- 4. validation_log - Track validator pass/fail results
CREATE TABLE public.validation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
    validator_name TEXT NOT NULL,
    phase INTEGER,
    passed BOOLEAN NOT NULL,
    failures JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.validation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own validation_log" ON public.validation_log
    FOR SELECT USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own validation_log" ON public.validation_log
    FOR INSERT WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own validation_log" ON public.validation_log
    FOR UPDATE USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own validation_log" ON public.validation_log
    FOR DELETE USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- Create indexes for common queries
CREATE INDEX idx_cross_refs_project ON public.cross_refs(project_id);
CREATE INDEX idx_cross_refs_from_chapter ON public.cross_refs(from_chapter_id);
CREATE INDEX idx_cross_refs_to_chapter ON public.cross_refs(to_chapter_id);

CREATE INDEX idx_book_context_project_key ON public.book_context(project_id, key);

CREATE INDEX idx_decisions_project ON public.decisions(project_id);
CREATE INDEX idx_decisions_chapter ON public.decisions(chapter_id);
CREATE INDEX idx_decisions_agent ON public.decisions(agent_name);

CREATE INDEX idx_validation_log_project ON public.validation_log(project_id);
CREATE INDEX idx_validation_log_chapter ON public.validation_log(chapter_id);
CREATE INDEX idx_validation_log_validator ON public.validation_log(validator_name);
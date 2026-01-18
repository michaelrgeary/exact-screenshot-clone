import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChapterDetail {
  id: string;
  projectId: string;
  chapterNumber: number;
  title: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  currentPhase: number;
  qualityScore: number | null;
  qualityBreakdown: Record<string, number> | null;
  originalText: string | null;
  transformedText: string | null;
  draftText: string | null;
  editedText: string | null;
  spanishText: string | null;
  summary: string | null;
  wordCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tactic {
  id: string;
  projectId: string;
  chapterId: string;
  name: string;
  type: 'technique' | 'script' | 'framework' | 'mindset' | 'tip';
  category: string | null;
  description: string | null;
  originalContext: string | null;
  roofingContext: string | null;
  sourceQuote: string | null;
  createdAt: string;
}

export interface Diagram {
  id: string;
  chapterId: string;
  diagramType: string | null;
  specification: Record<string, any> | null;
  code: string | null;
  filePath: string | null;
  captionEn: string | null;
  captionEs: string | null;
  placement: string | null;
  createdAt: string;
}

export interface Issue {
  id: string;
  chapterId: string;
  issueType: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'resolved' | 'ignored';
  description: string | null;
  location: string | null;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export function useChapterDetail(projectId: string, chapterNumber: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chapter-detail', projectId, chapterNumber],
    queryFn: async (): Promise<ChapterDetail | null> => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('project_id', projectId)
        .eq('chapter_number', chapterNumber)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        projectId: data.project_id,
        chapterNumber: data.chapter_number,
        title: data.title,
        status: data.status as ChapterDetail['status'],
        currentPhase: data.current_phase || 0,
        qualityScore: data.quality_score ? Number(data.quality_score) : null,
        qualityBreakdown: data.quality_breakdown as Record<string, number> | null,
        originalText: data.original_text,
        transformedText: data.transformed_text,
        draftText: data.draft_text,
        editedText: data.edited_text,
        spanishText: data.spanish_text,
        summary: data.summary,
        wordCount: data.word_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    enabled: !!user && !!projectId && !!chapterNumber,
  });
}

export function useChapterTactics(chapterId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chapter-tactics', chapterId],
    queryFn: async (): Promise<Tactic[]> => {
      if (!user || !chapterId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tactics')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(t => ({
        id: t.id,
        projectId: t.project_id,
        chapterId: t.chapter_id,
        name: t.name,
        type: t.type as Tactic['type'],
        category: t.category,
        description: t.description,
        originalContext: t.original_context,
        roofingContext: t.roofing_context,
        sourceQuote: t.source_quote,
        createdAt: t.created_at,
      }));
    },
    enabled: !!user && !!chapterId,
  });
}

export function useChapterDiagrams(chapterId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chapter-diagrams', chapterId],
    queryFn: async (): Promise<Diagram[]> => {
      if (!user || !chapterId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('diagrams')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(d => ({
        id: d.id,
        chapterId: d.chapter_id,
        diagramType: d.diagram_type,
        specification: d.specification as Record<string, any> | null,
        code: d.code,
        filePath: d.file_path,
        captionEn: d.caption_en,
        captionEs: d.caption_es,
        placement: d.placement,
        createdAt: d.created_at,
      }));
    },
    enabled: !!user && !!chapterId,
  });
}

export function useChapterIssues(chapterId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chapter-issues', chapterId],
    queryFn: async (): Promise<Issue[]> => {
      if (!user || !chapterId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(i => ({
        id: i.id,
        chapterId: i.chapter_id,
        issueType: i.issue_type,
        severity: i.severity as Issue['severity'],
        status: i.status as Issue['status'],
        description: i.description,
        location: i.location,
        resolution: i.resolution,
        createdAt: i.created_at,
        resolvedAt: i.resolved_at,
      }));
    },
    enabled: !!user && !!chapterId,
  });
}

export async function updateChapterContent(chapterId: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('chapters')
    .update({ edited_text: content, updated_at: new Date().toISOString() })
    .eq('id', chapterId);
  if (error) throw error;
}

export async function resolveIssue(issueId: string, resolution: string): Promise<void> {
  const { error } = await supabase
    .from('issues')
    .update({
      status: 'resolved',
      resolution,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', issueId);
  if (error) throw error;
}

export async function ignoreIssue(issueId: string): Promise<void> {
  const { error } = await supabase
    .from('issues')
    .update({ status: 'ignored' })
    .eq('id', issueId);
  if (error) throw error;
}

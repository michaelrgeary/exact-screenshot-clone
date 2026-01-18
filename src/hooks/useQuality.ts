import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface QualityScore {
  id: string;
  chapterId: string;
  overallScore: number;
  contentFidelity: number;
  roofingRelevance: number;
  clarity: number;
  actionability: number;
  engagement: number;
  flow: number;
  visualIntegration: number;
  consistency: number;
  passesThreshold: boolean;
  feedback: string[];
  createdAt: string;
}

export interface OutputFile {
  id: string;
  projectId: string;
  format: string;
  language: string;
  filePath: string | null;
  fileSize: number | null;
  createdAt: string;
}

export function useChapterQualityScore(chapterId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chapter-quality', chapterId],
    queryFn: async (): Promise<QualityScore | null> => {
      if (!user || !chapterId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('quality_scores')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        chapterId: data.chapter_id,
        overallScore: Number(data.overall_score),
        contentFidelity: Number(data.content_fidelity),
        roofingRelevance: Number(data.roofing_relevance),
        clarity: Number(data.clarity),
        actionability: Number(data.actionability),
        engagement: Number(data.engagement),
        flow: Number(data.flow),
        visualIntegration: Number(data.visual_integration),
        consistency: Number(data.consistency),
        passesThreshold: data.passes_threshold || false,
        feedback: (data.feedback as string[]) || [],
        createdAt: data.created_at,
      };
    },
    enabled: !!user && !!chapterId,
  });
}

export function useProjectQualityScores(projectId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project-quality-scores', projectId],
    queryFn: async (): Promise<{ chapterId: string; chapterNumber: number; title: string | null; score: QualityScore }[]> => {
      if (!user) throw new Error('Not authenticated');

      // Get chapters for this project
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('id, chapter_number, title')
        .eq('project_id', projectId)
        .order('chapter_number', { ascending: true });

      if (chaptersError) throw chaptersError;
      if (!chapters || chapters.length === 0) return [];

      // Get quality scores for all chapters
      const chapterIds = chapters.map(c => c.id);
      const { data: scores, error: scoresError } = await supabase
        .from('quality_scores')
        .select('*')
        .in('chapter_id', chapterIds);

      if (scoresError) throw scoresError;

      // Map scores to chapters (get latest score per chapter)
      const scoreMap = new Map<string, any>();
      (scores || []).forEach(score => {
        const existing = scoreMap.get(score.chapter_id);
        if (!existing || new Date(score.created_at) > new Date(existing.created_at)) {
          scoreMap.set(score.chapter_id, score);
        }
      });

      return chapters
        .filter(ch => scoreMap.has(ch.id))
        .map(ch => {
          const data = scoreMap.get(ch.id)!;
          return {
            chapterId: ch.id,
            chapterNumber: ch.chapter_number,
            title: ch.title,
            score: {
              id: data.id,
              chapterId: data.chapter_id,
              overallScore: Number(data.overall_score),
              contentFidelity: Number(data.content_fidelity),
              roofingRelevance: Number(data.roofing_relevance),
              clarity: Number(data.clarity),
              actionability: Number(data.actionability),
              engagement: Number(data.engagement),
              flow: Number(data.flow),
              visualIntegration: Number(data.visual_integration),
              consistency: Number(data.consistency),
              passesThreshold: data.passes_threshold || false,
              feedback: (data.feedback as string[]) || [],
              createdAt: data.created_at,
            },
          };
        });
    },
    enabled: !!user && !!projectId,
  });
}

export function useProjectOutputFiles(projectId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project-outputs', projectId],
    queryFn: async (): Promise<OutputFile[]> => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('output_files')
        .select('*')
        .eq('project_id', projectId)
        .order('language', { ascending: true })
        .order('format', { ascending: true });

      if (error) throw error;

      return (data || []).map(f => ({
        id: f.id,
        projectId: f.project_id,
        format: f.format,
        language: f.language,
        filePath: f.file_path,
        fileSize: f.file_size,
        createdAt: f.created_at,
      }));
    },
    enabled: !!user && !!projectId,
  });
}

export async function downloadOutputFile(filePath: string, fileName: string): Promise<void> {
  const { data, error } = await supabase.storage
    .from('outputs')
    .download(filePath);

  if (error) throw error;
  if (!data) throw new Error('File not found');

  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function requestRevalidation(chapterId: string, projectId: string): Promise<void> {
  const { error } = await supabase.from('pipeline_logs').insert({
    project_id: projectId,
    chapter_id: chapterId,
    log_level: 'info',
    message: 'Re-evaluation requested by user',
  });
  if (error) throw error;
}

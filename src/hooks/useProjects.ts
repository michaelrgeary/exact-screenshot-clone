import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ProjectStatus = 'draft' | 'running' | 'paused' | 'completed' | 'error';

export interface Project {
  id: string;
  title: string;
  sourceTitle: string;
  status: ProjectStatus;
  currentPhase: number;
  overallQualityScore: number | null;
  sourceFilePath: string | null;
  outputLanguages: string[];
  outputFormats: string[];
  processingMode: string;
  createdAt: string;
  updatedAt: string;
  completedChapters: number;
  totalChapters: number;
}

interface UseProjectsOptions {
  statusFilter?: 'all' | 'active' | 'completed' | 'error';
  sortBy?: 'recent' | 'alphabetical' | 'progress';
}

export function useProjects(options: UseProjectsOptions = {}) {
  const { user } = useAuth();
  const { statusFilter = 'all', sortBy = 'recent' } = options;

  return useQuery({
    queryKey: ['projects', user?.id, statusFilter, sortBy],
    queryFn: async (): Promise<Project[]> => {
      if (!user) throw new Error('Not authenticated');

      // Build base query
      let query = supabase
        .from('projects')
        .select('*');

      // Apply status filter
      if (statusFilter === 'active') {
        query = query.in('status', ['running', 'paused', 'draft']);
      } else if (statusFilter === 'completed') {
        query = query.eq('status', 'completed');
      } else if (statusFilter === 'error') {
        query = query.eq('status', 'error');
      }

      // Apply sorting
      if (sortBy === 'alphabetical') {
        query = query.order('title', { ascending: true });
      } else {
        query = query.order('updated_at', { ascending: false });
      }

      const { data: projects, error } = await query;

      if (error) throw error;
      if (!projects || projects.length === 0) return [];

      // Get chapter counts
      const projectIds = projects.map(p => p.id);
      const { data: chapters } = await supabase
        .from('chapters')
        .select('project_id, status')
        .in('project_id', projectIds);

      const chapterStats = new Map<string, { completed: number; total: number }>();
      projectIds.forEach(id => chapterStats.set(id, { completed: 0, total: 0 }));
      
      chapters?.forEach(ch => {
        const stats = chapterStats.get(ch.project_id);
        if (stats) {
          stats.total++;
          if (ch.status === 'completed') stats.completed++;
        }
      });

      let result: Project[] = projects.map(p => ({
        id: p.id,
        title: p.title,
        sourceTitle: p.source_title,
        status: p.status as ProjectStatus,
        currentPhase: p.current_phase || 0,
        overallQualityScore: p.overall_quality_score ? Number(p.overall_quality_score) : null,
        sourceFilePath: p.source_file_path,
        outputLanguages: p.output_languages || ['english', 'spanish'],
        outputFormats: p.output_formats || ['kindle', 'pdf_print', 'pdf_screen'],
        processingMode: p.processing_mode || 'supervised',
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        completedChapters: chapterStats.get(p.id)?.completed || 0,
        totalChapters: chapterStats.get(p.id)?.total || 0,
      }));

      // Sort by progress if needed (after fetching chapter data)
      if (sortBy === 'progress') {
        result = result.sort((a, b) => {
          const progressA = a.totalChapters > 0 ? a.completedChapters / a.totalChapters : 0;
          const progressB = b.totalChapters > 0 ? b.completedChapters / b.totalChapters : 0;
          return progressB - progressA;
        });
      }

      return result;
    },
    enabled: !!user,
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
}

export async function createProject(data: {
  title: string;
  sourceTitle: string;
  sourceFilePath: string;
  outputLanguages: string[];
  outputFormats: string[];
  processingMode: string;
  userId: string;
}): Promise<string> {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title: data.title,
      source_title: data.sourceTitle,
      source_file_path: data.sourceFilePath,
      output_languages: data.outputLanguages,
      output_formats: data.outputFormats,
      processing_mode: data.processingMode,
      user_id: data.userId,
      status: 'draft',
    })
    .select('id')
    .single();

  if (error) throw error;
  return project.id;
}

export async function startProject(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ status: 'running' })
    .eq('id', projectId);

  if (error) throw error;
}

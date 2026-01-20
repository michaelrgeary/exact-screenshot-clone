import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import * as pipelineApi from '@/services/pipelineApi';

export interface ProjectDetail {
  id: string;
  title: string;
  sourceTitle: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'error';
  currentPhase: number;
  overallQualityScore: number | null;
  sourceFilePath: string | null;
  outputLanguages: string[];
  outputFormats: string[];
  processingMode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  projectId: string;
  chapterNumber: number;
  title: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  currentPhase: number;
  qualityScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineLog {
  id: string;
  projectId: string;
  chapterId: string | null;
  phase: number | null;
  agentName: string | null;
  logLevel: 'info' | 'warning' | 'error';
  message: string | null;
  createdAt: string;
}

export function useProjectDetail(projectId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project-detail', projectId],
    queryFn: async (): Promise<ProjectDetail> => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        sourceTitle: data.source_title,
        status: data.status as ProjectDetail['status'],
        currentPhase: data.current_phase || 0,
        overallQualityScore: data.overall_quality_score ? Number(data.overall_quality_score) : null,
        sourceFilePath: data.source_file_path,
        outputLanguages: data.output_languages || [],
        outputFormats: data.output_formats || [],
        processingMode: data.processing_mode || 'supervised',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    enabled: !!user && !!projectId,
  });
}

export function useProjectChapters(projectId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project-chapters', projectId],
    queryFn: async (): Promise<Chapter[]> => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('project_id', projectId)
        .order('chapter_number', { ascending: true });

      if (error) throw error;

      return (data || []).map(ch => ({
        id: ch.id,
        projectId: ch.project_id,
        chapterNumber: ch.chapter_number,
        title: ch.title,
        status: ch.status as Chapter['status'],
        currentPhase: ch.current_phase || 0,
        qualityScore: ch.quality_score ? Number(ch.quality_score) : null,
        createdAt: ch.created_at,
        updatedAt: ch.updated_at,
      }));
    },
    enabled: !!user && !!projectId,
  });
}

export function useProjectLogs(projectId: string, filters?: { phase?: number; level?: string; search?: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['project-logs', projectId, filters],
    queryFn: async (): Promise<PipelineLog[]> => {
      if (!user) throw new Error('Not authenticated');

      let q = supabase
        .from('pipeline_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.phase) {
        q = q.eq('phase', filters.phase);
      }
      if (filters?.level) {
        q = q.eq('log_level', filters.level);
      }
      if (filters?.search) {
        q = q.ilike('message', `%${filters.search}%`);
      }

      const { data, error } = await q;

      if (error) throw error;

      return (data || []).map(log => ({
        id: log.id,
        projectId: log.project_id,
        chapterId: log.chapter_id,
        phase: log.phase,
        agentName: log.agent_name,
        logLevel: (log.log_level || 'info') as PipelineLog['logLevel'],
        message: log.message,
        createdAt: log.created_at,
      }));
    },
    enabled: !!user && !!projectId,
  });

  // Real-time subscription for new logs
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-logs-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pipeline_logs',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const newLog = payload.new as any;
          queryClient.setQueryData<PipelineLog[]>(
            ['project-logs', projectId, filters],
            (old = []) => [{
              id: newLog.id,
              projectId: newLog.project_id,
              chapterId: newLog.chapter_id,
              phase: newLog.phase,
              agentName: newLog.agent_name,
              logLevel: newLog.log_level || 'info',
              message: newLog.message,
              createdAt: newLog.created_at,
            }, ...old].slice(0, 100)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient, filters]);

  return query;
}

export async function pauseProject(projectId: string): Promise<void> {
  try {
    // Try to pause via backend API first (handles running pipeline)
    await pipelineApi.pausePipeline(projectId);
  } catch {
    // If backend is unavailable, update status directly
    const { error } = await supabase
      .from('projects')
      .update({ status: 'paused' })
      .eq('id', projectId);
    if (error) throw error;
  }
}

export async function resumeProject(projectId: string): Promise<void> {
  try {
    // Try to resume via backend API first
    await pipelineApi.resumePipeline(projectId);
  } catch {
    // If backend is unavailable, update status directly
    const { error } = await supabase
      .from('projects')
      .update({ status: 'running' })
      .eq('id', projectId);
    if (error) throw error;
  }
}

export async function stopProject(projectId: string): Promise<void> {
  try {
    // Try to stop via backend API first
    await pipelineApi.stopPipeline(projectId);
  } catch {
    // If backend is unavailable, update status directly
    const { error } = await supabase
      .from('projects')
      .update({ status: 'draft' })
      .eq('id', projectId);
    if (error) throw error;
  }
}

export async function restartProject(projectId: string): Promise<void> {
  try {
    // Try to restart via backend API
    await pipelineApi.startPipeline(projectId, { start_phase: 1 });
  } catch {
    // If backend is unavailable, update status directly
    const { error } = await supabase
      .from('projects')
      .update({ status: 'running', current_phase: 0 })
      .eq('id', projectId);
    if (error) throw error;
  }
}

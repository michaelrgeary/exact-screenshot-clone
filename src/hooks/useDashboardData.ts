import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  activeProjects: number;
  chaptersInProgress: number;
  completedBooks: number;
  averageQuality: number | null;
}

interface ProjectWithChapters {
  id: string;
  title: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'error';
  current_phase: number;
  completedChapters: number;
  totalChapters: number;
}

interface ActivityItem {
  id: string;
  projectId: string;
  projectTitle: string;
  logLevel: 'info' | 'warning' | 'error';
  message: string;
  createdAt: string;
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error('Not authenticated');

      // Get active projects count (running or paused)
      const { data: activeData, error: activeError } = await supabase
        .from('projects')
        .select('id')
        .in('status', ['running', 'paused']);

      if (activeError) throw activeError;

      // Get chapters in progress
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('id')
        .eq('status', 'processing');

      if (chaptersError) throw chaptersError;

      // Get completed books count
      const { data: completedData, error: completedError } = await supabase
        .from('projects')
        .select('id, overall_quality_score')
        .eq('status', 'completed');

      if (completedError) throw completedError;

      // Calculate average quality score
      const qualityScores = completedData
        ?.filter(p => p.overall_quality_score !== null)
        .map(p => Number(p.overall_quality_score)) || [];
      
      const averageQuality = qualityScores.length > 0
        ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
        : null;

      return {
        activeProjects: activeData?.length || 0,
        chaptersInProgress: chaptersData?.length || 0,
        completedBooks: completedData?.length || 0,
        averageQuality,
      };
    },
    enabled: !!user,
  });
}

export function useActiveProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['active-projects', user?.id],
    queryFn: async (): Promise<ProjectWithChapters[]> => {
      if (!user) throw new Error('Not authenticated');

      // Get active projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, title, status, current_phase')
        .in('status', ['draft', 'running', 'paused', 'error'])
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;
      if (!projects || projects.length === 0) return [];

      // Get chapter counts for each project
      const projectIds = projects.map(p => p.id);
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('project_id, status')
        .in('project_id', projectIds);

      if (chaptersError) throw chaptersError;

      // Calculate chapter stats per project
      const chapterStats = new Map<string, { completed: number; total: number }>();
      projectIds.forEach(id => chapterStats.set(id, { completed: 0, total: 0 }));
      
      chapters?.forEach(ch => {
        const stats = chapterStats.get(ch.project_id);
        if (stats) {
          stats.total++;
          if (ch.status === 'completed') stats.completed++;
        }
      });

      return projects.map(p => ({
        id: p.id,
        title: p.title,
        status: p.status as ProjectWithChapters['status'],
        current_phase: p.current_phase || 0,
        completedChapters: chapterStats.get(p.id)?.completed || 0,
        totalChapters: chapterStats.get(p.id)?.total || 0,
      }));
    },
    enabled: !!user,
  });
}

export function useRecentActivity() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-activity', user?.id],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!user) throw new Error('Not authenticated');

      // Get recent logs with project info
      const { data: logs, error: logsError } = await supabase
        .from('pipeline_logs')
        .select(`
          id,
          project_id,
          log_level,
          message,
          created_at,
          projects!inner(title)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;

      return (logs || []).map(log => ({
        id: log.id,
        projectId: log.project_id,
        projectTitle: (log.projects as any)?.title || 'Unknown Project',
        logLevel: (log.log_level || 'info') as ActivityItem['logLevel'],
        message: log.message || '',
        createdAt: log.created_at,
      }));
    },
    enabled: !!user,
  });
}

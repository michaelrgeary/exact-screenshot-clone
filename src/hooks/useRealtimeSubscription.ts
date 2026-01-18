import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Dashboard-specific real-time subscription
 */
export function useDashboardRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['active-projects'] });
          queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chapters' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['active-projects'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

/**
 * Project detail real-time subscription
 */
export function useProjectRealtime(projectId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['project-detail', projectId] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chapters', filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['project-chapters', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  return { isRecentlyUpdated: () => false };
}

/**
 * Chapter detail real-time subscription
 */
export function useChapterRealtime(chapterId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chapterId) return;

    const channel = supabase
      .channel(`chapter-${chapterId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chapters', filter: `id=eq.${chapterId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chapter-detail'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quality_scores', filter: `chapter_id=eq.${chapterId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chapter-quality-score'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chapterId, queryClient]);
}

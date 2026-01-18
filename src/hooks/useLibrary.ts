import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface GlossaryTerm {
  id: string;
  project_id: string | null;
  english_term: string;
  spanish_term: string | null;
  definition: string | null;
  usage_notes: string | null;
  created_at: string | null;
  project_title?: string;
}

export interface GlossaryFormData {
  project_id: string;
  english_term: string;
  spanish_term?: string;
  definition?: string;
  usage_notes?: string;
}

export function useGlossaryTerms(projectId?: string, search?: string) {
  return useQuery({
    queryKey: ['glossary', projectId, search],
    queryFn: async () => {
      let query = supabase
        .from('glossary')
        .select(`
          *,
          projects!inner(title)
        `)
        .order('english_term', { ascending: true });

      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      if (search) {
        query = query.or(`english_term.ilike.%${search}%,spanish_term.ilike.%${search}%,definition.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((term: any) => ({
        ...term,
        project_title: term.projects?.title,
      })) as GlossaryTerm[];
    },
  });
}

export function useAddGlossaryTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GlossaryFormData) => {
      const { error } = await supabase.from('glossary').insert({
        project_id: data.project_id,
        english_term: data.english_term,
        spanish_term: data.spanish_term || null,
        definition: data.definition || null,
        usage_notes: data.usage_notes || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary'] });
      toast.success('Term added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add term: ${error.message}`);
    },
  });
}

export function useUpdateGlossaryTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GlossaryFormData }) => {
      const { error } = await supabase
        .from('glossary')
        .update({
          project_id: data.project_id,
          english_term: data.english_term,
          spanish_term: data.spanish_term || null,
          definition: data.definition || null,
          usage_notes: data.usage_notes || null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary'] });
      toast.success('Term updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update term: ${error.message}`);
    },
  });
}

export function useDeleteGlossaryTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('glossary').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary'] });
      toast.success('Term deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete term: ${error.message}`);
    },
  });
}

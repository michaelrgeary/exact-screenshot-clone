import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserSettings {
  id: string;
  user_id: string;
  default_processing_mode: string;
  email_notifications: boolean;
  notify_on_error: boolean;
  notify_on_phase_complete: boolean;
  quality_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingsData {
  default_processing_mode?: string;
  email_notifications?: boolean;
  notify_on_error?: boolean;
  notify_on_phase_complete?: boolean;
  quality_threshold?: number;
}

export function useUserSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Try to get existing settings
      let { data: settings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Create default settings if none exist
      if (error?.code === 'PGRST116' || !settings) {
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        settings = newSettings;
      } else if (error) {
        throw error;
      }

      return settings as UserSettings;
    },
    enabled: !!user,
  });
}

export function useUpdateSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSettingsData) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast.success('Settings saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/settings`,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Password reset link sent to your email');
    },
    onError: (error: Error) => {
      toast.error(`Failed to send reset link: ${error.message}`);
    },
  });
}

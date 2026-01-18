export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chapters: {
        Row: {
          chapter_number: number
          created_at: string | null
          current_phase: number | null
          draft_text: string | null
          edited_text: string | null
          id: string
          original_text: string | null
          project_id: string | null
          quality_breakdown: Json | null
          quality_score: number | null
          spanish_text: string | null
          status: string | null
          summary: string | null
          title: string | null
          transformed_text: string | null
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          chapter_number: number
          created_at?: string | null
          current_phase?: number | null
          draft_text?: string | null
          edited_text?: string | null
          id?: string
          original_text?: string | null
          project_id?: string | null
          quality_breakdown?: Json | null
          quality_score?: number | null
          spanish_text?: string | null
          status?: string | null
          summary?: string | null
          title?: string | null
          transformed_text?: string | null
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          chapter_number?: number
          created_at?: string | null
          current_phase?: number | null
          draft_text?: string | null
          edited_text?: string | null
          id?: string
          original_text?: string | null
          project_id?: string | null
          quality_breakdown?: Json | null
          quality_score?: number | null
          spanish_text?: string | null
          status?: string | null
          summary?: string | null
          title?: string | null
          transformed_text?: string | null
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      diagrams: {
        Row: {
          caption_en: string | null
          caption_es: string | null
          chapter_id: string | null
          code: string | null
          created_at: string | null
          diagram_type: string | null
          file_path: string | null
          id: string
          placement: string | null
          specification: Json | null
        }
        Insert: {
          caption_en?: string | null
          caption_es?: string | null
          chapter_id?: string | null
          code?: string | null
          created_at?: string | null
          diagram_type?: string | null
          file_path?: string | null
          id?: string
          placement?: string | null
          specification?: Json | null
        }
        Update: {
          caption_en?: string | null
          caption_es?: string | null
          chapter_id?: string | null
          code?: string | null
          created_at?: string | null
          diagram_type?: string | null
          file_path?: string | null
          id?: string
          placement?: string | null
          specification?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "diagrams_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          chapter_id: string | null
          created_at: string | null
          description: string | null
          id: string
          issue_type: string | null
          location: string | null
          resolution: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          issue_type?: string | null
          location?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          issue_type?: string | null
          location?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      output_files: {
        Row: {
          created_at: string | null
          file_path: string | null
          file_size: number | null
          format: string
          id: string
          language: string
          project_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_path?: string | null
          file_size?: number | null
          format: string
          id?: string
          language: string
          project_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_path?: string | null
          file_size?: number | null
          format?: string
          id?: string
          language?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "output_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_logs: {
        Row: {
          agent_name: string | null
          chapter_id: string | null
          created_at: string | null
          id: string
          log_level: string | null
          message: string | null
          phase: number | null
          project_id: string | null
        }
        Insert: {
          agent_name?: string | null
          chapter_id?: string | null
          created_at?: string | null
          id?: string
          log_level?: string | null
          message?: string | null
          phase?: number | null
          project_id?: string | null
        }
        Update: {
          agent_name?: string | null
          chapter_id?: string | null
          created_at?: string | null
          id?: string
          log_level?: string | null
          message?: string | null
          phase?: number | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_logs_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          current_phase: number | null
          id: string
          output_formats: string[] | null
          output_languages: string[] | null
          overall_quality_score: number | null
          processing_mode: string | null
          source_file_path: string | null
          source_title: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_phase?: number | null
          id?: string
          output_formats?: string[] | null
          output_languages?: string[] | null
          overall_quality_score?: number | null
          processing_mode?: string | null
          source_file_path?: string | null
          source_title: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_phase?: number | null
          id?: string
          output_formats?: string[] | null
          output_languages?: string[] | null
          overall_quality_score?: number | null
          processing_mode?: string | null
          source_file_path?: string | null
          source_title?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quality_scores: {
        Row: {
          actionability: number | null
          chapter_id: string | null
          clarity: number | null
          consistency: number | null
          content_fidelity: number | null
          created_at: string | null
          engagement: number | null
          feedback: Json | null
          flow: number | null
          id: string
          overall_score: number | null
          passes_threshold: boolean | null
          roofing_relevance: number | null
          visual_integration: number | null
        }
        Insert: {
          actionability?: number | null
          chapter_id?: string | null
          clarity?: number | null
          consistency?: number | null
          content_fidelity?: number | null
          created_at?: string | null
          engagement?: number | null
          feedback?: Json | null
          flow?: number | null
          id?: string
          overall_score?: number | null
          passes_threshold?: boolean | null
          roofing_relevance?: number | null
          visual_integration?: number | null
        }
        Update: {
          actionability?: number | null
          chapter_id?: string | null
          clarity?: number | null
          consistency?: number | null
          content_fidelity?: number | null
          created_at?: string | null
          engagement?: number | null
          feedback?: Json | null
          flow?: number | null
          id?: string
          overall_score?: number | null
          passes_threshold?: boolean | null
          roofing_relevance?: number | null
          visual_integration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_scores_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      tactics: {
        Row: {
          category: string | null
          chapter_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          original_context: string | null
          project_id: string | null
          roofing_context: string | null
          source_quote: string | null
          type: string | null
        }
        Insert: {
          category?: string | null
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          original_context?: string | null
          project_id?: string | null
          roofing_context?: string | null
          source_quote?: string | null
          type?: string | null
        }
        Update: {
          category?: string | null
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          original_context?: string | null
          project_id?: string | null
          roofing_context?: string | null
          source_quote?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tactics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tactics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

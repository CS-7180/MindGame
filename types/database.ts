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
      athlete_profiles: {
        Row: {
          anxiety_symptoms: string[] | null
          athlete_id: string
          competitive_level: string | null
          created_at: string | null
          id: string
          onboarding_complete: boolean | null
          sport: string | null
          time_preference: string | null
          updated_at: string | null
        }
        Insert: {
          anxiety_symptoms?: string[] | null
          athlete_id: string
          competitive_level?: string | null
          created_at?: string | null
          id?: string
          onboarding_complete?: boolean | null
          sport?: string | null
          time_preference?: string | null
          updated_at?: string | null
        }
        Update: {
          anxiety_symptoms?: string[] | null
          athlete_id?: string
          competitive_level?: string | null
          created_at?: string | null
          id?: string
          onboarding_complete?: boolean | null
          sport?: string | null
          time_preference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_profiles_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_roster: {
        Row: {
          athlete_id: string
          coach_id: string
          id: string
          joined_at: string | null
        }
        Insert: {
          athlete_id: string
          coach_id: string
          id?: string
          joined_at?: string | null
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          id?: string
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_roster_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_roster_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_template_steps: {
        Row: {
          id: string
          step_order: number
          technique_id: string
          template_id: string
        }
        Insert: {
          id?: string
          step_order: number
          technique_id: string
          template_id: string
        }
        Update: {
          id?: string
          step_order?: number
          technique_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_template_steps_technique_id_fkey"
            columns: ["technique_id"]
            isOneToOne: false
            referencedRelation: "techniques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_template_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "coach_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_templates: {
        Row: {
          coach_id: string
          coach_note: string | null
          created_at: string | null
          id: string
          name: string
          time_tier: string | null
        }
        Insert: {
          coach_id: string
          coach_note?: string | null
          created_at?: string | null
          id?: string
          name: string
          time_tier?: string | null
        }
        Update: {
          coach_id?: string
          coach_note?: string | null
          created_at?: string | null
          id?: string
          name?: string
          time_tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_templates_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_logs: {
        Row: {
          athlete_id: string
          created_at: string | null
          game_id: string | null
          id: string
          log_date: string
          post_descriptor: string | null
          post_logged_at: string | null
          post_mental_state: number | null
          post_performance: number | null
          pre_anxiety_level: number | null
          pre_confidence_level: number | null
          pre_logged_at: string | null
          pre_notes: string | null
          routine_completed: string | null
          sport: string
        }
        Insert: {
          athlete_id: string
          created_at?: string | null
          game_id?: string | null
          id?: string
          log_date: string
          post_descriptor?: string | null
          post_logged_at?: string | null
          post_mental_state?: number | null
          post_performance?: number | null
          pre_anxiety_level?: number | null
          pre_confidence_level?: number | null
          pre_logged_at?: string | null
          pre_notes?: string | null
          routine_completed?: string | null
          sport: string
        }
        Update: {
          athlete_id?: string
          created_at?: string | null
          game_id?: string | null
          id?: string
          log_date?: string
          post_descriptor?: string | null
          post_logged_at?: string | null
          post_mental_state?: number | null
          post_performance?: number | null
          pre_anxiety_level?: number | null
          pre_confidence_level?: number | null
          pre_logged_at?: string | null
          pre_notes?: string | null
          routine_completed?: string | null
          sport?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_logs_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_logs_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          athlete_id: string
          created_at: string | null
          id: string
          reminder_offset_min: number | null
          reminder_sent: boolean | null
          scheduled_at: string
          sport: string
        }
        Insert: {
          athlete_id: string
          created_at?: string | null
          id?: string
          reminder_offset_min?: number | null
          reminder_sent?: boolean | null
          scheduled_at: string
          sport: string
        }
        Update: {
          athlete_id?: string
          created_at?: string | null
          id?: string
          reminder_offset_min?: number | null
          reminder_sent?: boolean | null
          scheduled_at?: string
          sport?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          athlete_id: string
          auth_key: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh_key: string
        }
        Insert: {
          athlete_id: string
          auth_key: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh_key: string
        }
        Update: {
          athlete_id?: string
          auth_key?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_steps: {
        Row: {
          created_at: string | null
          id: string
          routine_id: string
          step_order: number
          technique_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          routine_id: string
          step_order: number
          technique_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          routine_id?: string
          step_order?: number
          technique_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_steps_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_steps_technique_id_fkey"
            columns: ["technique_id"]
            isOneToOne: false
            referencedRelation: "techniques"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          athlete_id: string
          coach_template_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          source: string | null
          updated_at: string | null
        }
        Insert: {
          athlete_id: string
          coach_template_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string
          coach_template_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          source?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routines_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routines_coach_template_id_fkey"
            columns: ["coach_template_id"]
            isOneToOne: false
            referencedRelation: "coach_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      techniques: {
        Row: {
          category: string
          created_at: string | null
          duration_minutes: number
          id: string
          instruction: string
          name: string
          slug: string
        }
        Insert: {
          category: string
          created_at?: string | null
          duration_minutes: number
          id?: string
          instruction: string
          name: string
          slug: string
        }
        Update: {
          category?: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          instruction?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      template_notifications: {
        Row: {
          athlete_id: string
          coach_id: string
          created_at: string | null
          id: string
          status: string | null
          template_id: string
        }
        Insert: {
          athlete_id: string
          coach_id: string
          created_at?: string | null
          id?: string
          status?: string | null
          template_id: string
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          created_at?: string | null
          id?: string
          status?: string | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_notifications_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_notifications_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "coach_templates"
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

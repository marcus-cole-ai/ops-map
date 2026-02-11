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
      activity_people: {
        Row: {
          activity_id: string
          person_id: string
        }
        Insert: {
          activity_id: string
          person_id: string
        }
        Update: {
          activity_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_people_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "core_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_people_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_roles: {
        Row: {
          activity_id: string
          role_id: string
        }
        Insert: {
          activity_id: string
          role_id: string
        }
        Update: {
          activity_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_roles_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "core_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_software: {
        Row: {
          activity_id: string
          software_id: string
        }
        Insert: {
          activity_id: string
          software_id: string
        }
        Update: {
          activity_id?: string
          software_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_software_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "core_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_software_software_id_fkey"
            columns: ["software_id"]
            isOneToOne: false
            referencedRelation: "software"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          activity_id: string
          completed: boolean
          id: string
          order_index: number
          text: string
          video_url: string | null
        }
        Insert: {
          activity_id: string
          completed?: boolean
          id?: string
          order_index?: number
          text: string
          video_url?: string | null
        }
        Update: {
          activity_id?: string
          completed?: boolean
          id?: string
          order_index?: number
          text?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "core_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      core_activities: {
        Row: {
          checklist_end_state: string | null
          checklist_trigger: string | null
          created_at: string
          description: string | null
          full_description: string | null
          id: string
          name: string
          published_at: string | null
          status: string
          video_type: string | null
          video_url: string | null
          workspace_id: string
        }
        Insert: {
          checklist_end_state?: string | null
          checklist_trigger?: string | null
          created_at?: string
          description?: string | null
          full_description?: string | null
          id?: string
          name: string
          published_at?: string | null
          status?: string
          video_type?: string | null
          video_url?: string | null
          workspace_id: string
        }
        Update: {
          checklist_end_state?: string | null
          checklist_trigger?: string | null
          created_at?: string
          description?: string | null
          full_description?: string | null
          id?: string
          name?: string
          published_at?: string | null
          status?: string
          video_type?: string | null
          video_url?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "core_activities_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      functions: {
        Row: {
          color: string | null
          description: string | null
          id: string
          name: string
          order_index: number
          status: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number
          status?: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "functions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          email: string | null
          id: string
          name: string
          reports_to: string | null
          role_id: string | null
          title: string | null
          workspace_id: string
        }
        Insert: {
          email?: string | null
          id?: string
          name: string
          reports_to?: string | null
          role_id?: string | null
          title?: string | null
          workspace_id: string
        }
        Update: {
          email?: string | null
          id?: string
          name?: string
          reports_to?: string | null
          role_id?: string | null
          title?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_reports_to_fkey"
            columns: ["reports_to"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      phases: {
        Row: {
          id: string
          name: string
          order_index: number
          workflow_id: string
        }
        Insert: {
          id?: string
          name: string
          order_index?: number
          workflow_id: string
        }
        Update: {
          id?: string
          name?: string
          order_index?: number
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phases_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          description: string | null
          id: string
          name: string
          workspace_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          workspace_id: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      software: {
        Row: {
          id: string
          name: string
          url: string | null
          workspace_id: string
        }
        Insert: {
          id?: string
          name: string
          url?: string | null
          workspace_id: string
        }
        Update: {
          id?: string
          name?: string
          url?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "software_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      step_activities: {
        Row: {
          activity_id: string
          step_id: string
        }
        Insert: {
          activity_id: string
          step_id: string
        }
        Update: {
          activity_id?: string
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "core_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_activities_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "steps"
            referencedColumns: ["id"]
          },
        ]
      }
      steps: {
        Row: {
          id: string
          name: string
          order_index: number
          phase_id: string
          sop_video_type: string | null
          sop_video_url: string | null
        }
        Insert: {
          id?: string
          name: string
          order_index?: number
          phase_id: string
          sop_video_type?: string | null
          sop_video_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          order_index?: number
          phase_id?: string
          sop_video_type?: string | null
          sop_video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "steps_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_function_activities: {
        Row: {
          activity_id: string
          sub_function_id: string
        }
        Insert: {
          activity_id: string
          sub_function_id: string
        }
        Update: {
          activity_id?: string
          sub_function_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_function_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "core_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sub_function_activities_sub_function_id_fkey"
            columns: ["sub_function_id"]
            isOneToOne: false
            referencedRelation: "sub_functions"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_functions: {
        Row: {
          description: string | null
          function_id: string
          id: string
          name: string
          order_index: number
          status: string
        }
        Insert: {
          description?: string | null
          function_id: string
          id?: string
          name: string
          order_index?: number
          status?: string
        }
        Update: {
          description?: string | null
          function_id?: string
          id?: string
          name?: string
          order_index?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_functions_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "functions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          published_at: string | null
          status: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          published_at?: string | null
          status?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          published_at?: string | null
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          ai_settings: Json
          company_profile: Json
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          ai_settings?: Json
          company_profile?: Json
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          ai_settings?: Json
          company_profile?: Json
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
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

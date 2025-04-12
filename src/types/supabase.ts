export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
          phone: string | null;
          birthdate: string | null;
          location: string | null;
          bio: string | null;
          avatar_url: string | null;
          preferences: {
            theme: string;
            privacy: string;
            notifications: boolean;
            emailFrequency: string;
            loginReminders: boolean;
          } | null;
          last_notification_sent: string | null;
          last_login_reminder: string | null;
          created_at: string | null;
          updated_at: string | null;
          last_session: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email: string;
          phone?: string | null;
          birthdate?: string | null;
          location?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          preferences?: {
            theme: string;
            privacy: string;
            notifications: boolean;
            emailFrequency: string;
            loginReminders: boolean;
          } | null;
          last_notification_sent?: string | null;
          last_login_reminder?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_session?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string;
          phone?: string | null;
          birthdate?: string | null;
          location?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          preferences?: {
            theme: string;
            privacy: string;
            notifications: boolean;
            emailFrequency: string;
            loginReminders: boolean;
          } | null;
          last_notification_sent?: string | null;
          last_login_reminder?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_session?: string | null;
        };
      };
      analysis_results: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          subject_a_score: number | null;
          subject_b_score: number | null;
          comparison: string | null;
          subject_a_insights: string[] | null;
          subject_b_insights: string[] | null;
          message_patterns: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          subject_a_score?: number | null;
          subject_b_score?: number | null;
          comparison?: string | null;
          subject_a_insights?: string[] | null;
          subject_b_insights?: string[] | null;
          message_patterns?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          subject_a_score?: number | null;
          subject_b_score?: number | null;
          comparison?: string | null;
          subject_a_insights?: string[] | null;
          subject_b_insights?: string[] | null;
          message_patterns?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      gottman_analyses: {
        Row: {
          id: string;
          user_id: string;
          horseman: string;
          description: string | null;
          presence: string;
          examples: string[] | null;
          recommendations: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          horseman: string;
          description?: string | null;
          presence: string;
          examples?: string[] | null;
          recommendations?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          horseman?: string;
          description?: string | null;
          presence?: string;
          examples?: string[] | null;
          recommendations?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      auth_sessions: {
        Row: {
          id: string;
          user_id: string;
          created_at: string | null;
          expires_at: string;
          last_activity_at: string | null;
          metadata: any | null;
          device_info: string | null;
          ip_address: string | null;
          is_valid: boolean | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string | null;
          expires_at: string;
          last_activity_at?: string | null;
          metadata?: any | null;
          device_info?: string | null;
          ip_address?: string | null;
          is_valid?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string | null;
          expires_at?: string;
          last_activity_at?: string | null;
          metadata?: any | null;
          device_info?: string | null;
          ip_address?: string | null;
          is_valid?: boolean | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
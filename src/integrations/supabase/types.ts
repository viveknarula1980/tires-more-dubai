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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          country: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          area: string | null
          created_at: string
          customer_name: string
          email: string | null
          id: string
          items: Json
          notes: string | null
          phone: string
          preferred_time: string | null
          reference: string
          status: string
          total_aed: number
          vehicle_make: string | null
          vehicle_model: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string
          customer_name: string
          email?: string | null
          id?: string
          items: Json
          notes?: string | null
          phone: string
          preferred_time?: string | null
          reference?: string
          status?: string
          total_aed?: number
          vehicle_make?: string | null
          vehicle_model?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string
          customer_name?: string
          email?: string | null
          id?: string
          items?: Json
          notes?: string | null
          phone?: string
          preferred_time?: string | null
          reference?: string
          status?: string
          total_aed?: number
          vehicle_make?: string | null
          vehicle_model?: string | null
        }
        Relationships: []
      }
      tires: {
        Row: {
          brand_id: string
          country_of_origin: string | null
          created_at: string
          description: string | null
          featured: boolean
          features: string[] | null
          gallery_images: string[] | null
          id: string
          in_stock: boolean
          load_index: string | null
          main_image: string | null
          model: string | null
          name: string
          original_price_aed: number | null
          price_aed: number
          profile: number
          rim: number
          season: string
          slug: string
          speed_rating: string | null
          vehicle_type: string
          warranty: string | null
          width: number
          year_of_production: number | null
        }
        Insert: {
          brand_id: string
          country_of_origin?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          features?: string[] | null
          gallery_images?: string[] | null
          id?: string
          in_stock?: boolean
          load_index?: string | null
          main_image?: string | null
          model?: string | null
          name: string
          original_price_aed?: number | null
          price_aed: number
          profile: number
          rim: number
          season?: string
          slug: string
          speed_rating?: string | null
          vehicle_type?: string
          warranty?: string | null
          width: number
          year_of_production?: number | null
        }
        Update: {
          brand_id?: string
          country_of_origin?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          features?: string[] | null
          gallery_images?: string[] | null
          id?: string
          in_stock?: boolean
          load_index?: string | null
          main_image?: string | null
          model?: string | null
          name?: string
          original_price_aed?: number | null
          price_aed?: number
          profile?: number
          rim?: number
          season?: string
          slug?: string
          speed_rating?: string | null
          vehicle_type?: string
          warranty?: string | null
          width?: number
          year_of_production?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tires_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          id: string
          make: string
          model: string
          recommended_profile: number
          recommended_rim: number
          recommended_width: number
          vehicle_type: string | null
          year_from: number
          year_to: number
        }
        Insert: {
          created_at?: string
          id?: string
          make: string
          model: string
          recommended_profile: number
          recommended_rim: number
          recommended_width: number
          vehicle_type?: string | null
          year_from: number
          year_to: number
        }
        Update: {
          created_at?: string
          id?: string
          make?: string
          model?: string
          recommended_profile?: number
          recommended_rim?: number
          recommended_width?: number
          vehicle_type?: string | null
          year_from?: number
          year_to?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const

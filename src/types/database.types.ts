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
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_percent: number
          expires_at: string
          id: string
          is_used: boolean
          restaurant_id: string
          review_order_id: string
          used_at: string | null
          used_order_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_percent?: number
          expires_at?: string
          id?: string
          is_used?: boolean
          restaurant_id: string
          review_order_id: string
          used_at?: string | null
          used_order_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_percent?: number
          expires_at?: string
          id?: string
          is_used?: boolean
          restaurant_id?: string
          review_order_id?: string
          used_at?: string | null
          used_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_review_order_id_fkey"
            columns: ["review_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_used_order_id_fkey"
            columns: ["used_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          ai_docent_en: string | null
          ai_docent_ja: string | null
          ai_docent_ko: string | null
          ai_docent_ru: string | null
          ai_docent_zh: string | null
          category: string | null
          created_at: string | null
          description: string | null
          description_i18n: Json | null
          docent_content: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          name_i18n: Json | null
          price: number
          restaurant_id: string
          sort_order: number | null
          spicy_level: number
          updated_at: string | null
        }
        Insert: {
          ai_docent_en?: string | null
          ai_docent_ja?: string | null
          ai_docent_ko?: string | null
          ai_docent_ru?: string | null
          ai_docent_zh?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          description_i18n?: Json | null
          docent_content?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          name_i18n?: Json | null
          price: number
          restaurant_id: string
          sort_order?: number | null
          spicy_level?: number
          updated_at?: string | null
        }
        Update: {
          ai_docent_en?: string | null
          ai_docent_ja?: string | null
          ai_docent_ko?: string | null
          ai_docent_ru?: string | null
          ai_docent_zh?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          description_i18n?: Json | null
          docent_content?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          name_i18n?: Json | null
          price?: number
          restaurant_id?: string
          sort_order?: number | null
          spicy_level?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string
          options: Json | null
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id: string
          options?: Json | null
          order_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string
          options?: Json | null
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string | null
          discount_amount: number
          id: string
          locale: string | null
          payment_key: string | null
          payment_provider: string | null
          payment_status: string
          restaurant_id: string
          status: string
          table_id: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string | null
          discount_amount?: number
          id?: string
          locale?: string | null
          payment_key?: string | null
          payment_provider?: string | null
          payment_status?: string
          restaurant_id: string
          status?: string
          table_id: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          coupon_code?: string | null
          created_at?: string | null
          discount_amount?: number
          id?: string
          locale?: string | null
          payment_key?: string | null
          payment_provider?: string | null
          payment_status?: string
          restaurant_id?: string
          status?: string
          table_id?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      private_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          food_rating: number | null
          id: string
          liked_items: Json | null
          order_id: string
          rating: number
          restaurant_id: string
          service_rating: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          food_rating?: number | null
          id?: string
          liked_items?: Json | null
          order_id: string
          rating: number
          restaurant_id: string
          service_rating?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          food_rating?: number | null
          id?: string
          liked_items?: Json | null
          order_id?: string
          rating?: number
          restaurant_id?: string
          service_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "private_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurant_owners: {
        Row: {
          created_at: string
          restaurant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          restaurant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_owners_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          name_i18n: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          name_i18n?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          name_i18n?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tables: {
        Row: {
          created_at: string | null
          id: string
          name: string
          qr_code: string | null
          restaurant_id: string
          table_number: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          qr_code?: string | null
          restaurant_id: string
          table_number?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          qr_code?: string | null
          restaurant_id?: string
          table_number?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reports: {
        Row: {
          created_at: string | null
          id: string
          report_json: Json
          restaurant_id: string
          week_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_json: Json
          restaurant_id: string
          week_start: string
        }
        Update: {
          created_at?: string | null
          id?: string
          report_json?: Json
          restaurant_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reports_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
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

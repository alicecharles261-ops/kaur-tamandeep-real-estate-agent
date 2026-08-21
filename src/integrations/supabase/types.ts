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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          property_slug: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          property_slug?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          property_slug?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[]
          baths: number
          beds: number
          city: string
          created_at: string
          date_label: string | null
          description: string
          documents: string[]
          energy_rating: string | null
          features: string[]
          gallery_keys: string[]
          garage: number | null
          google_maps_url: string | null
          id: string
          image_key: string
          is_archived: boolean
          is_draft: boolean
          is_featured: boolean
          is_hidden: boolean
          is_published: boolean
          latitude: number | null
          lease_price: string | null
          longitude: number | null
          lot_size: string | null
          mls: string | null
          nearby_hospitals: string[]
          nearby_restaurants: string[]
          nearby_schools: string[]
          nearby_shopping: string[]
          open_house_date: string | null
          open_house_time: string | null
          price: string
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          sqft: number | null
          state: string
          status: Database["public"]["Enums"]["property_status"]
          stories: number | null
          title: string
          type: string
          video_url: string | null
          virtual_tour_url: string | null
          year_built: number | null
          zip: string
        }
        Insert: {
          address: string
          amenities?: string[]
          baths: number
          beds: number
          city: string
          created_at?: string
          date_label?: string | null
          description: string
          documents?: string[]
          energy_rating?: string | null
          features?: string[]
          gallery_keys?: string[]
          garage?: number | null
          google_maps_url?: string | null
          id?: string
          image_key: string
          is_archived?: boolean
          is_draft?: boolean
          is_featured?: boolean
          is_hidden?: boolean
          is_published?: boolean
          latitude?: number | null
          lease_price?: string | null
          longitude?: number | null
          lot_size?: string | null
          mls?: string | null
          nearby_hospitals?: string[]
          nearby_restaurants?: string[]
          nearby_schools?: string[]
          nearby_shopping?: string[]
          open_house_date?: string | null
          open_house_time?: string | null
          price: string
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          sqft?: number | null
          state: string
          status: Database["public"]["Enums"]["property_status"]
          stories?: number | null
          title: string
          type: string
          video_url?: string | null
          virtual_tour_url?: string | null
          year_built?: number | null
          zip: string
        }
        Update: {
          address?: string
          amenities?: string[]
          baths?: number
          beds?: number
          city?: string
          created_at?: string
          date_label?: string | null
          description?: string
          documents?: string[]
          energy_rating?: string | null
          features?: string[]
          gallery_keys?: string[]
          garage?: number | null
          google_maps_url?: string | null
          id?: string
          image_key?: string
          is_archived?: boolean
          is_draft?: boolean
          is_featured?: boolean
          is_hidden?: boolean
          is_published?: boolean
          latitude?: number | null
          lease_price?: string | null
          longitude?: number | null
          lot_size?: string | null
          mls?: string | null
          nearby_hospitals?: string[]
          nearby_restaurants?: string[]
          nearby_schools?: string[]
          nearby_shopping?: string[]
          open_house_date?: string | null
          open_house_time?: string | null
          price?: string
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          sqft?: number | null
          state?: string
          status?: Database["public"]["Enums"]["property_status"]
          stories?: number | null
          title?: string
          type?: string
          video_url?: string | null
          virtual_tour_url?: string | null
          year_built?: number | null
          zip?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          name: string
          quote: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          quote: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          quote?: string
          sort_order?: number
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
      property_status: "for-sale" | "for-lease" | "sold" | "leased" | "pending"
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
      property_status: ["for-sale", "for-lease", "sold", "leased", "pending"],
    },
  },
} as const

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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
        }
        Relationships: []
      }
      branch_staff: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_staff_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string
          city: string
          created_at: string
          governorate: string
          id: string
          is_24_7: boolean
          is_active: boolean
          is_emergency: boolean
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: Json | null
          pharmacy_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          governorate: string
          id?: string
          is_24_7?: boolean
          is_active?: boolean
          is_emergency?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: Json | null
          pharmacy_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          governorate?: string
          id?: string
          is_24_7?: boolean
          is_active?: boolean
          is_emergency?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: Json | null
          pharmacy_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          batch_number: string | null
          branch_id: string
          expiry_date: string | null
          id: string
          low_stock_threshold: number
          medicine_id: string
          price_tnd: number
          quantity: number
          reserved_quantity: number
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          branch_id: string
          expiry_date?: string | null
          id?: string
          low_stock_threshold?: number
          medicine_id: string
          price_tnd?: number
          quantity?: number
          reserved_quantity?: number
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          branch_id?: string
          expiry_date?: string | null
          id?: string
          low_stock_threshold?: number
          medicine_id?: string
          price_tnd?: number
          quantity?: number
          reserved_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          barcode: string | null
          brand_name: string
          category: string | null
          created_at: string
          description: string | null
          dosage: string | null
          form: string | null
          generic_name: string
          id: string
          manufacturer: string | null
          name_ar: string | null
          name_en: string | null
          name_fr: string | null
          requires_prescription: boolean
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          brand_name: string
          category?: string | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          form?: string | null
          generic_name: string
          id?: string
          manufacturer?: string | null
          name_ar?: string | null
          name_en?: string | null
          name_fr?: string | null
          requires_prescription?: boolean
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          brand_name?: string
          category?: string | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          form?: string | null
          generic_name?: string
          id?: string
          manufacturer?: string | null
          name_ar?: string | null
          name_en?: string | null
          name_fr?: string | null
          requires_prescription?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      pharmacies: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          license_number: string
          name: string
          owner_id: string
          status: Database["public"]["Enums"]["pharmacy_status"]
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          license_number: string
          name: string
          owner_id: string
          status?: Database["public"]["Enums"]["pharmacy_status"]
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          license_number?: string
          name?: string
          owner_id?: string
          status?: Database["public"]["Enums"]["pharmacy_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: Database["public"]["Enums"]["language_code"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: Database["public"]["Enums"]["language_code"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: Database["public"]["Enums"]["language_code"]
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          branch_id: string
          created_at: string
          expires_at: string
          id: string
          medicine_id: string
          note: string | null
          patient_id: string
          quantity: number
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          expires_at?: string
          id?: string
          medicine_id: string
          note?: string | null
          patient_id: string
          quantity: number
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          medicine_id?: string
          note?: string | null
          patient_id?: string
          quantity?: number
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          created_at: string
          from_branch_id: string
          id: string
          medicine_id: string
          note: string | null
          quantity: number
          requested_by: string
          status: Database["public"]["Enums"]["transfer_status"]
          to_branch_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_branch_id: string
          id?: string
          medicine_id: string
          note?: string | null
          quantity: number
          requested_by: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_branch_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_branch_id?: string
          id?: string
          medicine_id?: string
          note?: string | null
          quantity?: number
          requested_by?: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_branch_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_branch_id_fkey"
            columns: ["from_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_branch_id_fkey"
            columns: ["to_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_branch_member: {
        Args: { _branch_id: string; _user_id: string }
        Returns: boolean
      }
      set_pharmacy_status: {
        Args: {
          _pharmacy_id: string
          _status: Database["public"]["Enums"]["pharmacy_status"]
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "patient"
        | "pharmacist"
        | "pharmacy_owner"
        | "supplier"
        | "admin"
      language_code: "fr" | "ar" | "en"
      pharmacy_status: "pending" | "approved" | "suspended" | "rejected"
      reservation_status:
        | "pending"
        | "confirmed"
        | "ready"
        | "fulfilled"
        | "cancelled"
        | "expired"
      transfer_status:
        | "requested"
        | "approved"
        | "rejected"
        | "in_transit"
        | "completed"
        | "cancelled"
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
      app_role: [
        "patient",
        "pharmacist",
        "pharmacy_owner",
        "supplier",
        "admin",
      ],
      language_code: ["fr", "ar", "en"],
      pharmacy_status: ["pending", "approved", "suspended", "rejected"],
      reservation_status: [
        "pending",
        "confirmed",
        "ready",
        "fulfilled",
        "cancelled",
        "expired",
      ],
      transfer_status: [
        "requested",
        "approved",
        "rejected",
        "in_transit",
        "completed",
        "cancelled",
      ],
    },
  },
} as const

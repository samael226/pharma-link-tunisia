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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
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
      deliveries: {
        Row: {
          assigned_to: string | null
          branch_id: string
          created_at: string
          delivered_at: string | null
          delivery_fee_tnd: number
          id: string
          notes: string | null
          patient_address: string
          patient_name: string
          patient_phone: string | null
          picked_up_at: string | null
          prescription_id: string | null
          reservation_id: string | null
          status: Database["public"]["Enums"]["delivery_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          branch_id: string
          created_at?: string
          delivered_at?: string | null
          delivery_fee_tnd?: number
          id?: string
          notes?: string | null
          patient_address: string
          patient_name: string
          patient_phone?: string | null
          picked_up_at?: string | null
          prescription_id?: string | null
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          branch_id?: string
          created_at?: string
          delivered_at?: string | null
          delivery_fee_tnd?: number
          id?: string
          notes?: string | null
          patient_address?: string
          patient_name?: string
          patient_phone?: string | null
          picked_up_at?: string | null
          prescription_id?: string | null
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
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
      invoices: {
        Row: {
          amount_tnd: number
          created_at: string
          due_date: string
          id: string
          invoice_number: string
          paid_at: string | null
          pdf_url: string | null
          status: string
          subscription_id: string
        }
        Insert: {
          amount_tnd: number
          created_at?: string
          due_date: string
          id?: string
          invoice_number: string
          paid_at?: string | null
          pdf_url?: string | null
          status?: string
          subscription_id: string
        }
        Update: {
          amount_tnd?: number
          created_at?: string
          due_date?: string
          id?: string
          invoice_number?: string
          paid_at?: string | null
          pdf_url?: string | null
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
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
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_tnd: number
          created_at: string
          id: string
          invoice_id: string
          metadata: Json | null
          payment_id: string | null
          payment_method: string
          status: string
        }
        Insert: {
          amount_tnd: number
          created_at?: string
          id?: string
          invoice_id: string
          metadata?: Json | null
          payment_id?: string | null
          payment_method: string
          status?: string
        }
        Update: {
          amount_tnd?: number
          created_at?: string
          id?: string
          invoice_id?: string
          metadata?: Json | null
          payment_id?: string | null
          payment_method?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
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
      prescription_items: {
        Row: {
          created_at: string
          dosage: string | null
          id: string
          instructions: string | null
          medicine_id: string | null
          medicine_name: string
          prescription_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          id?: string
          instructions?: string | null
          medicine_id?: string | null
          medicine_name: string
          prescription_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          dosage?: string | null
          id?: string
          instructions?: string | null
          medicine_id?: string | null
          medicine_name?: string
          prescription_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          branch_id: string
          created_at: string
          expires_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          notes: string | null
          patient_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["prescription_status"]
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          expires_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          notes?: string | null
          patient_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["prescription_status"]
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          expires_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          notes?: string | null
          patient_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["prescription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
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
      subscription_plans: {
        Row: {
          billing_interval: string
          created_at: string
          features: Json
          id: string
          is_active: boolean
          max_branches: number
          max_medicines: number
          name: string
          price_tnd: number
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          billing_interval?: string
          created_at?: string
          features: Json
          id?: string
          is_active?: boolean
          max_branches: number
          max_medicines: number
          name: string
          price_tnd: number
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          billing_interval?: string
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_branches?: number
          max_medicines?: number
          name?: string
          price_tnd?: number
          tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_ends_at: string
          id: string
          pharmacy_id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_ends_at: string
          id?: string
          pharmacy_id: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_ends_at?: string
          id?: string
          pharmacy_id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: true
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
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
      cancel_subscription: {
        Args: { _subscription_id: string }
        Returns: boolean
      }
      change_subscription_plan: {
        Args: {
          _new_plan_tier: Database["public"]["Enums"]["subscription_tier"]
          _subscription_id: string
        }
        Returns: boolean
      }
      create_notification: {
        Args: {
          _body: string
          _data?: Json
          _title: string
          _type: Database["public"]["Enums"]["notification_type"]
          _user_id: string
        }
        Returns: string
      }
      create_subscription: {
        Args: {
          _pharmacy_id: string
          _plan_tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Returns: string
      }
      generate_invoice_number: { Args: never; Returns: string }
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
      delivery_status:
        | "pending"
        | "assigned"
        | "picked_up"
        | "in_transit"
        | "delivered"
        | "cancelled"
      language_code: "fr" | "ar" | "en"
      notification_status: "unread" | "read"
      notification_type:
        | "reservation_created"
        | "reservation_confirmed"
        | "reservation_ready"
        | "transfer_requested"
        | "transfer_approved"
        | "prescription_uploaded"
        | "prescription_approved"
        | "prescription_rejected"
        | "delivery_assigned"
        | "delivery_picked_up"
        | "delivery_delivered"
      pharmacy_status: "pending" | "approved" | "suspended" | "rejected"
      prescription_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "expired"
        | "fulfilled"
      reservation_status:
        | "pending"
        | "confirmed"
        | "ready"
        | "fulfilled"
        | "cancelled"
        | "expired"
      subscription_status:
        | "trial"
        | "active"
        | "past_due"
        | "cancelled"
        | "expired"
      subscription_tier: "free" | "starter" | "pro" | "enterprise"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: [
        "patient",
        "pharmacist",
        "pharmacy_owner",
        "supplier",
        "admin",
      ],
      delivery_status: [
        "pending",
        "assigned",
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      language_code: ["fr", "ar", "en"],
      notification_status: ["unread", "read"],
      notification_type: [
        "reservation_created",
        "reservation_confirmed",
        "reservation_ready",
        "transfer_requested",
        "transfer_approved",
        "prescription_uploaded",
        "prescription_approved",
        "prescription_rejected",
        "delivery_assigned",
        "delivery_picked_up",
        "delivery_delivered",
      ],
      pharmacy_status: ["pending", "approved", "suspended", "rejected"],
      prescription_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "expired",
        "fulfilled",
      ],
      reservation_status: [
        "pending",
        "confirmed",
        "ready",
        "fulfilled",
        "cancelled",
        "expired",
      ],
      subscription_status: [
        "trial",
        "active",
        "past_due",
        "cancelled",
        "expired",
      ],
      subscription_tier: ["free", "starter", "pro", "enterprise"],
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

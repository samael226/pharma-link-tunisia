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
    PostgrestVersion: "14.17"
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
      billing_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          pharmacy_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          pharmacy_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          pharmacy_id?: string | null
        }
        Relationships: []
      }
      billing_profiles: {
        Row: {
          address: string | null
          city: string | null
          country: string
          created_at: string
          email: string
          legal_name: string
          pharmacy_id: string
          phone: string | null
          postal_code: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string
          created_at?: string
          email: string
          legal_name: string
          pharmacy_id: string
          phone?: string | null
          postal_code?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string
          created_at?: string
          email?: string
          legal_name?: string
          pharmacy_id?: string
          phone?: string | null
          postal_code?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_profiles_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: true
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_rate_limits: {
        Row: {
          action: string
          count: number
          user_id: string
          window_start: string
        }
        Insert: {
          action: string
          count?: number
          user_id: string
          window_start: string
        }
        Update: {
          action?: string
          count?: number
          user_id?: string
          window_start?: string
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
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          id: string
          pharmacy_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          id?: string
          pharmacy_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          id?: string
          pharmacy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["coupon_type"]
          max_redemptions: number | null
          plan_codes: string[] | null
          redemptions: number
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["coupon_type"]
          max_redemptions?: number | null
          plan_codes?: string[] | null
          redemptions?: number
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["coupon_type"]
          max_redemptions?: number | null
          plan_codes?: string[] | null
          redemptions?: number
          value?: number
        }
        Relationships: []
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
      invoice_line_items: {
        Row: {
          amount_millimes: number
          description: string
          id: string
          invoice_id: string
          quantity: number
          unit_millimes: number
        }
        Insert: {
          amount_millimes: number
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          unit_millimes: number
        }
        Update: {
          amount_millimes?: number
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          unit_millimes?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          currency: string
          customer_snapshot: Json
          discount_millimes: number
          id: string
          number: string
          paid_at: string | null
          period_end: string | null
          period_start: string | null
          pharmacy_id: string
          plan_name: string | null
          provider_invoice_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subscription_id: string | null
          subtotal_millimes: number
          tax_millimes: number
          tax_rate: number
          total_millimes: number
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_snapshot?: Json
          discount_millimes?: number
          id?: string
          number?: string
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          pharmacy_id: string
          plan_name?: string | null
          provider_invoice_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subscription_id?: string | null
          subtotal_millimes?: number
          tax_millimes?: number
          tax_rate?: number
          total_millimes?: number
        }
        Update: {
          created_at?: string
          currency?: string
          customer_snapshot?: Json
          discount_millimes?: number
          id?: string
          number?: string
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          pharmacy_id?: string
          plan_name?: string | null
          provider_invoice_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subscription_id?: string | null
          subtotal_millimes?: number
          tax_millimes?: number
          tax_rate?: number
          total_millimes?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
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
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string
          exp_month: number | null
          exp_year: number | null
          id: string
          is_default: boolean
          kind: string
          last4: string | null
          pharmacy_id: string
          provider: string
          provider_method_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          kind?: string
          last4?: string | null
          pharmacy_id: string
          provider: string
          provider_method_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          kind?: string
          last4?: string | null
          pharmacy_id?: string
          provider?: string
          provider_method_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_millimes: number
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          invoice_id: string | null
          pharmacy_id: string
          provider: string
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount_millimes: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          invoice_id?: string | null
          pharmacy_id: string
          provider: string
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount_millimes?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          invoice_id?: string | null
          pharmacy_id?: string
          provider?: string
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
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
      promotions: {
        Row: {
          coupon_id: string | null
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          starts_at: string
          title: string
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string
          title: string
        }
        Update: {
          coupon_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount_millimes: number
          created_at: string
          id: string
          payment_id: string
          provider_refund_id: string | null
          reason: string | null
        }
        Insert: {
          amount_millimes: number
          created_at?: string
          id?: string
          payment_id: string
          provider_refund_id?: string | null
          reason?: string | null
        }
        Update: {
          amount_millimes?: number
          created_at?: string
          id?: string
          payment_id?: string
          provider_refund_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
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
      subscription_history: {
        Row: {
          actor_id: string | null
          created_at: string
          from_plan_id: string | null
          from_status: Database["public"]["Enums"]["subscription_status"] | null
          id: string
          pharmacy_id: string
          reason: string | null
          subscription_id: string
          to_plan_id: string | null
          to_status: Database["public"]["Enums"]["subscription_status"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          from_plan_id?: string | null
          from_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          id?: string
          pharmacy_id: string
          reason?: string | null
          subscription_id: string
          to_plan_id?: string | null
          to_status: Database["public"]["Enums"]["subscription_status"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          from_plan_id?: string | null
          from_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          id?: string
          pharmacy_id?: string
          reason?: string | null
          subscription_id?: string
          to_plan_id?: string | null
          to_status?: Database["public"]["Enums"]["subscription_status"]
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          code: string
          created_at: string
          currency: string
          description: string | null
          features: string[]
          id: string
          interval: string
          is_active: boolean
          max_branches: number | null
          max_employees: number | null
          name: string
          price_millimes: number
          sort_order: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[]
          id?: string
          interval?: string
          is_active?: boolean
          max_branches?: number | null
          max_employees?: number | null
          name: string
          price_millimes: number
          sort_order?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[]
          id?: string
          interval?: string
          is_active?: boolean
          max_branches?: number | null
          max_employees?: number | null
          name?: string
          price_millimes?: number
          sort_order?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          cancelled_at: string | null
          coupon_id: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          grace_ends_at: string | null
          id: string
          pharmacy_id: string
          plan_id: string
          provider: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          coupon_id?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          grace_ends_at?: string | null
          id?: string
          pharmacy_id: string
          plan_id: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          coupon_id?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          grace_ends_at?: string | null
          id?: string
          pharmacy_id?: string
          plan_id?: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
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
      tax_config: {
        Row: {
          country: string
          id: string
          name: string
          rate: number
          updated_at: string
        }
        Insert: {
          country: string
          id?: string
          name: string
          rate: number
          updated_at?: string
        }
        Update: {
          country?: string
          id?: string
          name?: string
          rate?: number
          updated_at?: string
        }
        Relationships: []
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
      usage_metrics: {
        Row: {
          id: string
          metric: string
          period: string
          pharmacy_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          id?: string
          metric: string
          period?: string
          pharmacy_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          id?: string
          metric?: string
          period?: string
          pharmacy_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_metrics_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
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
      webhook_events: {
        Row: {
          id: string
          received_at: string
          type: string
        }
        Insert: {
          id: string
          received_at?: string
          type: string
        }
        Update: {
          id?: string
          received_at?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_first_admin: { Args: never; Returns: boolean }
      effective_plan_code: { Args: { _pharmacy: string }; Returns: string }
      has_feature: {
        Args: { _feature: string; _pharmacy: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hit_rate_limit: {
        Args: { _action: string; _max: number }
        Returns: boolean
      }
      is_branch_member: {
        Args: { _branch_id: string; _user_id: string }
        Returns: boolean
      }
      is_pharmacy_owner: {
        Args: { _pharmacy: string; _user: string }
        Returns: boolean
      }
      plan_limit: { Args: { _key: string; _pharmacy: string }; Returns: number }
      record_usage: {
        Args: { _metric: string; _pharmacy: string; _qty?: number }
        Returns: undefined
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
      coupon_type: "percent" | "fixed" | "free_months"
      invoice_status: "draft" | "open" | "paid" | "void" | "uncollectible"
      language_code: "fr" | "ar" | "en"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      pharmacy_status: "pending" | "approved" | "suspended" | "rejected"
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
        | "suspended"
        | "cancelled"
        | "expired"
        | "pending_payment"
        | "grace_period"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      coupon_type: ["percent", "fixed", "free_months"],
      invoice_status: ["draft", "open", "paid", "void", "uncollectible"],
      language_code: ["fr", "ar", "en"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      pharmacy_status: ["pending", "approved", "suspended", "rejected"],
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
        "suspended",
        "cancelled",
        "expired",
        "pending_payment",
        "grace_period",
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

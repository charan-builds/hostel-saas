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
      analytics_refresh_jobs: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          hostel_branch_id: string | null
          id: string
          job_type: string
          last_error_code: string | null
          last_error_message: string | null
          locked_at: string | null
          locked_by: string | null
          metadata: Json
          organization_id: string
          requested_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          hostel_branch_id?: string | null
          id?: string
          job_type?: string
          last_error_code?: string | null
          last_error_message?: string | null
          locked_at?: string | null
          locked_by?: string | null
          metadata?: Json
          organization_id: string
          requested_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          hostel_branch_id?: string | null
          id?: string
          job_type?: string
          last_error_code?: string | null
          last_error_message?: string | null
          locked_at?: string | null
          locked_by?: string | null
          metadata?: Json
          organization_id?: string
          requested_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_refresh_jobs_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "analytics_refresh_jobs_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "analytics_refresh_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          assignment_id: string | null
          attendance_date: string
          bed_id: string | null
          checked_at: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          hostel_branch_id: string
          id: string
          marked_by: string | null
          metadata: Json
          notes: string | null
          organization_id: string
          room_id: string | null
          source: string
          status: string
          student_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assignment_id?: string | null
          attendance_date: string
          bed_id?: string | null
          checked_at?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id: string
          id?: string
          marked_by?: string | null
          metadata?: Json
          notes?: string | null
          organization_id: string
          room_id?: string | null
          source?: string
          status?: string
          student_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assignment_id?: string | null
          attendance_date?: string
          bed_id?: string | null
          checked_at?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id?: string
          id?: string
          marked_by?: string | null
          metadata?: Json
          notes?: string | null
          organization_id?: string
          room_id?: string | null
          source?: string
          status?: string
          student_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_assignment_fk"
            columns: ["assignment_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "student_room_assignments"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "attendance_records_bed_fk"
            columns: ["bed_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "room_beds"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "attendance_records_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "attendance_records_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "attendance_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_room_fk"
            columns: ["room_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "attendance_records_student_fk"
            columns: ["student_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          app: Database["public"]["Enums"]["saas_product"]
          created_at: string
          entity_id: string | null
          entity_table: string | null
          hostel_branch_id: string | null
          id: string
          ip_address: unknown
          metadata: Json
          organization_id: string | null
          request_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          app?: Database["public"]["Enums"]["saas_product"]
          created_at?: string
          entity_id?: string | null
          entity_table?: string | null
          hostel_branch_id?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json
          organization_id?: string | null
          request_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          app?: Database["public"]["Enums"]["saas_product"]
          created_at?: string
          entity_id?: string | null
          entity_table?: string | null
          hostel_branch_id?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json
          organization_id?: string | null
          request_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "audit_logs_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoice_counters: {
        Row: {
          fiscal_year: number
          hostel_branch_id: string
          next_value: number
          organization_id: string
          updated_at: string
        }
        Insert: {
          fiscal_year: number
          hostel_branch_id: string
          next_value?: number
          organization_id: string
          updated_at?: string
        }
        Update: {
          fiscal_year?: number
          hostel_branch_id?: string
          next_value?: number
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoice_counters_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "billing_invoice_counters_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "billing_invoice_counters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoice_items: {
        Row: {
          amount_cents: number
          created_at: string
          created_by: string | null
          description: string
          hostel_branch_id: string
          id: string
          invoice_id: string
          item_type: string
          metadata: Json
          organization_id: string
          quantity: number
          unit_amount_cents: number
        }
        Insert: {
          amount_cents: number
          created_at?: string
          created_by?: string | null
          description: string
          hostel_branch_id: string
          id?: string
          invoice_id: string
          item_type: string
          metadata?: Json
          organization_id: string
          quantity?: number
          unit_amount_cents: number
        }
        Update: {
          amount_cents?: number
          created_at?: string
          created_by?: string | null
          description?: string
          hostel_branch_id?: string
          id?: string
          invoice_id?: string
          item_type?: string
          metadata?: Json
          organization_id?: string
          quantity?: number
          unit_amount_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoice_items_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "billing_invoice_items_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "billing_invoice_items_invoice_fk"
            columns: ["invoice_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "billing_invoices"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          assignment_id: string | null
          balance_cents: number
          bed_id: string | null
          cashfree_order_id: string | null
          cashfree_payment_session_id: string | null
          created_at: string
          created_by: string | null
          currency_code: string
          deleted_at: string | null
          discount_cents: number
          due_date: string
          hostel_branch_id: string
          id: string
          invoice_month: string
          invoice_number: string
          issue_date: string
          metadata: Json
          organization_id: string
          paid_cents: number
          penalty_cents: number
          rent_plan_id: string | null
          room_id: string | null
          status: string
          student_id: string
          subtotal_cents: number
          total_cents: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assignment_id?: string | null
          balance_cents?: number
          bed_id?: string | null
          cashfree_order_id?: string | null
          cashfree_payment_session_id?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          discount_cents?: number
          due_date: string
          hostel_branch_id: string
          id?: string
          invoice_month: string
          invoice_number: string
          issue_date?: string
          metadata?: Json
          organization_id: string
          paid_cents?: number
          penalty_cents?: number
          rent_plan_id?: string | null
          room_id?: string | null
          status?: string
          student_id: string
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assignment_id?: string | null
          balance_cents?: number
          bed_id?: string | null
          cashfree_order_id?: string | null
          cashfree_payment_session_id?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          discount_cents?: number
          due_date?: string
          hostel_branch_id?: string
          id?: string
          invoice_month?: string
          invoice_number?: string
          issue_date?: string
          metadata?: Json
          organization_id?: string
          paid_cents?: number
          penalty_cents?: number
          rent_plan_id?: string | null
          room_id?: string | null
          status?: string
          student_id?: string
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_assignment_fk"
            columns: ["assignment_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "student_room_assignments"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "billing_invoices_bed_fk"
            columns: ["bed_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "room_beds"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "billing_invoices_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "billing_invoices_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "billing_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_rent_plan_fk"
            columns: ["rent_plan_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "rent_plans"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "billing_invoices_room_fk"
            columns: ["room_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "billing_invoices_student_fk"
            columns: ["student_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      billing_payment_allocations: {
        Row: {
          amount_cents: number
          created_at: string
          created_by: string | null
          hostel_branch_id: string
          id: string
          invoice_id: string
          organization_id: string
          payment_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          created_by?: string | null
          hostel_branch_id: string
          id?: string
          invoice_id: string
          organization_id: string
          payment_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          created_by?: string | null
          hostel_branch_id?: string
          id?: string
          invoice_id?: string
          organization_id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_payment_allocations_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "billing_payment_allocations_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "billing_payment_allocations_invoice_fk"
            columns: ["invoice_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "billing_invoices"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "billing_payment_allocations_payment_fk"
            columns: ["payment_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "billing_payments"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      billing_payments: {
        Row: {
          amount_cents: number
          created_at: string
          created_by: string | null
          currency_code: string
          deleted_at: string | null
          hostel_branch_id: string
          id: string
          idempotency_key: string | null
          metadata: Json
          notes: string | null
          organization_id: string
          payment_method: string
          provider: string | null
          provider_event_id: string | null
          provider_reference: string | null
          receipt_number: string
          received_at: string
          status: string
          student_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          hostel_branch_id: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          notes?: string | null
          organization_id: string
          payment_method: string
          provider?: string | null
          provider_event_id?: string | null
          provider_reference?: string | null
          receipt_number: string
          received_at?: string
          status?: string
          student_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          hostel_branch_id?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          notes?: string | null
          organization_id?: string
          payment_method?: string
          provider?: string | null
          provider_event_id?: string | null
          provider_reference?: string | null
          receipt_number?: string
          received_at?: string
          status?: string
          student_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_payments_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "billing_payments_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "billing_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_payments_student_fk"
            columns: ["student_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      billing_receipt_counters: {
        Row: {
          fiscal_year: number
          hostel_branch_id: string
          next_value: number
          organization_id: string
          updated_at: string
        }
        Insert: {
          fiscal_year: number
          hostel_branch_id: string
          next_value?: number
          organization_id: string
          updated_at?: string
        }
        Update: {
          fiscal_year?: number
          hostel_branch_id?: string
          next_value?: number
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_receipt_counters_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "billing_receipt_counters_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "billing_receipt_counters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_receipts: {
        Row: {
          amount_cents: number
          created_at: string
          created_by: string | null
          currency_code: string
          hostel_branch_id: string
          id: string
          issued_at: string
          metadata: Json
          organization_id: string
          payment_id: string
          receipt_number: string
          student_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          created_by?: string | null
          currency_code?: string
          hostel_branch_id: string
          id?: string
          issued_at?: string
          metadata?: Json
          organization_id: string
          payment_id: string
          receipt_number: string
          student_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          created_by?: string | null
          currency_code?: string
          hostel_branch_id?: string
          id?: string
          issued_at?: string
          metadata?: Json
          organization_id?: string
          payment_id?: string
          receipt_number?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_receipts_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "billing_receipts_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "billing_receipts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_receipts_payment_fk"
            columns: ["payment_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "billing_payments"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "billing_receipts_student_fk"
            columns: ["student_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      billing_runs: {
        Row: {
          created_at: string
          created_by: string | null
          generated_count: number
          hostel_branch_id: string
          id: string
          invoice_month: string
          metadata: Json
          organization_id: string
          skipped_count: number
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          generated_count?: number
          hostel_branch_id: string
          id?: string
          invoice_month: string
          metadata?: Json
          organization_id: string
          skipped_count?: number
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          generated_count?: number
          hostel_branch_id?: string
          id?: string
          invoice_month?: string
          metadata?: Json
          organization_id?: string
          skipped_count?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_runs_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "billing_runs_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "billing_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      gate_pass_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_at: string
          event_type: string
          gate_pass_id: string
          hostel_branch_id: string
          id: string
          metadata: Json
          notes: string | null
          organization_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_at?: string
          event_type: string
          gate_pass_id: string
          hostel_branch_id: string
          id?: string
          metadata?: Json
          notes?: string | null
          organization_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_at?: string
          event_type?: string
          gate_pass_id?: string
          hostel_branch_id?: string
          id?: string
          metadata?: Json
          notes?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gate_pass_events_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "gate_pass_events_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "gate_pass_events_gate_pass_fk"
            columns: ["gate_pass_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "gate_passes"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "gate_pass_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      gate_passes: {
        Row: {
          actual_exit_at: string | null
          actual_return_at: string | null
          approved_at: string | null
          approved_by: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          destination: string | null
          expected_exit_at: string
          expected_return_at: string
          guard_in_by: string | null
          guard_out_by: string | null
          hostel_branch_id: string
          id: string
          late_entry: boolean
          late_minutes: number
          leave_request_id: string | null
          metadata: Json
          notes: string | null
          organization_id: string
          purpose: string
          status: string
          student_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          actual_exit_at?: string | null
          actual_return_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          destination?: string | null
          expected_exit_at: string
          expected_return_at: string
          guard_in_by?: string | null
          guard_out_by?: string | null
          hostel_branch_id: string
          id?: string
          late_entry?: boolean
          late_minutes?: number
          leave_request_id?: string | null
          metadata?: Json
          notes?: string | null
          organization_id: string
          purpose: string
          status?: string
          student_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          actual_exit_at?: string | null
          actual_return_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          destination?: string | null
          expected_exit_at?: string
          expected_return_at?: string
          guard_in_by?: string | null
          guard_out_by?: string | null
          hostel_branch_id?: string
          id?: string
          late_entry?: boolean
          late_minutes?: number
          leave_request_id?: string | null
          metadata?: Json
          notes?: string | null
          organization_id?: string
          purpose?: string
          status?: string
          student_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gate_passes_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "gate_passes_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "gate_passes_leave_fk"
            columns: ["leave_request_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "student_leave_requests"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "gate_passes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gate_passes_student_fk"
            columns: ["student_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      hostel_branches: {
        Row: {
          address: Json
          code: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          metadata: Json
          name: string
          organization_id: string
          slug: string
          status: string
          timezone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: Json
          code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json
          name: string
          organization_id: string
          slug: string
          status?: string
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: Json
          code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string
          slug?: string
          status?: string
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_branches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_floors: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          floor_code: string
          hostel_branch_id: string
          id: string
          metadata: Json
          name: string
          organization_id: string
          sort_order: number
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          floor_code: string
          hostel_branch_id: string
          id?: string
          metadata?: Json
          name: string
          organization_id: string
          sort_order?: number
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          floor_code?: string
          hostel_branch_id?: string
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string
          sort_order?: number
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_floors_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "hostel_floors_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "hostel_floors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notice_acknowledgements: {
        Row: {
          acknowledged_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          hostel_branch_id: string | null
          id: string
          metadata: Json
          notice_id: string
          organization_id: string
          read_at: string
          student_id: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          metadata?: Json
          notice_id: string
          organization_id: string
          read_at?: string
          student_id?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          metadata?: Json
          notice_id?: string
          organization_id?: string
          read_at?: string
          student_id?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notice_acknowledgements_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "notice_acknowledgements_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "notice_acknowledgements_notice_fk"
            columns: ["notice_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "notice_boards"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "notice_acknowledgements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notice_acknowledgements_student_fk"
            columns: ["student_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      notice_boards: {
        Row: {
          app: Database["public"]["Enums"]["saas_product"]
          attachments: Json
          audience_type: string
          body: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          expires_at: string | null
          hostel_branch_id: string | null
          id: string
          metadata: Json
          notice_type: string
          organization_id: string
          pinned: boolean
          priority: string
          published_at: string | null
          scheduled_for: string | null
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          app?: Database["public"]["Enums"]["saas_product"]
          attachments?: Json
          audience_type?: string
          body: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          metadata?: Json
          notice_type?: string
          organization_id: string
          pinned?: boolean
          priority?: string
          published_at?: string | null
          scheduled_for?: string | null
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          app?: Database["public"]["Enums"]["saas_product"]
          attachments?: Json
          audience_type?: string
          body?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          metadata?: Json
          notice_type?: string
          organization_id?: string
          pinned?: boolean
          priority?: string
          published_at?: string | null
          scheduled_for?: string | null
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notice_boards_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "notice_boards_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "notice_boards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_delivery_attempts: {
        Row: {
          attempted_at: string | null
          channel: string
          created_at: string
          created_by: string | null
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          hostel_branch_id: string | null
          id: string
          notification_id: string
          organization_id: string
          provider: string | null
          provider_message_id: string | null
          recipient_id: string
          response_payload: Json
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attempted_at?: string | null
          channel: string
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          notification_id: string
          organization_id: string
          provider?: string | null
          provider_message_id?: string | null
          recipient_id: string
          response_payload?: Json
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attempted_at?: string | null
          channel?: string
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          notification_id?: string
          organization_id?: string
          provider?: string | null
          provider_message_id?: string | null
          recipient_id?: string
          response_payload?: Json
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_attempts_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "notification_delivery_attempts_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "notification_delivery_attempts_notification_fk"
            columns: ["notification_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "notification_delivery_attempts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_delivery_attempts_recipient_fk"
            columns: ["recipient_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "notification_recipients"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      notification_jobs: {
        Row: {
          app: Database["public"]["Enums"]["saas_product"]
          attempts: number
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          hostel_branch_id: string | null
          id: string
          job_type: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          organization_id: string
          payload: Json
          scheduled_for: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          app?: Database["public"]["Enums"]["saas_product"]
          attempts?: number
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          job_type: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          organization_id: string
          payload?: Json
          scheduled_for?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          app?: Database["public"]["Enums"]["saas_product"]
          attempts?: number
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          job_type?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          organization_id?: string
          payload?: Json
          scheduled_for?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_jobs_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "notification_jobs_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "notification_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          app: Database["public"]["Enums"]["saas_product"]
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email_enabled: boolean
          hostel_branch_id: string | null
          id: string
          in_app_enabled: boolean
          locale: string
          metadata: Json
          muted_notification_types: string[]
          organization_id: string
          quiet_hours: Json
          sms_enabled: boolean
          timezone: string
          updated_at: string
          updated_by: string | null
          user_id: string
          whatsapp_enabled: boolean
        }
        Insert: {
          app?: Database["public"]["Enums"]["saas_product"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email_enabled?: boolean
          hostel_branch_id?: string | null
          id?: string
          in_app_enabled?: boolean
          locale?: string
          metadata?: Json
          muted_notification_types?: string[]
          organization_id: string
          quiet_hours?: Json
          sms_enabled?: boolean
          timezone?: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
          whatsapp_enabled?: boolean
        }
        Update: {
          app?: Database["public"]["Enums"]["saas_product"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email_enabled?: boolean
          hostel_branch_id?: string | null
          id?: string
          in_app_enabled?: boolean
          locale?: string
          metadata?: Json
          muted_notification_types?: string[]
          organization_id?: string
          quiet_hours?: Json
          sms_enabled?: boolean
          timezone?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
          whatsapp_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "notification_preferences_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "notification_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_recipients: {
        Row: {
          attempts: number
          channel_preferences: Json
          created_at: string
          created_by: string | null
          deleted_at: string | null
          delivered_at: string | null
          delivery_status: string
          dismissed_at: string | null
          failure_reason: string | null
          hostel_branch_id: string | null
          id: string
          metadata: Json
          notification_id: string
          organization_id: string
          read_at: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          student_id: string | null
          updated_at: string
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          attempts?: number
          channel_preferences?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          delivery_status?: string
          dismissed_at?: string | null
          failure_reason?: string | null
          hostel_branch_id?: string | null
          id?: string
          metadata?: Json
          notification_id: string
          organization_id: string
          read_at?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          student_id?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          attempts?: number
          channel_preferences?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          delivery_status?: string
          dismissed_at?: string | null
          failure_reason?: string | null
          hostel_branch_id?: string | null
          id?: string
          metadata?: Json
          notification_id?: string
          organization_id?: string
          read_at?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          student_id?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_recipients_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "notification_recipients_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "notification_recipients_notification_fk"
            columns: ["notification_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "notification_recipients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_recipients_student_fk"
            columns: ["student_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          app: Database["public"]["Enums"]["saas_product"]
          audience_type: string
          body: string
          category: string
          created_at: string
          created_by: string | null
          dedupe_key: string | null
          deleted_at: string | null
          expires_at: string | null
          hostel_branch_id: string | null
          id: string
          metadata: Json
          notification_type: string
          organization_id: string
          scheduled_for: string | null
          severity: string
          source_id: string | null
          source_table: string | null
          status: string
          target_student_id: string | null
          target_user_id: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action_url?: string | null
          app?: Database["public"]["Enums"]["saas_product"]
          audience_type?: string
          body: string
          category?: string
          created_at?: string
          created_by?: string | null
          dedupe_key?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          metadata?: Json
          notification_type: string
          organization_id: string
          scheduled_for?: string | null
          severity?: string
          source_id?: string | null
          source_table?: string | null
          status?: string
          target_student_id?: string | null
          target_user_id?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action_url?: string | null
          app?: Database["public"]["Enums"]["saas_product"]
          audience_type?: string
          body?: string
          category?: string
          created_at?: string
          created_by?: string | null
          dedupe_key?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          metadata?: Json
          notification_type?: string
          organization_id?: string
          scheduled_for?: string | null
          severity?: string
          source_id?: string | null
          source_table?: string | null
          status?: string
          target_student_id?: string | null
          target_user_id?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "notifications_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_target_student_fk"
            columns: [
              "target_student_id",
              "organization_id",
              "hostel_branch_id",
            ]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          metadata: Json
          name: string
          slug: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json
          name: string
          slug: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json
          name?: string
          slug?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rent_plans: {
        Row: {
          amount_cents: number
          bed_id: string | null
          billing_cycle: string
          cashfree_config: Json
          code: string
          created_at: string
          created_by: string | null
          currency_code: string
          deleted_at: string | null
          discount_config: Json
          due_day: number
          ends_on: string | null
          hostel_branch_id: string
          id: string
          metadata: Json
          name: string
          organization_id: string
          penalty_config: Json
          room_id: string | null
          scope_type: string
          starts_on: string
          status: string
          student_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount_cents: number
          bed_id?: string | null
          billing_cycle?: string
          cashfree_config?: Json
          code: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          discount_config?: Json
          due_day?: number
          ends_on?: string | null
          hostel_branch_id: string
          id?: string
          metadata?: Json
          name: string
          organization_id: string
          penalty_config?: Json
          room_id?: string | null
          scope_type?: string
          starts_on?: string
          status?: string
          student_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount_cents?: number
          bed_id?: string | null
          billing_cycle?: string
          cashfree_config?: Json
          code?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          discount_config?: Json
          due_day?: number
          ends_on?: string | null
          hostel_branch_id?: string
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string
          penalty_config?: Json
          room_id?: string | null
          scope_type?: string
          starts_on?: string
          status?: string
          student_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rent_plans_bed_fk"
            columns: ["bed_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "room_beds"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "rent_plans_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "rent_plans_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "rent_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_plans_room_fk"
            columns: ["room_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "rent_plans_student_fk"
            columns: ["student_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      room_beds: {
        Row: {
          bed_code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          hostel_branch_id: string
          id: string
          metadata: Json
          organization_id: string
          room_id: string
          sort_order: number
          status: string
          status_reason: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bed_code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id: string
          id?: string
          metadata?: Json
          organization_id: string
          room_id: string
          sort_order?: number
          status?: string
          status_reason?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bed_code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id?: string
          id?: string
          metadata?: Json
          organization_id?: string
          room_id?: string
          sort_order?: number
          status?: string
          status_reason?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_beds_room_fk"
            columns: ["room_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      room_categories: {
        Row: {
          created_at: string
          created_by: string | null
          currency_code: string
          default_capacity: number | null
          deleted_at: string | null
          description: string | null
          hostel_branch_id: string
          id: string
          is_system: boolean
          metadata: Json
          monthly_rate_cents: number
          name: string
          organization_id: string
          security_deposit_cents: number
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency_code?: string
          default_capacity?: number | null
          deleted_at?: string | null
          description?: string | null
          hostel_branch_id: string
          id?: string
          is_system?: boolean
          metadata?: Json
          monthly_rate_cents?: number
          name: string
          organization_id: string
          security_deposit_cents?: number
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency_code?: string
          default_capacity?: number | null
          deleted_at?: string | null
          description?: string | null
          hostel_branch_id?: string
          id?: string
          is_system?: boolean
          metadata?: Json
          monthly_rate_cents?: number
          name?: string
          organization_id?: string
          security_deposit_cents?: number
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_categories_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "room_categories_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "room_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      room_templates: {
        Row: {
          bed_label_pattern: string
          created_at: string
          created_by: string | null
          currency_code: string
          default_capacity: number
          deleted_at: string | null
          description: string | null
          hostel_branch_id: string
          id: string
          is_system: boolean
          metadata: Json
          monthly_rate_cents: number
          name: string
          organization_id: string
          room_type_key: string
          security_deposit_cents: number
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bed_label_pattern?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          default_capacity?: number
          deleted_at?: string | null
          description?: string | null
          hostel_branch_id: string
          id?: string
          is_system?: boolean
          metadata?: Json
          monthly_rate_cents?: number
          name: string
          organization_id: string
          room_type_key: string
          security_deposit_cents?: number
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bed_label_pattern?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          default_capacity?: number
          deleted_at?: string | null
          description?: string | null
          hostel_branch_id?: string
          id?: string
          is_system?: boolean
          metadata?: Json
          monthly_rate_cents?: number
          name?: string
          organization_id?: string
          room_type_key?: string
          security_deposit_cents?: number
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_templates_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "room_templates_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "room_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number
          category_id: string | null
          created_at: string
          created_by: string | null
          currency_code: string
          deleted_at: string | null
          floor: string | null
          floor_id: string | null
          hostel_branch_id: string
          id: string
          metadata: Json
          monthly_rate_cents: number
          name: string
          organization_id: string
          pricing_metadata: Json
          room_code: string
          room_type: string
          security_deposit_cents: number
          status: string
          template_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          capacity: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          floor?: string | null
          floor_id?: string | null
          hostel_branch_id: string
          id?: string
          metadata?: Json
          monthly_rate_cents?: number
          name: string
          organization_id: string
          pricing_metadata?: Json
          room_code: string
          room_type?: string
          security_deposit_cents?: number
          status?: string
          template_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          capacity?: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string
          deleted_at?: string | null
          floor?: string | null
          floor_id?: string | null
          hostel_branch_id?: string
          id?: string
          metadata?: Json
          monthly_rate_cents?: number
          name?: string
          organization_id?: string
          pricing_metadata?: Json
          room_code?: string
          room_type?: string
          security_deposit_cents?: number
          status?: string
          template_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "rooms_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "rooms_category_org_branch_fk"
            columns: ["category_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "room_categories"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "rooms_floor_org_branch_fk"
            columns: ["floor_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "hostel_floors"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "rooms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_template_org_branch_fk"
            columns: ["template_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "room_templates"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      student_code_counters: {
        Row: {
          hostel_branch_id: string
          next_value: number
          organization_id: string
          updated_at: string
        }
        Insert: {
          hostel_branch_id: string
          next_value?: number
          organization_id: string
          updated_at?: string
        }
        Update: {
          hostel_branch_id?: string
          next_value?: number
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_code_counters_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "student_code_counters_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "student_code_counters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          document_type: string
          file_name: string
          hostel_branch_id: string
          id: string
          metadata: Json
          mime_type: string | null
          organization_id: string
          size_bytes: number | null
          status: string
          storage_bucket: string
          storage_path: string
          student_id: string
          updated_at: string
          updated_by: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_type: string
          file_name: string
          hostel_branch_id: string
          id?: string
          metadata?: Json
          mime_type?: string | null
          organization_id: string
          size_bytes?: number | null
          status?: string
          storage_bucket?: string
          storage_path: string
          student_id: string
          updated_at?: string
          updated_by?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_type?: string
          file_name?: string
          hostel_branch_id?: string
          id?: string
          metadata?: Json
          mime_type?: string | null
          organization_id?: string
          size_bytes?: number | null
          status?: string
          storage_bucket?: string
          storage_path?: string
          student_id?: string
          updated_at?: string
          updated_by?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_fk"
            columns: ["student_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      student_leave_requests: {
        Row: {
          actual_return_at: string | null
          approval_notes: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          destination_address: string | null
          expected_return_at: string
          hostel_branch_id: string
          id: string
          leave_type: string
          metadata: Json
          organization_id: string
          reason: string
          rejection_reason: string | null
          requested_by_user_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          starts_at: string
          status: string
          student_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          actual_return_at?: string | null
          approval_notes?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          destination_address?: string | null
          expected_return_at: string
          hostel_branch_id: string
          id?: string
          leave_type?: string
          metadata?: Json
          organization_id: string
          reason: string
          rejection_reason?: string | null
          requested_by_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          starts_at: string
          status?: string
          student_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          actual_return_at?: string | null
          approval_notes?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          destination_address?: string | null
          expected_return_at?: string
          hostel_branch_id?: string
          id?: string
          leave_type?: string
          metadata?: Json
          organization_id?: string
          reason?: string
          rejection_reason?: string | null
          requested_by_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          starts_at?: string
          status?: string
          student_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_leave_requests_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "student_leave_requests_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "student_leave_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_leave_requests_student_fk"
            columns: ["student_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      student_presence_jobs: {
        Row: {
          app: Database["public"]["Enums"]["saas_product"]
          attempts: number
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          hostel_branch_id: string | null
          id: string
          job_type: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          organization_id: string
          payload: Json
          scheduled_for: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          app?: Database["public"]["Enums"]["saas_product"]
          attempts?: number
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          job_type: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          organization_id: string
          payload?: Json
          scheduled_for?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          app?: Database["public"]["Enums"]["saas_product"]
          attempts?: number
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          job_type?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          organization_id?: string
          payload?: Json
          scheduled_for?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_presence_jobs_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "student_presence_jobs_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "student_presence_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      student_room_assignments: {
        Row: {
          bed_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          end_date: string | null
          hostel_branch_id: string
          id: string
          metadata: Json
          organization_id: string
          room_id: string
          start_date: string
          status: string
          student_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bed_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          end_date?: string | null
          hostel_branch_id: string
          id?: string
          metadata?: Json
          organization_id: string
          room_id: string
          start_date?: string
          status?: string
          student_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bed_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          end_date?: string | null
          hostel_branch_id?: string
          id?: string
          metadata?: Json
          organization_id?: string
          room_id?: string
          start_date?: string
          status?: string
          student_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_room_assignments_bed_fk"
            columns: ["bed_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "room_beds"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "student_room_assignments_room_fk"
            columns: ["room_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
          {
            foreignKeyName: "student_room_assignments_student_fk"
            columns: ["student_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      students: {
        Row: {
          admission_date: string
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          deleted_at: string | null
          email: string | null
          emergency_contact: Json
          first_name: string
          gender: string | null
          guardian_info: Json
          hostel_branch_id: string
          id: string
          last_name: string
          metadata: Json
          organization_id: string
          phone: string | null
          status: string
          student_code: string
          updated_at: string
          updated_by: string | null
          user_profile_id: string | null
        }
        Insert: {
          admission_date?: string
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact?: Json
          first_name: string
          gender?: string | null
          guardian_info?: Json
          hostel_branch_id: string
          id?: string
          last_name: string
          metadata?: Json
          organization_id: string
          phone?: string | null
          status?: string
          student_code: string
          updated_at?: string
          updated_by?: string | null
          user_profile_id?: string | null
        }
        Update: {
          admission_date?: string
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact?: Json
          first_name?: string
          gender?: string | null
          guardian_info?: Json
          hostel_branch_id?: string
          id?: string
          last_name?: string
          metadata?: Json
          organization_id?: string
          phone?: string | null
          status?: string
          student_code?: string
          updated_at?: string
          updated_by?: string | null
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "students_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "students_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_memberships: {
        Row: {
          accepted_at: string | null
          app: Database["public"]["Enums"]["saas_product"]
          created_at: string
          created_by: string | null
          deleted_at: string | null
          hostel_branch_id: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          scope: Json
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          app?: Database["public"]["Enums"]["saas_product"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          scope?: Json
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          app?: Database["public"]["Enums"]["saas_product"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          scope?: Json
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_memberships_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "tenant_memberships_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "tenant_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_role_definitions: {
        Row: {
          app: Database["public"]["Enums"]["saas_product"]
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_system: boolean
          name: string
          organization_id: string
          permissions: string[]
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          app?: Database["public"]["Enums"]["saas_product"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          organization_id: string
          permissions?: string[]
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          app?: Database["public"]["Enums"]["saas_product"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          organization_id?: string
          permissions?: string[]
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_role_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_settings: {
        Row: {
          app: Database["public"]["Enums"]["saas_product"]
          created_at: string
          created_by: string | null
          deleted_at: string | null
          hostel_branch_id: string | null
          id: string
          is_system: boolean
          key: string
          organization_id: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          app?: Database["public"]["Enums"]["saas_product"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          is_system?: boolean
          key: string
          organization_id: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          app?: Database["public"]["Enums"]["saas_product"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id?: string | null
          id?: string
          is_system?: boolean
          key?: string
          organization_id?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "tenant_settings_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "tenant_settings_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "tenant_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string
          full_name: string
          hostel_branch_id: string | null
          id: string
          is_active: boolean
          last_seen_at: string | null
          locale: string
          metadata: Json
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email: string
          full_name: string
          hostel_branch_id?: string | null
          id: string
          is_active?: boolean
          last_seen_at?: string | null
          locale?: string
          metadata?: Json
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string
          full_name?: string
          hostel_branch_id?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string | null
          locale?: string
          metadata?: Json
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "user_profiles_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_pass_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_at: string
          event_type: string
          hostel_branch_id: string
          id: string
          metadata: Json
          notes: string | null
          organization_id: string
          visitor_pass_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_at?: string
          event_type: string
          hostel_branch_id: string
          id?: string
          metadata?: Json
          notes?: string | null
          organization_id: string
          visitor_pass_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_at?: string
          event_type?: string
          hostel_branch_id?: string
          id?: string
          metadata?: Json
          notes?: string | null
          organization_id?: string
          visitor_pass_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_pass_events_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "visitor_pass_events_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "visitor_pass_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_pass_events_visitor_pass_fk"
            columns: ["visitor_pass_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "visitor_passes"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
      visitor_passes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          checked_in_at: string | null
          checked_out_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          hostel_branch_id: string
          id: string
          metadata: Json
          notes: string | null
          organization_id: string
          relationship: string | null
          scheduled_at: string
          status: string
          student_id: string | null
          updated_at: string
          updated_by: string | null
          visit_reason: string
          visitor_name: string
          visitor_phone: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id: string
          id?: string
          metadata?: Json
          notes?: string | null
          organization_id: string
          relationship?: string | null
          scheduled_at?: string
          status?: string
          student_id?: string | null
          updated_at?: string
          updated_by?: string | null
          visit_reason: string
          visitor_name: string
          visitor_phone?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hostel_branch_id?: string
          id?: string
          metadata?: Json
          notes?: string | null
          organization_id?: string
          relationship?: string | null
          scheduled_at?: string
          status?: string
          student_id?: string | null
          updated_at?: string
          updated_by?: string | null
          visit_reason?: string
          visitor_name?: string
          visitor_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitor_passes_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "visitor_passes_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "visitor_passes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_passes_student_fk"
            columns: ["student_id", "organization_id", "hostel_branch_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "organization_id", "hostel_branch_id"]
          },
        ]
      }
    }
    Views: {
      analytics_attendance_daily: {
        Row: {
          attendance_date: string | null
          hostel_branch_id: string | null
          organization_id: string | null
          record_count: number | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "attendance_records_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "attendance_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_billing_branch_summary: {
        Row: {
          balance_cents: number | null
          currency_code: string | null
          hostel_branch_id: string | null
          invoice_count: number | null
          invoiced_cents: number | null
          open_invoice_count: number | null
          organization_id: string | null
          overdue_cents: number | null
          overdue_invoice_count: number | null
          paid_cents: number | null
          paid_invoice_count: number | null
          pending_due_cents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "billing_invoices_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "billing_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_branch_occupancy: {
        Row: {
          active_rooms: number | null
          active_students: number | null
          available_beds: number | null
          branch_name: string | null
          hostel_branch_id: string | null
          occupancy_rate: number | null
          occupied_beds: number | null
          organization_id: string | null
          total_beds: number | null
          total_rooms: number | null
          unavailable_beds: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_branches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_leave_daily: {
        Row: {
          hostel_branch_id: string | null
          leave_date: string | null
          leave_type: string | null
          organization_id: string | null
          request_count: number | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_leave_requests_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "student_leave_requests_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "student_leave_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_monthly_branch_rollups: {
        Row: {
          active_students: number | null
          balance_cents: number | null
          collected_cents: number | null
          hostel_branch_id: string | null
          invoiced_cents: number | null
          metric_month: string | null
          occupancy_rate: number | null
          occupied_beds: number | null
          organization_id: string | null
          refreshed_at: string | null
          total_beds: number | null
        }
        Relationships: []
      }
      analytics_notification_summary: {
        Row: {
          delivered_count: number | null
          dismissed_count: number | null
          failed_count: number | null
          hostel_branch_id: string | null
          organization_id: string | null
          recipient_count: number | null
          unread_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_recipients_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "notification_recipients_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "notification_recipients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_revenue_daily: {
        Row: {
          collected_cents: number | null
          currency_code: string | null
          hostel_branch_id: string | null
          organization_id: string | null
          paying_students: number | null
          payment_count: number | null
          refunded_cents: number | null
          revenue_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_payments_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "billing_payments_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "billing_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_visitor_daily: {
        Row: {
          hostel_branch_id: string | null
          organization_id: string | null
          status: string | null
          visitor_count: number | null
          visitor_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitor_passes_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "analytics_branch_occupancy"
            referencedColumns: ["hostel_branch_id", "organization_id"]
          },
          {
            foreignKeyName: "visitor_passes_branch_org_fk"
            columns: ["hostel_branch_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "hostel_branches"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "visitor_passes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_invoice_adjustment: {
        Args: {
          p_actor_user_id: string
          p_amount_cents: number
          p_description: string
          p_invoice_id: string
          p_item_type: string
        }
        Returns: Json
      }
      assign_student_bed: {
        Args: {
          p_actor_user_id: string
          p_bed_id: string
          p_hostel_branch_id: string
          p_organization_id: string
          p_room_id: string
          p_student_id: string
        }
        Returns: Json
      }
      bootstrap_tenant: {
        Args: {
          p_actor_user_id: string
          p_address?: Json
          p_admin_email: string
          p_admin_full_name: string
          p_admin_user_id: string
          p_hostel_name: string
          p_hostel_slug: string
          p_organization_name: string
          p_organization_slug: string
          p_product: Database["public"]["Enums"]["saas_product"]
          p_settings?: Json
          p_timezone?: string
        }
        Returns: Json
      }
      create_room_bed: {
        Args: {
          p_actor_user_id: string
          p_bed_code: string
          p_hostel_branch_id: string
          p_organization_id: string
          p_room_id: string
          p_sort_order?: number
          p_status?: string
        }
        Returns: Json
      }
      create_room_with_beds: {
        Args: {
          p_actor_user_id: string
          p_bed_labels?: Json
          p_capacity?: number
          p_category_id?: string
          p_currency_code?: string
          p_floor?: string
          p_floor_id?: string
          p_hostel_branch_id: string
          p_metadata?: Json
          p_monthly_rate_cents?: number
          p_name: string
          p_organization_id: string
          p_room_code: string
          p_room_type?: string
          p_security_deposit_cents?: number
          p_status?: string
          p_template_id?: string
        }
        Returns: Json
      }
      create_student_with_assignment: {
        Args: {
          p_actor_user_id: string
          p_admission_date?: string
          p_bed_id?: string
          p_date_of_birth?: string
          p_email?: string
          p_emergency_contact?: Json
          p_first_name: string
          p_gender?: string
          p_guardian_info?: Json
          p_hostel_branch_id: string
          p_last_name: string
          p_metadata?: Json
          p_organization_id: string
          p_phone?: string
          p_room_id?: string
        }
        Returns: Json
      }
      dismiss_notification: {
        Args: { p_actor_user_id: string; p_recipient_id: string }
        Returns: Json
      }
      enqueue_billing_reminders: {
        Args: {
          p_actor_user_id: string
          p_due_before?: string
          p_hostel_branch_id: string
          p_organization_id: string
          p_reminder_kind?: string
        }
        Returns: Json
      }
      generate_monthly_rent_invoices: {
        Args: {
          p_actor_user_id: string
          p_hostel_branch_id: string
          p_invoice_month: string
          p_organization_id: string
        }
        Returns: Json
      }
      mark_notification_read: {
        Args: { p_actor_user_id: string; p_recipient_id: string }
        Returns: Json
      }
      perform_analytics_refresh_job: {
        Args: { p_job_id: string; p_worker_id?: string }
        Returns: Json
      }
      record_gate_pass_event: {
        Args: {
          p_actor_user_id: string
          p_event_type: string
          p_gate_pass_id: string
          p_notes?: string
        }
        Returns: Json
      }
      record_invoice_payment: {
        Args: {
          p_actor_user_id: string
          p_amount_cents: number
          p_idempotency_key?: string
          p_invoice_id: string
          p_metadata?: Json
          p_notes?: string
          p_payment_method: string
          p_provider?: string
          p_provider_event_id?: string
          p_provider_reference?: string
          p_received_at?: string
          p_request_id?: string
        }
        Returns: Json
      }
      record_leave_request_event: {
        Args: {
          p_actor_user_id: string
          p_event_type: string
          p_leave_request_id: string
          p_notes?: string
        }
        Returns: Json
      }
      record_visitor_pass_event: {
        Args: {
          p_actor_user_id: string
          p_event_type: string
          p_notes?: string
          p_visitor_pass_id: string
        }
        Returns: Json
      }
      refresh_analytics_monthly_branch_rollups: {
        Args: {
          p_actor_user_id: string
          p_hostel_branch_id?: string
          p_organization_id: string
        }
        Returns: Json
      }
      request_analytics_refresh: {
        Args: {
          p_actor_user_id: string
          p_hostel_branch_id?: string
          p_organization_id: string
          p_request_id?: string
        }
        Returns: Json
      }
      review_leave_request: {
        Args: {
          p_actor_user_id: string
          p_decision: string
          p_leave_request_id: string
          p_notes?: string
        }
        Returns: Json
      }
      soft_delete_room: {
        Args: {
          p_actor_user_id: string
          p_hostel_branch_id: string
          p_organization_id: string
          p_room_id: string
        }
        Returns: Json
      }
      soft_delete_student: {
        Args: {
          p_actor_user_id: string
          p_hostel_branch_id: string
          p_organization_id: string
          p_student_id: string
        }
        Returns: Json
      }
      transfer_student_bed: {
        Args: {
          p_actor_user_id: string
          p_hostel_branch_id: string
          p_organization_id: string
          p_reason?: string
          p_student_id: string
          p_target_bed_id: string
          p_target_room_id: string
        }
        Returns: Json
      }
      unassign_student_bed: {
        Args: {
          p_actor_user_id: string
          p_assignment_id: string
          p_hostel_branch_id: string
          p_organization_id: string
          p_reason?: string
        }
        Returns: Json
      }
      update_room_bed_status: {
        Args: {
          p_actor_user_id: string
          p_bed_id: string
          p_hostel_branch_id: string
          p_organization_id: string
          p_status: string
          p_status_reason?: string
        }
        Returns: Json
      }
      update_room_configuration: {
        Args: {
          p_actor_user_id: string
          p_bed_labels?: Json
          p_capacity?: number
          p_category_id?: string
          p_currency_code?: string
          p_floor?: string
          p_floor_id?: string
          p_hostel_branch_id: string
          p_metadata?: Json
          p_monthly_rate_cents?: number
          p_name: string
          p_organization_id: string
          p_room_code: string
          p_room_id: string
          p_room_type?: string
          p_security_deposit_cents?: number
          p_status?: string
          p_template_id?: string
        }
        Returns: Json
      }
      upsert_daily_attendance: {
        Args: {
          p_actor_user_id: string
          p_attendance_date: string
          p_hostel_branch_id: string
          p_notes?: string
          p_organization_id: string
          p_source?: string
          p_status: string
          p_student_id: string
        }
        Returns: Json
      }
      void_billing_invoice: {
        Args: {
          p_actor_user_id: string
          p_invoice_id: string
          p_reason?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "student"
      membership_status: "active" | "invited" | "suspended" | "revoked"
      saas_product:
        | "hostel_erp"
        | "clothing_shop_erp"
        | "gym_erp"
        | "inventory_erp"
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
      app_role: ["superadmin", "admin", "student"],
      membership_status: ["active", "invited", "suspended", "revoked"],
      saas_product: [
        "hostel_erp",
        "clothing_shop_erp",
        "gym_erp",
        "inventory_erp",
      ],
    },
  },
} as const


import { Database } from "@/integrations/supabase/types";

// Extend the Database type with our custom tables
export type AppDatabase = Database & {
  public: {
    Tables: {
      food_entries: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          image_url?: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          name?: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          image_url?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          daily_calorie_goal: number;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          daily_calorie_goal?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          daily_calorie_goal?: number;
        };
      };
      daily_totals: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      evc_payments: {
        Row: {
          id: string;
          created_at: string;
          phone_number: string;
          amount: number;
          email: string;
          transaction_id: string | null;
          status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          phone_number: string;
          amount: number;
          email: string;
          transaction_id?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          phone_number?: string;
          amount?: number;
          email?: string;
          transaction_id?: string | null;
          status?: string;
        };
      };
    };
  };
};

// Type for food entry data
export type FoodEntry = AppDatabase['public']['Tables']['food_entries']['Row'];
export type FoodEntryInsert = AppDatabase['public']['Tables']['food_entries']['Insert'];

// Type for profile data
export type Profile = AppDatabase['public']['Tables']['profiles']['Row'];
export type ProfileInsert = AppDatabase['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = AppDatabase['public']['Tables']['profiles']['Update'];

// Type for daily totals data
export type DailyTotal = AppDatabase['public']['Tables']['daily_totals']['Row'];
export type DailyTotalInsert = AppDatabase['public']['Tables']['daily_totals']['Insert'];
export type DailyTotalUpdate = AppDatabase['public']['Tables']['daily_totals']['Update'];

// Type for EVC payments
export type EVCPayment = AppDatabase['public']['Tables']['evc_payments']['Row'];
export type EVCPaymentInsert = AppDatabase['public']['Tables']['evc_payments']['Insert'];
export type EVCPaymentUpdate = AppDatabase['public']['Tables']['evc_payments']['Update'];


import { createClient } from '@supabase/supabase-js';

// Fallback values prevent the 'supabaseUrl is required' crash if environment variables aren't provided yet
import { Secrets } from "../src/config/secrets";

let _supabase: any = null;

export const getSupabase = () => {
  if (!_supabase) {
    const url = Secrets.SUPABASE_URL;
    const key = Secrets.SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.warn("Supabase not initialized: Missing URL or Anon Key");
      return null;
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
};

// For backward compatibility while encouraging use of getSupabase()
export const supabase = new Proxy({}, {
  get: (target, prop) => {
    const client = getSupabase();
    if (!client) throw new Error("Supabase client accessed before initialization");
    return client[prop];
  }
}) as any;

export const isSupabaseConfigured = () => !!Secrets.SUPABASE_URL && !!Secrets.SUPABASE_ANON_KEY;

export interface SupabaseLoan {
  id: string;
  borrower_name: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  deadline: string;
  cac_registration_status: string;
  created_at?: string;
  user_id?: string;
}

export interface SupabaseDocument {
  id?: string;
  loan_id: string;
  content: string;
  version: number;
  template_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
}

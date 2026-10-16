import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ndkwywtsbgfwhakfephw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Kkvhc2jcwVErkz27slSeRA_oJEOf__U';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  !supabaseUrl.includes('your-project-id') &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('your_publishable_key')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

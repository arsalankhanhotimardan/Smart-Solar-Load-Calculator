import { createClient } from '@supabase/supabase-js';

// These lines grab the secret keys you just saved in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This creates the bridge!
export const supabase = createClient(supabaseUrl, supabaseKey);
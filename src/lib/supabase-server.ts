import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key
// This should NEVER be exposed to the client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export type Prompt = {
  id: string;
  user_id: string;
  name: string;
  role: string;
  context: string;
  security: string;
  task: string;
  guidelines?: string;
  examples?: string;
  language?: string;
  language_enabled: boolean;
  response_format: string;
  created_at: string;
  updated_at: string;
};

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

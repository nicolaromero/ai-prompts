// Script to setup database tables directly
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🔄 Reading SQL schema...');
    const schemaPath = join(process.cwd(), 'supabase', 'complete-schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    console.log('🔄 Executing SQL...');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          console.error('❌ Error executing statement:', error);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }

    console.log('✅ Database setup complete!');

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user', 'session', 'account', 'verification', 'prompts']);

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
    } else {
      console.log('✅ Tables created:',tables?.map(t => t.table_name).join(', '));
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();

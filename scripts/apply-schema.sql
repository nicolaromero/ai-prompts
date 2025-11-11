-- Just print instructions, don't execute
cat << 'INSTRUCTIONS'

╔══════════════════════════════════════════════════════════════╗
║  MANUAL SETUP REQUIRED - Execute in Supabase SQL Editor    ║
╚══════════════════════════════════════════════════════════════╝

Follow these steps:

1. Go to: https://supabase.com/dashboard/project/ubmmhdnaseahsnotunyf/sql

2. Click "New Query"

3. Copy the contents of: supabase/complete-schema.sql

4. Paste into the SQL Editor

5. Click "Run" (or press Cmd/Ctrl + Enter)

6. You should see: "Success. No rows returned"

7. Verify in Table Editor that these tables were created:
   ✓ user
   ✓ session  
   ✓ account
   ✓ verification
   ✓ prompts

INSTRUCTIONS

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role TEXT NOT NULL,
  context TEXT NOT NULL,
  security TEXT NOT NULL,
  task TEXT NOT NULL,
  guidelines TEXT,
  examples TEXT,
  language VARCHAR(100),
  language_enabled BOOLEAN DEFAULT false,
  response_format TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own prompts
CREATE POLICY "Users can view own prompts" ON prompts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own prompts
CREATE POLICY "Users can insert own prompts" ON prompts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own prompts
CREATE POLICY "Users can update own prompts" ON prompts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own prompts
CREATE POLICY "Users can delete own prompts" ON prompts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

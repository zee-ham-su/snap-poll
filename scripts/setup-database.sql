-- Create tables for our poll application
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID
);

CREATE TABLE IF NOT EXISTS options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  user_id UUID,
  anonymous_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT one_vote_per_user_per_poll UNIQUE (option_id, user_id),
  CONSTRAINT one_vote_per_anonymous_per_poll UNIQUE (option_id, anonymous_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_options_poll_id ON options(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id);

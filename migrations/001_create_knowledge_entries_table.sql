-- Enable extension for UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create table for knowledge entries
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding JSONB NOT NULL,  -- Store the embedding as a JSON array
  source TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confidence REAL NOT NULL
);

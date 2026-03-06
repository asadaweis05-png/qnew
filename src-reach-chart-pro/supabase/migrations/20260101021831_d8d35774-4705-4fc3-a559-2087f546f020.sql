-- Add priority column to goals table
ALTER TABLE public.goals ADD COLUMN priority text NOT NULL DEFAULT 'medium';

-- Add check constraint for valid priority values
ALTER TABLE public.goals ADD CONSTRAINT goals_priority_check CHECK (priority IN ('low', 'medium', 'high'));
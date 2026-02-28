-- Create course_waitlist table
CREATE TABLE IF NOT EXISTS public.course_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_waitlist ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view waitlist"
ON public.course_waitlist
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can join waitlist"
ON public.course_waitlist
FOR INSERT
WITH CHECK (true);

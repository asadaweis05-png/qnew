-- Create course_lessons table
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_id TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view course lessons"
ON public.course_lessons
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage course lessons"
ON public.course_lessons
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

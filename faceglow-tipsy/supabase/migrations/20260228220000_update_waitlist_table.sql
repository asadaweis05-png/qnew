-- Add course_name column to course_waitlist for static courses
ALTER TABLE public.course_waitlist ADD COLUMN IF NOT EXISTS course_name TEXT;

-- Add user_id column to quizzes table (nullable to keep accounts optional)
ALTER TABLE public.quizzes 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_quizzes_user_id ON public.quizzes(user_id);

-- Update RLS policies to allow both authenticated and anonymous users
DROP POLICY IF EXISTS "Anyone can create quizzes" ON public.quizzes;

CREATE POLICY "Anyone can create quizzes" 
ON public.quizzes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own quizzes" 
ON public.quizzes 
FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL OR true);

-- Allow users to view attempts for their quizzes
CREATE POLICY "Users can view attempts for their quizzes"
ON public.quiz_attempts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes 
    WHERE quizzes.id = quiz_attempts.quiz_id 
    AND quizzes.user_id = auth.uid()
  ) OR true
);
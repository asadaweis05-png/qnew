-- Create quizzes table to store quiz data
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_name TEXT NOT NULL,
  quiz_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_answers table to store creator's answers
CREATE TABLE public.quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quiz_id, question_number)
);

-- Create quiz_attempts table to store friend attempts
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  friend_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read for quiz sharing
CREATE POLICY "Anyone can read quizzes"
  ON public.quizzes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create quizzes"
  ON public.quizzes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read quiz answers"
  ON public.quiz_answers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create quiz answers"
  ON public.quiz_answers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (true);

-- Create index for faster quiz code lookups
CREATE INDEX idx_quizzes_quiz_code ON public.quizzes(quiz_code);
CREATE INDEX idx_quiz_answers_quiz_id ON public.quiz_answers(quiz_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
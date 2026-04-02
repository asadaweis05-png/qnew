-- ============================================================
-- BARASHADA TOOSKA AH — Learning Platform Database Schema
-- All tables prefixed with lp_ to avoid conflicts
-- ============================================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS public.lp_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_so TEXT,  -- Somali translation
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,  -- emoji or icon name
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Instructors
CREATE TABLE IF NOT EXISTS public.lp_instructors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    expertise TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Courses
CREATE TABLE IF NOT EXISTS public.lp_courses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_desc TEXT,
    thumbnail_url TEXT,
    intro_video_id TEXT,  -- YouTube video ID
    category_id UUID REFERENCES public.lp_categories(id) ON DELETE SET NULL,
    instructor_id UUID REFERENCES public.lp_instructors(id) ON DELETE SET NULL,
    language TEXT NOT NULL DEFAULT 'so',  -- 'so' = Somali, 'en' = English
    level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    duration_hours NUMERIC(5,1) DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT true,
    price NUMERIC(10,2) DEFAULT 0,
    rating NUMERIC(2,1) DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Lessons
CREATE TABLE IF NOT EXISTS public.lp_lessons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.lp_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_id TEXT NOT NULL,  -- YouTube video ID
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_free_preview BOOLEAN DEFAULT false,
    resources JSONB DEFAULT '[]',  -- [{name, url, type}]
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Enrollments
CREATE TABLE IF NOT EXISTS public.lp_enrollments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.lp_courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    progress_pct NUMERIC(5,2) DEFAULT 0,
    UNIQUE(user_id, course_id)
);

-- 6. Progress Tracking (per lesson)
CREATE TABLE IF NOT EXISTS public.lp_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lp_lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.lp_courses(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    watch_time_seconds INTEGER DEFAULT 0,
    UNIQUE(user_id, lesson_id)
);

-- 7. Quizzes
CREATE TABLE IF NOT EXISTS public.lp_quizzes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.lp_courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lp_lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    pass_percentage NUMERIC(5,2) DEFAULT 70,
    time_limit_minutes INTEGER,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Quiz Questions
CREATE TABLE IF NOT EXISTS public.lp_quiz_questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES public.lp_quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    options JSONB DEFAULT '[]',  -- [{text, is_correct}]
    correct_answer TEXT,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0
);

-- 9. Quiz Attempts
CREATE TABLE IF NOT EXISTS public.lp_quiz_attempts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES public.lp_quizzes(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    passed BOOLEAN NOT NULL,
    answers JSONB DEFAULT '[]',  -- [{question_id, answer, is_correct}]
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- 10. Certificates
CREATE TABLE IF NOT EXISTS public.lp_certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    verification_id TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.lp_courses(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    course_title TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_verified BOOLEAN DEFAULT false,  -- true if paid for verified cert
    payment_id UUID,
    pdf_url TEXT,
    UNIQUE(user_id, course_id)
);

-- 11. Payments
CREATE TABLE IF NOT EXISTS public.lp_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.lp_courses(id) ON DELETE SET NULL,
    stripe_session_id TEXT,
    stripe_payment_intent TEXT,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_type TEXT DEFAULT 'certificate' CHECK (payment_type IN ('certificate', 'course')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Reviews
CREATE TABLE IF NOT EXISTS public.lp_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.lp_courses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, course_id)
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_lp_courses_category ON public.lp_courses(category_id);
CREATE INDEX IF NOT EXISTS idx_lp_courses_slug ON public.lp_courses(slug);
CREATE INDEX IF NOT EXISTS idx_lp_courses_published ON public.lp_courses(is_published);
CREATE INDEX IF NOT EXISTS idx_lp_lessons_course ON public.lp_lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lp_enrollments_user ON public.lp_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_lp_enrollments_course ON public.lp_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lp_progress_user ON public.lp_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_lp_certificates_verify ON public.lp_certificates(verification_id);
CREATE INDEX IF NOT EXISTS idx_lp_reviews_course ON public.lp_reviews(course_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.lp_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_reviews ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read categories" ON public.lp_categories FOR SELECT USING (true);
CREATE POLICY "Public read instructors" ON public.lp_instructors FOR SELECT USING (true);
CREATE POLICY "Public read published courses" ON public.lp_courses FOR SELECT USING (is_published = true);
CREATE POLICY "Public read lessons of published courses" ON public.lp_lessons FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.lp_courses WHERE id = course_id AND is_published = true)
);
CREATE POLICY "Public read quizzes" ON public.lp_quizzes FOR SELECT USING (true);
CREATE POLICY "Public read quiz questions" ON public.lp_quiz_questions FOR SELECT USING (true);
CREATE POLICY "Public read certificates" ON public.lp_certificates FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON public.lp_reviews FOR SELECT USING (true);

-- Authenticated user policies
CREATE POLICY "Users manage own enrollments" ON public.lp_enrollments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own progress" ON public.lp_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own quiz attempts" ON public.lp_quiz_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own payments" ON public.lp_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own reviews" ON public.lp_reviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin full access (using service role key in API routes)
CREATE POLICY "Admin full access courses" ON public.lp_courses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access lessons" ON public.lp_lessons FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access quizzes" ON public.lp_quizzes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access quiz questions" ON public.lp_quiz_questions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin insert payments" ON public.lp_payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin insert certificates" ON public.lp_certificates FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- FUNCTIONS: Auto-update enrollment progress
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    new_pct NUMERIC(5,2);
BEGIN
    SELECT COUNT(*) INTO total_lessons FROM public.lp_lessons WHERE course_id = NEW.course_id;
    SELECT COUNT(*) INTO completed_lessons FROM public.lp_progress WHERE user_id = NEW.user_id AND course_id = NEW.course_id AND completed = true;
    
    IF total_lessons > 0 THEN
        new_pct := (completed_lessons::NUMERIC / total_lessons::NUMERIC) * 100;
    ELSE
        new_pct := 0;
    END IF;

    UPDATE public.lp_enrollments 
    SET progress_pct = new_pct,
        completed_at = CASE WHEN new_pct >= 100 THEN now() ELSE NULL END
    WHERE user_id = NEW.user_id AND course_id = NEW.course_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_enrollment_progress
AFTER INSERT OR UPDATE ON public.lp_progress
FOR EACH ROW EXECUTE FUNCTION public.update_enrollment_progress();

-- ============================================================
-- SEED: Default categories
-- ============================================================
INSERT INTO public.lp_categories (name, name_so, slug, icon, sort_order) VALUES
('Technology', 'Tignoolajiyada', 'technology', '💻', 1),
('AI & Machine Learning', 'AI & Barashada Mashiinka', 'ai-ml', '🤖', 2),
('Business', 'Ganacsiga', 'business', '📊', 3),
('Language', 'Luqadda', 'language', '🗣️', 4),
('Design', 'Naqshadeynta', 'design', '🎨', 5),
('Health', 'Caafimaadka', 'health', '🏥', 6),
('Science', 'Sayniska', 'science', '🔬', 7),
('Personal Development', 'Horumarinta Shakhsiga', 'personal-dev', '🌟', 8)
ON CONFLICT (slug) DO NOTHING;

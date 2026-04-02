export interface Category {
  id: string; name: string; name_so: string; slug: string; description: string; icon: string; sort_order: number;
}
export interface Course {
  id: string; title: string; slug: string; description: string; short_desc: string;
  thumbnail_url: string; intro_video_id: string; category_id: string;
  instructor_id: string; language: string; level: string; duration_hours: number;
  total_lessons: number; is_published: boolean; is_free: boolean; price: number;
  rating: number; enrollment_count: number; tags: string[];
  created_at: string; updated_at: string;
  lp_categories?: Category; lp_instructors?: Instructor;
  lp_lessons?: Lesson[];
}
export interface Lesson {
  id: string; course_id: string; title: string; description: string;
  video_id: string; duration_minutes: number; order_index: number;
  is_free_preview: boolean; resources: { name: string; url: string; type: string }[];
}
export interface Instructor {
  id: string; user_id: string; name: string; bio: string; avatar_url: string; expertise: string[];
}
export interface Enrollment {
  id: string; user_id: string; course_id: string; enrolled_at: string;
  completed_at: string | null; progress_pct: number;
  lp_courses?: Course;
}
export interface Progress {
  id: string; user_id: string; lesson_id: string; course_id: string;
  completed: boolean; completed_at: string | null; watch_time_seconds: number;
}
export interface Quiz {
  id: string; course_id: string; lesson_id: string | null; title: string;
  description: string; pass_percentage: number; time_limit_minutes: number | null;
  lp_quiz_questions?: QuizQuestion[];
}
export interface QuizQuestion {
  id: string; quiz_id: string; question: string; question_type: string;
  options: { text: string; is_correct: boolean }[]; correct_answer: string;
  explanation: string; points: number; order_index: number;
}
export interface Certificate {
  id: string; verification_id: string; user_id: string; course_id: string;
  user_name: string; course_title: string; issued_at: string;
  is_verified: boolean; pdf_url: string;
}

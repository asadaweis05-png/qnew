import { createServerSupabase } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, Clock, BarChart3, Globe, Star, Users, Play, CheckCircle, ArrowRight } from "lucide-react";
import { EnrollButton } from "@/components/EnrollButton";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  
  const { data: course } = await supabase.from("lp_courses")
    .select("*, lp_categories(name, icon, slug), lp_instructors(name, bio, avatar_url), lp_lessons(id, title, duration_minutes, order_index, is_free_preview, video_id)")
    .eq("slug", slug).eq("is_published", true).single();

  if (!course) notFound();

  const lessons = (course.lp_lessons || []).sort((a: any, b: any) => a.order_index - b.order_index);
  const { count: reviewCount } = await supabase.from("lp_reviews").select("*", { count: "exact", head: true }).eq("course_id", course.id);
  const { data: reviews } = await supabase.from("lp_reviews").select("*").eq("course_id", course.id).order("created_at", { ascending: false }).limit(5);

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative py-16 px-5 border-b border-white/[0.05]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff]/[0.03] to-transparent pointer-events-none"/>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 relative z-10">
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="badge">{(course.lp_categories as any)?.icon} {(course.lp_categories as any)?.name}</div>
              <span className="text-xs text-[#64748b] capitalize">{course.level}</span>
              {course.is_free && <span className="bg-[#10b981]/15 text-[#10b981] text-[10px] font-bold px-2 py-0.5 rounded">FREE</span>}
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">{course.title}</h1>
            <p className="text-[#94a3b8] text-sm leading-relaxed mb-6 max-w-2xl">{course.description}</p>
            
            {/* Meta */}
            <div className="flex flex-wrap gap-5 text-xs text-[#94a3b8] mb-8">
              <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-[#00e5ff]"/> {course.total_lessons} Lessons</span>
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#00e5ff]"/> {course.duration_hours}h</span>
              <span className="flex items-center gap-1.5"><BarChart3 size={14} className="text-[#00e5ff]"/> {course.level}</span>
              <span className="flex items-center gap-1.5"><Globe size={14} className="text-[#00e5ff]"/> {course.language === "so" ? "Somali" : "English"}</span>
              <span className="flex items-center gap-1.5"><Users size={14} className="text-[#00e5ff]"/> {course.enrollment_count} students</span>
              {course.rating > 0 && <span className="flex items-center gap-1.5"><Star size={14} className="text-[#f59e0b]" fill="#f59e0b"/> {course.rating} ({reviewCount} reviews)</span>}
            </div>

            <EnrollButton 
              courseId={course.id} 
              courseSlug={course.slug}
              isFree={course.is_free}
              price={course.price}
              courseTitle={course.title}
            />
          </div>

          {/* Thumbnail / Video */}
          <div className="lg:w-[420px] flex-shrink-0">
            <div className="glass-card overflow-hidden hover:transform-none">
              <div className="relative aspect-video bg-[#111827]">
                <img src={course.thumbnail_url || `https://img.youtube.com/vi/${course.intro_video_id}/hqdefault.jpg`}
                  alt={course.title} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#00e5ff]/90 flex items-center justify-center shadow-lg shadow-[#00e5ff]/40">
                    <Play size={28} fill="#000" className="text-black ml-1"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-14 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
            <BookOpen size={20} className="text-[#00e5ff]"/> Course Curriculum
            <span className="text-xs text-[#64748b] font-normal ml-2">{lessons.length} lessons</span>
          </h2>
          <div className="space-y-3">
            {lessons.map((lesson: any, i: number) => (
              <div key={lesson.id} className="glass-card p-4 flex items-center gap-4 hover:transform-none cursor-default">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-xs font-bold text-[#64748b] flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#cbd5e1] truncate">{lesson.title}</div>
                  <div className="text-[10px] text-[#64748b] mt-0.5">{lesson.duration_minutes} min</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {lesson.is_free_preview && <span className="text-[10px] text-[#10b981] font-bold">Preview</span>}
                  <Play size={14} className="text-[#64748b]"/>
                </div>
              </div>
            ))}
            {lessons.length === 0 && (
              <div className="text-center py-12 text-[#64748b] text-sm">
                Curriculum coming soon
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Instructor */}
      {course.lp_instructors && (
        <section className="py-14 px-5 border-t border-white/[0.05]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-6">Instructor</h2>
            <div className="glass-card p-6 flex items-start gap-5 hover:transform-none">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00e5ff] to-[#3b82f6] flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                {(course.lp_instructors as any).name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base">{(course.lp_instructors as any).name}</h3>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">{(course.lp_instructors as any).bio}</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

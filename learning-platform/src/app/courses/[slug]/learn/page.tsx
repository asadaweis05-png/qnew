"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { CheckCircle, Play, ChevronRight } from "lucide-react";

export default function LearnPage() {
  const supabase = createClient();
  const params = useParams();
  const slug = params.slug as string;
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: c } = await supabase.from("lp_courses").select("*, lp_lessons(*)").eq("slug", slug).single();
    if (!c) return;
    setCourse(c);
    const sorted = (c.lp_lessons || []).sort((a: any, b: any) => a.order_index - b.order_index);
    setLessons(sorted);
    if (sorted.length > 0) setCurrentLesson(sorted[0]);

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: prog } = await supabase.from("lp_progress").select("lesson_id, completed").eq("user_id", session.user.id).eq("course_id", c.id);
      const map: Record<string, boolean> = {};
      (prog || []).forEach((p: any) => { map[p.lesson_id] = p.completed; });
      setProgress(map);
    }
  }

  async function markComplete(lessonId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !course) return;
    await supabase.from("lp_progress").upsert({
      user_id: session.user.id, lesson_id: lessonId, course_id: course.id, completed: true, completed_at: new Date().toISOString()
    }, { onConflict: "user_id,lesson_id" });
    setProgress(p => ({ ...p, [lessonId]: true }));
  }

  const completedCount = Object.values(progress).filter(Boolean).length;
  const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  if (!course) return <div className="pt-24 text-center text-[#64748b]">Loading...</div>;

  return (
    <div className="pt-16 flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-80" : "w-0"} bg-[#0d1220] border-r border-white/[0.07] flex-shrink-0 overflow-hidden transition-all duration-200 flex flex-col`}>
        <div className="p-5 border-b border-white/[0.07]">
          <h2 className="text-sm font-bold text-white truncate">{course.title}</h2>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-[#64748b] mb-1.5">
              <span>{completedCount}/{lessons.length} lessons</span>
              <span className="text-[#00e5ff] font-bold">{pct}%</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }}/></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {lessons.map((l, i) => (
            <button key={l.id} onClick={() => setCurrentLesson(l)}
              className={`w-full text-left px-5 py-3.5 flex items-center gap-3 border-b border-white/[0.04] transition-colors ${
                currentLesson?.id === l.id ? "bg-[#00e5ff]/[0.08]" : "hover:bg-white/[0.02]"
              }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                progress[l.id] ? "bg-[#10b981] text-white" : currentLesson?.id === l.id ? "bg-[#00e5ff] text-black" : "bg-white/[0.06] text-[#64748b]"
              }`}>
                {progress[l.id] ? <CheckCircle size={12}/> : i + 1}
              </div>
              <span className={`text-xs truncate ${currentLesson?.id === l.id ? "text-white font-semibold" : "text-[#94a3b8]"}`}>{l.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main video area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden absolute top-20 left-2 z-10 bg-[#0d1220] border border-white/[0.07] rounded-lg p-2 text-white">
          <ChevronRight size={16} className={sidebarOpen ? "rotate-180" : ""}/>
        </button>

        {currentLesson ? (
          <>
            <div className="bg-black flex-shrink-0">
              <div className="max-w-5xl mx-auto">
                <div style={{ position: "relative", paddingTop: "56.25%" }}>
                  <iframe src={`https://www.youtube-nocookie.com/embed/${currentLesson.video_id}?autoplay=1&modestbranding=1&rel=0`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}/>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/[0.07] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{currentLesson.title}</h3>
                <p className="text-xs text-[#64748b] mt-1">{currentLesson.duration_minutes} min · Lesson {lessons.indexOf(currentLesson) + 1} of {lessons.length}</p>
              </div>
              <div className="flex gap-3">
                {!progress[currentLesson.id] && (
                  <button onClick={() => markComplete(currentLesson.id)} className="btn-accent text-xs !py-2 !px-4">
                    <CheckCircle size={14}/> Mark Complete
                  </button>
                )}
                {lessons.indexOf(currentLesson) < lessons.length - 1 && (
                  <button onClick={() => setCurrentLesson(lessons[lessons.indexOf(currentLesson) + 1])} className="btn-outline text-xs !py-2 !px-4">
                    Next <ChevronRight size={14}/>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#64748b]">Select a lesson to start</div>
        )}
      </div>
    </div>
  );
}

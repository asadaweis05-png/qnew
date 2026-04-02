"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { BookOpen, ArrowRight, Clock, Trophy, Play, Award } from "lucide-react";

export default function DashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/auth/login"; return; }
      setUser(session.user);

      const { data } = await supabase.from("lp_enrollments")
        .select("*, lp_courses(id, title, slug, thumbnail_url, intro_video_id, total_lessons, duration_hours)")
        .eq("user_id", session.user.id).order("enrolled_at", { ascending: false });
      setEnrollments(data || []);
      setLoading(false);
    })();
  }, []);

  const completed = enrollments.filter(e => e.progress_pct >= 100);
  const inProgress = enrollments.filter(e => e.progress_pct < 100);

  if (loading) return <div className="pt-24 text-center text-[#64748b]">Loading...</div>;

  return (
    <div className="pt-16 min-h-screen">
      <section className="py-12 px-5 border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            Welcome back, <span className="text-[#00e5ff]">{user?.user_metadata?.full_name || user?.email?.split("@")[0]}</span>
          </h1>
          <p className="text-[#64748b] text-sm">Track your learning progress</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: BookOpen, val: enrollments.length, label: "Enrolled", color: "#00e5ff" },
            { icon: Play, val: inProgress.length, label: "In Progress", color: "#f59e0b" },
            { icon: Trophy, val: completed.length, label: "Completed", color: "#10b981" },
            { icon: Clock, val: `${enrollments.reduce((s, e) => s + (e.lp_courses?.duration_hours || 0), 0)}h`, label: "Learning Time", color: "#a855f7" },
          ].map((s, i) => (
            <div key={i} className="glass-card p-5 hover:transform-none">
              <s.icon size={20} style={{ color: s.color }} className="mb-3"/>
              <div className="text-2xl font-extrabold">{s.val}</div>
              <div className="text-[10px] text-[#64748b] font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* In Progress */}
        {inProgress.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Play size={18} className="text-[#f59e0b]"/> Continue Learning</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {inProgress.map(e => (
                <Link key={e.id} href={`/courses/${e.lp_courses.slug}/learn`} className="glass-card p-5 flex gap-5 items-center no-underline group">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#111827]">
                    <img src={e.lp_courses.thumbnail_url || `https://img.youtube.com/vi/${e.lp_courses.intro_video_id}/hqdefault.jpg`}
                      alt="" className="w-full h-full object-cover"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{e.lp_courses.title}</h3>
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-[#64748b] mb-1">
                        <span>{e.lp_courses.total_lessons} lessons</span>
                        <span className="text-[#00e5ff] font-bold">{Math.round(e.progress_pct)}%</span>
                      </div>
                      <div className="progress-track"><div className="progress-fill" style={{ width: `${e.progress_pct}%` }}/></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Trophy size={18} className="text-[#10b981]"/> Completed</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {completed.map(e => (
                <div key={e.id} className="glass-card p-5 flex gap-5 items-center hover:transform-none">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#111827]">
                    <img src={e.lp_courses.thumbnail_url || `https://img.youtube.com/vi/${e.lp_courses.intro_video_id}/hqdefault.jpg`}
                      alt="" className="w-full h-full object-cover"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{e.lp_courses.title}</h3>
                    <div className="flex justify-between items-center mt-2 group-hover:opacity-100 transition-opacity">
                      <div className="text-[10px] text-[#10b981] font-bold">✓ Completed</div>
                      <a 
                        href={`/api/certificates?userId=${user.id}&courseId=${e.course_id}`}
                        className="text-[10px] bg-[#00e5ff] text-black font-black px-3 py-1.5 rounded-lg no-underline hover:opacity-80 transition-all flex items-center gap-1"
                      >
                        <Award size={10} /> Download Cert
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {enrollments.length === 0 && (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto mb-4 text-[#1e293b]"/>
            <p className="text-[#64748b] font-medium mb-4">You haven&apos;t enrolled in any courses yet</p>
            <Link href="/courses" className="btn-accent no-underline">Browse Courses <ArrowRight size={16}/></Link>
          </div>
        )}
      </div>
    </div>
  );
}

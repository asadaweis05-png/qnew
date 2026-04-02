"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { 
  Users, BookOpen, Award, BarChart3, Plus, Edit, Trash2, 
  ExternalLink, CheckCircle, AlertCircle, Loader2 
} from "lucide-react";

export default function AdminDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
    loadStats();
  }, []);

  async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.email !== "asadaweis05@gmail.com") {
      window.location.href = "/";
      return;
    }
  }

  async function loadStats() {
    setLoading(true);
    try {
      const [
        { count: students },
        { count: courses },
        { count: enrollments },
        { data: coursesData }
      ] = await Promise.all([
        supabase.from("lp_enrollments").select("user_id", { count: "exact", head: true }),
        supabase.from("lp_courses").select("*", { count: "exact", head: true }),
        supabase.from("lp_enrollments").select("*", { count: "exact", head: true }),
        supabase.from("lp_courses").select("*").order("created_at", { ascending: false }).limit(5)
      ]);

      setStats({
        totalStudents: students || 0,
        totalCourses: courses || 0,
        totalEnrollments: enrollments || 0,
        totalRevenue: 0 // Placeholder
      });
      setRecentCourses(coursesData || []);
    } catch (error) {
      console.error("Stats error:", error);
    }
    setLoading(false);
  }

  if (loading) return (
    <div className="pt-24 flex flex-col items-center justify-center text-[#64748b]">
      <Loader2 className="animate-spin mb-4" size={40} />
      <span>Loading administrative data...</span>
    </div>
  );

  return (
    <div className="pt-16 min-h-screen">
      <header className="py-12 px-5 border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="badge mb-2">🛡️ Admin Control</div>
            <h1 className="text-3xl font-extrabold tracking-tight">Learning Platform Admin</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/courses/new" className="btn-accent !py-2.5 !px-5 no-underline">
              <Plus size={18} /> New Course
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Total Students", value: stats.totalStudents, icon: Users, color: "#00e5ff" },
            { label: "Active Courses", value: stats.totalCourses, icon: BookOpen, color: "#a855f7" },
            { label: "Total Enrollments", value: stats.totalEnrollments, icon: Award, color: "#10b981" },
            { label: "Projected Revenue", value: `$${stats.totalRevenue}`, icon: BarChart3, color: "#f59e0b" },
          ].map((s, i) => (
            <div key={i} className="glass-card p-6 h-full hover:transform-none">
              <s.icon size={20} style={{ color: s.color }} className="mb-4" />
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-xs text-[#64748b] font-medium mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Recent Courses</h2>
              <Link href="/admin/courses" className="text-xs text-[#00e5ff] hover:underline font-bold italic no-underline">
                View All Courses
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentCourses.map(course => (
                <div key={course.id} className="glass-card p-5 flex items-center justify-between hover:transform-none group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#111827] overflow-hidden flex-shrink-0">
                      <img 
                        src={course.thumbnail_url || `https://img.youtube.com/vi/${course.intro_video_id}/hqdefault.jpg`} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{course.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-[#64748b] font-medium uppercase tracking-tighter">
                          {course.enrollment_count || 0} enrolled
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          course.is_published ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#ef4444]/10 text-[#ef4444]"
                        }`}>
                          {course.is_published ? "LIVE" : "DRAFT"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/courses/edit/${course.id}`} className="p-2 bg-white/[0.04] text-[#94a3b8] hover:text-[#00e5ff] rounded-lg transition-colors">
                      <Edit size={16} />
                    </Link>
                    <Link href={`/courses/${course.slug}`} target="_blank" className="p-2 bg-white/[0.04] text-[#94a3b8] hover:text-white rounded-lg transition-colors">
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </div>
              ))}
              
              {recentCourses.length === 0 && (
                <div className="text-center py-12 glass-card border-dashed">
                  <BookOpen className="mx-auto mb-3 text-[#1e293b]" size={36} />
                  <p className="text-sm text-[#64748b]">No courses created yet.</p>
                  <Link href="/admin/courses/new" className="text-[#00e5ff] text-xs font-bold mt-2 inline-block no-underline">
                    Create your first course →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions / Sidebar */}
          <div>
            <h2 className="text-lg font-bold mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full glass-card p-4 flex items-center gap-4 text-left hover:transform-none hover:border-[#00e5ff]/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7] flex-shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold">Manage Students</div>
                  <div className="text-[10px] text-[#64748b]">View and manage all enrolled students</div>
                </div>
              </button>
              
              <button className="w-full glass-card p-4 flex items-center gap-4 text-left hover:transform-none hover:border-[#00e5ff]/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b] flex-shrink-0">
                  <Award size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold">Certificates</div>
                  <div className="text-[10px] text-[#64748b]">Issued certificates & verification</div>
                </div>
              </button>

              <div className="glass-card p-5 mt-8 bg-gradient-to-br from-[#0d1220] to-[#1e293b]/30">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={16} className="text-[#10b981]" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#cbd5e1]">System Status</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#64748b]">Supabase Connection</span>
                    <span className="text-[#10b981] font-bold">ONLINE</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#64748b]">Next.js Runtime</span>
                    <span className="text-[#10b981] font-bold">STABLE</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#64748b]">Auth Provider</span>
                    <span className="text-[#10b981] font-bold">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { 
  ArrowLeft, Save, Loader2, Plus, Trash2, 
  Play, GripVertical, CheckCircle, Globe, Layout 
} from "lucide-react";
import Link from "next/link";

export default function EditCoursePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  async function loadCourse() {
    setLoading(true);
    const { data: c } = await supabase.from("lp_courses").select("*").eq("id", courseId).single();
    const { data: l } = await supabase.from("lp_lessons").select("*").eq("course_id", courseId).order("order_index", { ascending: true });
    
    setCourse(c);
    setLessons(l || []);
    setLoading(false);
  }

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setCourse((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  async function saveCourse() {
    setSaving(true);
    const { error } = await supabase.from("lp_courses").update(course).eq("id", courseId);
    if (error) alert(error.message);
    else alert("Course saved successfully!");
    setSaving(false);
  }

  async function addLesson() {
    const newLesson = {
      course_id: courseId,
      title: "New Lesson",
      video_id: "",
      order_index: lessons.length
    };
    const { data, error } = await supabase.from("lp_lessons").insert([newLesson]).select();
    if (!error) setLessons([...lessons, data[0]]);
  }

  async function updateLesson(id: string, updates: any) {
    const { error } = await supabase.from("lp_lessons").update(updates).eq("id", id);
    if (!error) {
      setLessons(lessons.map(l => l.id === id ? { ...l, ...updates } : l));
    }
  }

  async function deleteLesson(id: string) {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("lp_lessons").delete().eq("id", id);
    if (!error) setLessons(lessons.filter(l => l.id !== id));
  }

  if (loading) return <div className="pt-24 text-center text-[#64748b]">Loading editor...</div>;

  return (
    <div className="pt-16 min-h-screen">
      <header className="py-8 px-5 border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-white/[0.04] text-[#94a3b8] hover:text-white rounded-lg transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-extrabold tracking-tight">Edit: {course?.title}</h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={saveCourse}
              className={`text-xs font-black uppercase px-4 py-2.5 rounded-lg border flex items-center gap-2 transition-all ${
                course.is_published 
                ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20 hover:bg-[#10b981]/20" 
                : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20 hover:bg-[#ef4444]/20"
              }`}
            >
              {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              {course.is_published ? "Published" : "Draft (Click to Save)"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course Metadata */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-6 hover:transform-none">
            <div className="flex items-center gap-2 mb-2">
              <Layout size={18} className="text-[#00e5ff]" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Course Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748b] uppercase">Status</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCourse({...course, is_published: true})}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${
                      course.is_published ? "bg-[#10b981] text-white border-[#10b981]" : "bg-white/[0.02] text-[#64748b] border-white/[0.05]"
                    }`}
                  >
                    Live
                  </button>
                  <button 
                    onClick={() => setCourse({...course, is_published: false})}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${
                      !course.is_published ? "bg-[#ef4444] text-white border-[#ef4444]" : "bg-white/[0.02] text-[#64748b] border-white/[0.05]"
                    }`}
                  >
                    Draft
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748b] uppercase">Pricing</label>
                <div className="flex gap-2">
                   <button 
                    onClick={() => setCourse({...course, is_free: true})}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${
                      course.is_free ? "bg-[#00e5ff] text-black border-[#00e5ff]" : "bg-white/[0.02] text-[#64748b] border-white/[0.05]"
                    }`}
                  >
                    Free
                  </button>
                  <button 
                    onClick={() => setCourse({...course, is_free: false})}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${
                      !course.is_free ? "bg-[#a855f7] text-white border-[#a855f7]" : "bg-white/[0.02] text-[#64748b] border-white/[0.05]"
                    }`}
                  >
                    Paid
                  </button>
                </div>
              </div>

              {!course.is_free && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-[#64748b] uppercase">Price ($)</label>
                  <input 
                    type="number"
                    name="price"
                    value={course.price}
                    onChange={handleInputChange}
                    className="w-full bg-[#070b14] border border-white/[0.07] rounded-lg py-2 px-3 text-sm text-white outline-none focus:border-[#00e5ff]/40"
                  />
                </div>
              )}
            </div>
            
            <button 
              onClick={saveCourse}
              disabled={saving}
              className="w-full btn-accent !py-3 flex items-center justify-center gap-2 text-xs"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Changes
            </button>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-[#0d1220] to-[#1e293b]/30 hover:transform-none">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#64748b] mb-4">Course Preview</h3>
            <div className="aspect-video rounded-xl bg-[#070b14] overflow-hidden border border-white/[0.07] mb-4">
              <img 
                src={course.thumbnail_url || `https://img.youtube.com/vi/${course.intro_video_id}/hqdefault.jpg`} 
                alt="" 
                className="w-full h-full object-cover opacity-60" 
              />
            </div>
            <div className="text-[11px] text-[#94a3b8] leading-relaxed italic">
              "This is how the course thumbnail will look to students on the catalog page."
            </div>
          </div>
        </div>

        {/* Right Column: Lessons Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Curriculum Builder</h2>
              <p className="text-xs text-[#64748b] mt-1">Add and manage video lessons for this course</p>
            </div>
            <button 
              onClick={addLesson}
              className="btn-outline !py-2 !px-4 text-xs font-bold"
            >
              <Plus size={16} /> Add Lesson
            </button>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="glass-card p-5 space-y-4 hover:transform-none border-white/[0.05]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="text-[#1e293b] cursor-grab" size={20} />
                    <span className="text-xs font-black text-[#64748b] w-6 uppercase tracking-tighter">L{index + 1}</span>
                    <input 
                      value={lesson.title}
                      onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                      placeholder="Lesson Title"
                      className="bg-transparent border-none text-sm font-bold text-white outline-none focus:text-[#00e5ff] transition-colors"
                    />
                  </div>
                  <button 
                    onClick={() => deleteLesson(lesson.id)}
                    className="p-1.5 text-[#64748b] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-md transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pl-9">
                  <div className="md:col-span-8 flex items-center gap-3 bg-[#070b14] border border-white/[0.07] rounded-xl px-4 py-2.5">
                    <Play size={14} className="text-[#64748b]" />
                    <input 
                      value={lesson.video_id}
                      onChange={(e) => updateLesson(lesson.id, { video_id: e.target.value })}
                      placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)"
                      className="w-full bg-transparent border-none text-xs text-[#cbd5e1] outline-none"
                    />
                  </div>
                  <div className="md:col-span-4 flex items-center justify-end px-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={lesson.is_free_preview}
                        onChange={(e) => updateLesson(lesson.id, { is_free_preview: e.target.checked })}
                        className="peer sr-only"
                      />
                      <div className="w-8 h-4 bg-white/[0.05] rounded-full relative transition-all peer-checked:bg-[#10b981]/20">
                        <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-[#64748b] rounded-full transition-all peer-checked:left-4 peer-checked:bg-[#10b981]"></div>
                      </div>
                      <span className="text-[10px] font-bold text-[#64748b] group-hover:text-[#cbd5e1] uppercase">Preview</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {lessons.length === 0 && (
              <div className="text-center py-24 glass-card border-dashed">
                <Play className="mx-auto mb-4 text-[#1e293b]" size={48} />
                <p className="text-sm font-medium text-[#64748b]">Ready to build your curriculum?</p>
                <button onClick={addLesson} className="text-[#00e5ff] text-xs font-bold mt-2 uppercase tracking-widest hover:underline">
                  Add your first lesson now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

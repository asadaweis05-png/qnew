"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Search, Filter, BookOpen, Star, Play, ArrowRight } from "lucide-react";

export default function CoursesPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState(searchParams.get("category") || "");
  const [level, setLevel] = useState("");

  useEffect(() => {
    supabase.from("lp_categories").select("*").order("sort_order").then(({ data }) => setCategories(data || []));
    loadCourses();
  }, []);

  useEffect(() => { loadCourses(); }, [selectedCat, level]);

  async function loadCourses() {
    setLoading(true);
    let q = supabase.from("lp_courses").select("*, lp_categories(name, icon)").eq("is_published", true).order("created_at", { ascending: false });
    if (selectedCat) {
      const cat = categories.find(c => c.slug === selectedCat);
      if (cat) q = q.eq("category_id", cat.id);
    }
    if (level) q = q.eq("level", level);
    const { data } = await q;
    setCourses(data || []);
    setLoading(false);
  }

  const filtered = courses.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.description||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <section className="py-14 px-5 border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto">
          <div className="badge mb-4">📚 Course Catalog</div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Dhammaan Koorsooyinka</h1>
          <p className="text-[#64748b] text-sm">Discover courses in Somali & English — all free</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 py-10">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
              className="w-full bg-[#0d1220] border border-white/[0.07] text-white rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-[#00e5ff]/40"/>
          </div>
          <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)}
            className="bg-[#0d1220] border border-white/[0.07] text-[#cbd5e1] rounded-xl py-3 px-4 text-sm outline-none">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>)}
          </select>
          <select value={level} onChange={e => setLevel(e.target.value)}
            className="bg-[#0d1220] border border-white/[0.07] text-[#cbd5e1] rounded-xl py-3 px-4 text-sm outline-none">
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Results count */}
        <div className="text-xs text-[#64748b] mb-6 font-medium">
          Showing <span className="text-[#00e5ff] font-bold">{filtered.length}</span> courses
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-[#64748b]">
            <div className="flex gap-1 justify-center mb-3">
              <span className="w-2 h-2 bg-[#00e5ff] rounded-full animate-pulse"/>
              <span className="w-2 h-2 bg-[#00e5ff] rounded-full animate-pulse" style={{animationDelay:"0.15s"}}/>
              <span className="w-2 h-2 bg-[#00e5ff] rounded-full animate-pulse" style={{animationDelay:"0.3s"}}/>
            </div>
            Loading courses...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#64748b]">
            <BookOpen size={40} className="mx-auto mb-4 text-[#1e293b]"/>
            <p className="font-medium">No courses found</p>
            <p className="text-xs mt-1">Try changing your search or filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, i) => (
              <Link key={course.id} href={`/courses/${course.slug}`}
                className="glass-card overflow-hidden no-underline group animate-up" style={{animationDelay:`${i*50}ms`}}>
                <div className="relative aspect-video bg-[#111827] overflow-hidden">
                  <img src={course.thumbnail_url || `https://img.youtube.com/vi/${course.intro_video_id}/hqdefault.jpg`}
                    alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/80 via-transparent"/>
                  <div className="absolute top-3 left-3 badge">{(course.lp_categories as any)?.icon} {(course.lp_categories as any)?.name}</div>
                  {course.is_free && <div className="absolute top-3 right-3 bg-[#10b981] text-white text-[10px] font-bold px-2 py-0.5 rounded">FREE</div>}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-[#00e5ff] flex items-center justify-center shadow-lg shadow-[#00e5ff]/30">
                      <Play size={20} fill="#000" className="text-black ml-0.5"/>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-[0.95rem] font-bold leading-snug mb-2 text-white line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-[#64748b] line-clamp-2 mb-4">{course.short_desc || course.description}</p>
                  <div className="flex items-center justify-between text-xs text-[#64748b]">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-[#f59e0b]" fill="#f59e0b"/>
                      <span className="font-semibold text-[#cbd5e1]">{course.rating || "New"}</span>
                    </div>
                    <span>{course.total_lessons} lessons · {course.duration_hours}h</span>
                    <span className="capitalize">{course.level}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

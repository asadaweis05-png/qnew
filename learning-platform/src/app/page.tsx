import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { BookOpen, Users, Award, ArrowRight, Play, Star, Globe, Smartphone } from "lucide-react";

export default async function HomePage() {
  const supabase = await createServerSupabase();
  const { data: courses } = await supabase.from("lp_courses").select("*, lp_categories(name, icon)").eq("is_published", true).order("created_at", { ascending: false }).limit(6);
  const { data: categories } = await supabase.from("lp_categories").select("*").order("sort_order");
  const { count: totalCourses } = await supabase.from("lp_courses").select("*", { count: "exact", head: true }).eq("is_published", true);
  const { count: totalStudents } = await supabase.from("lp_enrollments").select("*", { count: "exact", head: true });

  return (
    <div className="pt-16">
      {/* HERO */}
      <section className="relative overflow-hidden py-24 md:py-36 px-5">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00e5ff]/[0.04] via-transparent to-transparent pointer-events-none"/>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="badge mb-6 animate-up">✦ BARASHADA TOOSKA AH</div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 animate-up" style={{animationDelay:"0.1s"}}>
            Ku Baro <span className="text-[#00e5ff]">Xirfadaha</span><br/>
            <span className="italic font-serif">Mustaqbalka</span>
          </h1>
          <p className="text-[#94a3b8] text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed animate-up" style={{animationDelay:"0.2s"}}>
            Koorsoyin lacag la&apos;aan ah oo Somali iyo English ah — AI, Technology, Business, iyo wax badan. 
            Hel shahaadooyin la xaqiijiyay oo aduunka oo dhan lagu aqoonsan yahay.
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-up" style={{animationDelay:"0.3s"}}>
            <Link href="/courses" className="btn-accent text-base !py-3.5 !px-8 no-underline">
              Browse Courses <ArrowRight size={18}/>
            </Link>
            <Link href="/auth/signup" className="btn-outline text-base !py-3.5 !px-8 no-underline">
              Bilow Maanta — Free
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-8 border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: BookOpen, val: `${totalCourses ?? 0}+`, label: "Courses" },
            { icon: Users, val: `${totalStudents ?? 0}+`, label: "Students" },
            { icon: Award, val: "Free", label: "Certificates" },
            { icon: Globe, val: "SO/EN", label: "Languages" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <s.icon size={22} className="text-[#00e5ff]"/>
              <div className="text-2xl font-extrabold">{s.val}</div>
              <div className="text-xs text-[#64748b] font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      {categories && categories.length > 0 && (
        <section className="py-20 px-5">
          <div className="max-w-6xl mx-auto">
            <h2 className="section-title text-center mb-4">Browse by Category</h2>
            <p className="text-[#64748b] text-center mb-12 text-sm">Dooro qaybta aad rabto inaad barato</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((cat: any) => (
                <Link key={cat.id} href={`/courses?category=${cat.slug}`}
                  className="glass-card p-5 text-center no-underline group cursor-pointer">
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <div className="text-sm font-semibold text-[#cbd5e1] group-hover:text-white transition-colors">{cat.name}</div>
                  {cat.name_so && <div className="text-[10px] text-[#64748b] mt-1">{cat.name_so}</div>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED COURSES */}
      <section className="py-20 px-5 bg-gradient-to-b from-transparent via-[#00e5ff]/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-title">Featured Courses</h2>
              <p className="text-[#64748b] text-sm mt-2">Koorsooyinka ugu wanaagsan ee hadda</p>
            </div>
            <Link href="/courses" className="btn-outline text-sm !py-2 !px-5 no-underline hidden md:inline-flex">
              View All <ArrowRight size={15}/>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses && courses.length > 0 ? courses.map((course: any) => (
              <Link key={course.id} href={`/courses/${course.slug}`} className="glass-card overflow-hidden no-underline group">
                <div className="relative aspect-video bg-[#111827] overflow-hidden">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                  ) : course.intro_video_id ? (
                    <img src={`https://img.youtube.com/vi/${course.intro_video_id}/hqdefault.jpg`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0d1220] to-[#1e293b]">
                      <BookOpen size={40} className="text-[#1e293b]"/>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/80 via-transparent"/>
                  <div className="absolute top-3 left-3 badge">{(course.lp_categories as any)?.icon} {(course.lp_categories as any)?.name || "Course"}</div>
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
                    <span>{course.total_lessons} lessons</span>
                    <span className="capitalize">{course.level}</span>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-full text-center py-20 text-[#64748b]">
                <BookOpen size={40} className="mx-auto mb-4 text-[#1e293b]"/>
                <p className="font-medium">Courses coming soon...</p>
                <p className="text-xs mt-1">We&apos;re building amazing content for you</p>
              </div>
            )}
          </div>
          <div className="md:hidden mt-8 text-center">
            <Link href="/courses" className="btn-outline text-sm !py-2.5 !px-6 no-underline">View All Courses</Link>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="section-title mb-12">Maxay noogu fiican tahay?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🆓", title: "100% Lacag La'aan", desc: "Dhammaan koorsooyinka waa bilaash. Waxbarashadaada kuma kharash galinayso." },
              { icon: "🌍", title: "Somali & English", desc: "Waxbarashada luqaddaada — Somali ama English, adiga ayaa doorta." },
              { icon: "📱", title: "Mobile-First", desc: "Ku baro telefoonkaaga meel kasta oo aad joogto — xitaa internet yar." },
            ].map((f, i) => (
              <div key={i} className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5">
        <div className="max-w-3xl mx-auto glass-card p-10 md:p-14 text-center bg-gradient-to-br from-[#0d1220] to-[#0d1220] border-[#00e5ff]/20">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">Bilow Waxbarashadaada Maanta</h2>
          <p className="text-[#94a3b8] text-sm mb-8 max-w-lg mx-auto">
            Ku biir kumanaan arday ah oo horumar wanaagsan ka sameeyay xirfadahooda. Bilaash — weligaa.
          </p>
          <Link href="/auth/signup" className="btn-accent text-base !py-3.5 !px-10 no-underline">
            Create Free Account <ArrowRight size={18}/>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.05] py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-[#64748b]">© 2026 THEQNEW Learning. Built by <strong className="text-[#cbd5e1]">Hanasho AI</strong></div>
          <div className="flex gap-6 text-sm text-[#64748b]">
            <Link href="https://theqnew.com" className="hover:text-white transition-colors no-underline">Main Site</Link>
            <Link href="https://t.me/HANASHO_COMPANY" className="hover:text-white transition-colors no-underline">Telegram</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

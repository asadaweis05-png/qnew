"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ArrowLeft, Save, Loader2, Play } from "lucide-react";
import Link from "next/link";

export default function NewCoursePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    short_desc: "",
    intro_video_id: "",
    thumbnail_url: "",
    level: "beginner",
    language: "so",
    is_free: true,
    price: 0
  });

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (name === "title") {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
      }));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.from("lp_courses").insert([
      {
        ...formData,
        is_published: false // Start as draft
      }
    ]).select();

    if (error) {
      alert("Error creating course: " + error.message);
    } else {
      router.push(`/admin/courses/edit/${data[0].id}`);
    }
    setLoading(false);
  }

  return (
    <div className="pt-16 min-h-screen">
      <header className="py-8 px-5 border-b border-white/[0.05]">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-white/[0.04] text-[#94a3b8] hover:text-white rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight">Create New Course</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="glass-card p-6 md:p-8 space-y-6 hover:transform-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Course Title</label>
                <input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. Mastering AI Ethics"
                  className="w-full bg-[#070b14] border border-white/[0.07] rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#00e5ff]/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">URL Slug</label>
                <input 
                  name="slug" 
                  value={formData.slug} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="mastering-ai-ethics"
                  className="w-full bg-[#070b14] border border-white/[0.07] rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#00e5ff]/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Short Summary</label>
              <input 
                name="short_desc" 
                value={formData.short_desc} 
                onChange={handleInputChange} 
                required 
                placeholder="A one-sentence summary for the course card"
                className="w-full bg-[#070b14] border border-white/[0.07] rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#00e5ff]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Full Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                required 
                rows={4}
                placeholder="Detailed explanation of the course content..."
                className="w-full bg-[#070b14] border border-white/[0.07] rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#00e5ff]/40 resize-none"
              />
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 space-y-6 hover:transform-none">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#00e5ff]">Visuals & Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Intro Video (YouTube ID)</label>
                <div className="relative">
                  <Play size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]"/>
                  <input 
                    name="intro_video_id" 
                    value={formData.intro_video_id} 
                    onChange={handleInputChange} 
                    placeholder="dQw4w9WgXcQ"
                    className="w-full bg-[#070b14] border border-white/[0.07] rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#00e5ff]/40"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Thumbnail URL (Optional)</label>
                <input 
                  name="thumbnail_url" 
                  value={formData.thumbnail_url} 
                  onChange={handleInputChange} 
                  placeholder="https://example.com/thumb.jpg"
                  className="w-full bg-[#070b14] border border-white/[0.07] rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#00e5ff]/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Skill Level</label>
                <select 
                  name="level" 
                  value={formData.level} 
                  onChange={handleInputChange} 
                  className="w-full bg-[#070b14] border border-white/[0.07] rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#00e5ff]/40"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Language</label>
                <select 
                  name="language" 
                  value={formData.language} 
                  onChange={handleInputChange} 
                  className="w-full bg-[#070b14] border border-white/[0.07] rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#00e5ff]/40"
                >
                  <option value="so">Somali</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="flex items-end pb-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      name="is_free" 
                      checked={formData.is_free} 
                      onChange={handleInputChange}
                      className="peer sr-only" 
                    />
                    <div className="w-10 h-5 bg-white/[0.07] rounded-full border border-white/[0.07] peer-checked:bg-[#00e5ff]/20 peer-checked:border-[#00e5ff]/40 transition-all"></div>
                    <div className="absolute top-1 left-1 w-3 h-3 bg-[#64748b] rounded-full transition-all peer-checked:left-6 peer-checked:bg-[#00e5ff]"></div>
                  </div>
                  <span className="text-xs font-bold text-[#cbd5e1] group-hover:text-white">Free Course</span>
                </label>
              </div>
            </div>

            {!formData.is_free && (
              <div className="space-y-2 pt-4 border-t border-white/[0.05]">
                <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Course Price ($)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleInputChange} 
                  className="w-full bg-[#070b14] border border-white/[0.07] rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#00e5ff]/40"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-accent !py-4 !px-12 flex items-center gap-2 text-base shadow-xl shadow-[#00e5ff]/20"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Save & Continue to Lessons
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

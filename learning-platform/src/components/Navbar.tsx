"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Menu, X, BookOpen, GraduationCap, LayoutDashboard, LogOut, LogIn } from "lucide-react";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); setUser(null); };

  const links = [
    { href: "/", label: "Home", icon: BookOpen },
    { href: "/courses", label: "Courses", icon: GraduationCap },
    ...(user ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b14]/85 backdrop-blur-xl border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-extrabold text-lg tracking-tight no-underline">
          THE<span className="text-[#00e5ff]">QNEW</span>
          <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase ml-1 hidden sm:inline">Learn</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-[#94a3b8] text-sm font-medium hover:text-white transition-colors no-underline">
              {l.label}
            </Link>
          ))}
          {user ? (
            <button onClick={logout} className="text-[#64748b] text-sm font-medium hover:text-[#ef4444] transition-colors flex items-center gap-1.5">
              <LogOut size={15}/> Logout
            </button>
          ) : (
            <Link href="/auth/login" className="btn-accent text-sm !py-2 !px-5 no-underline">
              <LogIn size={15}/> Login
            </Link>
          )}
          <Link href="https://theqnew.com" target="_blank" className="text-[#64748b] text-xs font-medium hover:text-white transition-colors no-underline">
            ← Main Site
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2">
          {open ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0d1220] border-t border-white/[0.07] px-5 py-4 flex flex-col gap-3">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} 
              className="text-[#cbd5e1] text-sm font-medium py-2 no-underline flex items-center gap-2">
              <l.icon size={16} className="text-[#00e5ff]"/> {l.label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { logout(); setOpen(false); }} className="text-[#ef4444] text-sm font-medium py-2 text-left flex items-center gap-2">
              <LogOut size={16}/> Logout
            </button>
          ) : (
            <Link href="/auth/login" onClick={() => setOpen(false)} className="btn-accent text-sm !py-2.5 text-center justify-center no-underline mt-1">
              Login / Sign Up
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
  }

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 md:p-10 hover:transform-none">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Welcome Back</h1>
            <p className="text-[#64748b] text-sm mt-2">Soo gal akoonkaaga — Login to continue learning</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-[#94a3b8] mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]"/>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                  className="w-full bg-[#070b14] border border-white/[0.07] rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#00e5ff]/40"/>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#94a3b8] mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]"/>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  className="w-full bg-[#070b14] border border-white/[0.07] rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#00e5ff]/40"/>
              </div>
            </div>
            {error && <div className="text-xs text-[#ef4444] bg-[#ef4444]/10 p-3 rounded-lg">{error}</div>}
            <button type="submit" disabled={loading} className="btn-accent w-full justify-center !py-3.5 disabled:opacity-50">
              {loading ? "Logging in..." : <>Login <ArrowRight size={16}/></>}
            </button>
          </form>
          <p className="text-center text-xs text-[#64748b] mt-6">
            Don&apos;t have an account? <Link href="/auth/signup" className="text-[#00e5ff] font-semibold no-underline">Sign Up Free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

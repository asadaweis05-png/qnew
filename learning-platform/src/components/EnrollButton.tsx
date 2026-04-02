"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ArrowRight, CheckCircle } from "lucide-react";

export function EnrollButton({ 
  courseId, 
  courseSlug, 
  isFree = true, 
  price = 0, 
  courseTitle = "" 
}: { 
  courseId: string; 
  courseSlug: string; 
  isFree?: boolean;
  price?: number;
  courseTitle?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleEnroll() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/auth/login"); return; }

    if (isFree) {
      const { error } = await supabase.from("lp_enrollments").upsert({
        user_id: session.user.id, course_id: courseId
      }, { onConflict: "user_id,course_id" });

      if (!error) {
        setEnrolled(true);
        setTimeout(() => router.push(`/courses/${courseSlug}/learn`), 600);
      }
    } else {
      // Handle Payment Redirect
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, price, courseTitle })
        });
        const { url } = await response.json();
        if (url) window.location.href = url;
      } catch (err) {
        alert("Payment error. Please try again.");
      }
    }
    setLoading(false);
  }

  if (enrolled) return (
    <div className="flex items-center gap-2 text-[#10b981] font-bold text-sm">
      <CheckCircle size={18}/> Enrolled! Redirecting...
    </div>
  );

  return (
    <button onClick={handleEnroll} disabled={loading} className="btn-accent text-base !py-3.5 !px-8 disabled:opacity-50">
      {loading ? "Processing..." : isFree ? <>Enroll Now — Free <ArrowRight size={18}/></> : <>Get Verified Certificate — ${price} <ArrowRight size={18}/></>}
    </button>
  );
}

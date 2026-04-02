import { renderToStream } from "@react-pdf/renderer";
import { CertificatePDF } from "@/components/CertificatePDF";
import { createServerSupabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const courseId = searchParams.get("courseId");

    if (!userId || !courseId) return new Response("Missing params", { status: 400 });

    const supabase = await createServerSupabase();
    
    // Verify enrollment & progress
    const { data: enrollment } = await supabase.from("lp_enrollments")
      .select("*, lp_courses(title)")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (!enrollment || enrollment.progress_pct < 100) {
      return new Response("Course not completed", { status: 403 });
    }

    // Get or Create Certificate Record
    let { data: cert } = await supabase.from("lp_certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (!cert) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      const userName = userData.user?.user_metadata?.full_name || userData.user?.email?.split("@")[0] || "Student";
      
      const { data: newCert } = await supabase.from("lp_certificates").insert({
        user_id: userId,
        course_id: courseId,
        user_name: userName,
        course_title: (enrollment.lp_courses as any).title,
        issued_at: new Date().toISOString()
      }).select().single();
      cert = newCert;
    }

    const stream = await renderToStream(
      <CertificatePDF 
        userName={cert.user_name}
        courseTitle={cert.course_title}
        date={new Date(cert.issued_at).toLocaleDateString()}
        verifyId={cert.verification_id}
      />
    );

    return new Response(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${cert.verification_id}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(err.message, { status: 500 });
  }
}

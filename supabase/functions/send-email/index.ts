import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  subject: string;
  htmlContent: string;
  toAll?: boolean;
  toEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, htmlContent, toAll, toEmail }: EmailRequest = await req.json();

    if (!subject || !htmlContent) {
      throw new Error("Subject and htmlContent are required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let emails: string[] = [];

    if (toEmail) {
      emails = [toEmail];
    } else if (toAll) {
      // Get all user emails from profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("email")
        .not("email", "is", null);

      if (error) throw error;
      emails = profiles?.map((p) => p.email).filter(Boolean) || [];
    }

    if (emails.length === 0) {
      return new Response(JSON.stringify({ error: "No recipients found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Sending email to ${emails.length} recipients`);

    const results = { success: 0, failed: 0 };

    // Send emails in batches of 10 to avoid rate limits
    for (let i = 0; i < emails.length; i += 10) {
      const batch = emails.slice(i, i + 10);
      
      const promises = batch.map(async (email) => {
        try {
          await resend.emails.send({
            from: "SomDiet <noreply@somdiet.com>",
            to: [email],
            subject: subject,
            html: htmlContent,
          });
          results.success++;
        } catch (err) {
          console.error(`Failed to send to ${email}:`, err);
          results.failed++;
        }
      });

      await Promise.all(promises);
      
      // Small delay between batches
      if (i + 10 < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`Email results: ${results.success} sent, ${results.failed} failed`);

    return new Response(JSON.stringify({ 
      message: "Emails sent",
      results,
      totalRecipients: emails.length
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);








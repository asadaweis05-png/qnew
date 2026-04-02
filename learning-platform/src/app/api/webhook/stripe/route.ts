import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerSupabase } from "@/lib/supabase-server";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = await createServerSupabase();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, courseId, type } = session.metadata;

    if (type === "certificate") {
      // 1. Log payment
      await supabase.from("lp_payments").insert({
        user_id: userId,
        course_id: courseId,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent as string,
        amount: session.amount_total / 100,
        status: "completed",
        payment_type: "certificate"
      });

      // 2. Mark certificate as verified
      await supabase.from("lp_certificates")
        .update({ is_verified: true })
        .eq("user_id", userId)
        .eq("course_id", courseId);
    }
  }

  return NextResponse.json({ received: true });
}

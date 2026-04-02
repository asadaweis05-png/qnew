import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { courseId, price, courseTitle } = await req.json();
    const supabase = await createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Verified Certificate: ${courseTitle}`,
              description: `Professional verification for ${courseTitle} completion.`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/courses?payment=cancelled`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        courseId: courseId,
        type: "certificate",
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err: any) {
    console.error(err);
    return new Response(err.message, { status: 500 });
  }
}

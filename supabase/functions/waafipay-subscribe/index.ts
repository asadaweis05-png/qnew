import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, userId } = await req.json();

    // Validate user ID
    if (!userId) {
      console.error("User ID is required");
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone number
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      console.error("Invalid phone number provided");
      return new Response(
        JSON.stringify({ success: false, error: "Phone number is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number for WaafiPay
    const formattedPhone = phoneNumber.startsWith("252")
      ? phoneNumber
      : phoneNumber.startsWith("+252")
        ? phoneNumber.substring(1)
        : `252${phoneNumber.replace(/^0+/, "")}`;

    // Validate formatted phone number (should be 252 + 9 digits)
    if (!/^252\d{9}$/.test(formattedPhone)) {
      console.error("Invalid phone format:", formattedPhone);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid phone number format. Use format: 252XXXXXXXXX" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const merchantUid = Deno.env.get('WAAFIPAY_MERCHANT_UID');
    const apiUserId = Deno.env.get('WAAFIPAY_API_USER_ID');
    const apiKey = Deno.env.get('WAAFIPAY_API_KEY');

    if (!merchantUid || !apiUserId || !apiKey) {
      console.error("WaafiPay credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const timestamp = Date.now();
    const paymentData = {
      schemaVersion: "1.0",
      requestId: timestamp.toString(),
      timestamp: new Date().toISOString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: merchantUid,
        apiUserId: apiUserId,
        apiKey: apiKey,
        paymentMethod: "MWALLET_ACCOUNT",
        payerInfo: {
          accountNo: formattedPhone,
        },
        transactionInfo: {
          referenceId: `BARASHADA-${timestamp}`,
          invoiceId: `INV-${timestamp}`,
          amount: "5.00",
          currency: "USD",
          description: "Barashada Premium AI Tutor - Monthly Subscription",
        },
      },
    };

    console.log("Initiating WaafiPay payment for:", formattedPhone);

    const response = await fetch("https://api.waafipay.net/asm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    console.log("WaafiPay response:", JSON.stringify(result));

    // Success check: responseCode === "2001"
    if (result.responseCode === "2001") {
      const transactionId = result.params?.transactionId || result.responseId;
      console.log("Payment successful, transaction ID:", transactionId);

      // Save subscription to database
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      // Calculate expiry date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error: dbError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          phone_number: formattedPhone,
          transaction_id: transactionId,
          status: 'active',
          expires_at: expiresAt.toISOString(),
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (dbError) {
        console.error("Failed to save subscription:", dbError);
        // Still return success as payment went through
      }

      console.log("Subscription saved for user:", userId);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          transactionId: transactionId,
          expiresAt: expiresAt.toISOString(),
          message: "Payment successful! Your premium subscription is now active."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error("Payment failed:", result.responseMsg || result.responseCode);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.responseMsg || "Payment was not completed. Please try again." 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("WaafiPay error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Payment service error. Please try again." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});






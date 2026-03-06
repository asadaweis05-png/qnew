import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define input validation schema
const paymentRequestSchema = z.object({
  phoneNumber: z.string().trim().min(9, "Phone number must be at least 9 digits").max(15, "Phone number too long"),
  amount: z.number().positive("Amount must be positive").max(10000, "Amount exceeds maximum"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  description: z.string().trim().max(200, "Description too long").optional(),
  planType: z.enum(["monthly", "quarterly", "annual"]).optional(),
  userId: z.string().uuid().optional(),
});

// Define the success response type
interface EVCPaymentResponse {
  status: string;
  message: string;
  transactionId?: string;
  subscriptionId?: string;
}

// Calculate subscription end date based on plan type
function calculateEndDate(planType: string): Date {
  const now = new Date();
  switch (planType) {
    case "monthly":
      return new Date(now.setMonth(now.getMonth() + 1));
    case "quarterly":
      return new Date(now.setMonth(now.getMonth() + 3));
    case "annual":
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      return new Date(now.setMonth(now.getMonth() + 1));
  }
}

// Create Supabase client with user authentication context
function createSupabaseClient(authToken?: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration');
  }

  const options: any = {
    auth: {
      persistSession: false,
    },
  };

  // If auth token provided, add it to headers
  if (authToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
  }

  return createClient(supabaseUrl, supabaseAnonKey, options);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get credentials from environment variables (secure)
    const merchantUid = Deno.env.get('WAAFI_MERCHANT_UID');
    const apiUserId = Deno.env.get('WAAFI_API_USER_ID');
    const apiKey = Deno.env.get('WAAFI_API_KEY');

    if (!merchantUid || !apiUserId || !apiKey) {
      console.error('Missing payment service credentials');
      return new Response(
        JSON.stringify({ error: 'Payment service configuration error' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the request body
    const requestData = await req.json();

    // Validate inputs using zod schema
    const validationResult = paymentRequestSchema.safeParse(requestData);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => e.message).join(", ");
      return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { phoneNumber, amount, email, description, planType, userId } = validationResult.data;

    // If userId is provided, require and verify authentication
    let verifiedUserId: string | null = null;
    let supabaseClient;

    const authHeader = req.headers.get('authorization');

    if (userId) {
      // User payment - require authentication
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authentication required for user payments' }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const jwt = authHeader.replace('Bearer ', '');
      supabaseClient = createSupabaseClient(jwt);

      // Verify the user
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth verification failed:', authError);
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Critical: Verify the userId matches the authenticated user
      if (user.id !== userId) {
        console.error('User ID mismatch - potential attack attempt');
        return new Response(
          JSON.stringify({ error: 'Unauthorized: User ID does not match authenticated user' }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      verifiedUserId = user.id;
    } else {
      // Anonymous payment (newsletter) - use unauthenticated client
      supabaseClient = createSupabaseClient(authHeader?.replace('Bearer ', ''));
    }

    // Format the phone number (WaafiPay expects format like 252682150101)
    const formattedPhone = phoneNumber.startsWith("252")
      ? phoneNumber
      : phoneNumber.startsWith("+252")
        ? phoneNumber.substring(1)
        : `252${phoneNumber.replace(/^0+/, "")}`;
    
    // Generate unique IDs for this transaction
    const referenceId = `RFX${Date.now()}`;
    const invoiceId = `INV${Date.now()}`;

    // Build the WaafiPay API request structure
    const paymentData = {
      schemaVersion: "1.0",
      requestId: Date.now().toString(),
      timestamp: new Date().toISOString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid,
        apiUserId,
        apiKey,
        paymentMethod: "MWALLET_ACCOUNT",
        payerInfo: {
          accountNo: formattedPhone,
        },
        transactionInfo: {
          referenceId: referenceId,
          invoiceId: invoiceId,
          amount: amount.toString(),
          currency: "USD",
          description: description || `NutriTrack ${planType || 'subscription'} payment`,
        },
      },
    };

    const waafipayApiUrl = "https://api.waafipay.net/asm";

    // Log only non-sensitive info
    console.log("Initiating payment:", { referenceId, amount, planType, authenticated: !!verifiedUserId });
    
    const paymentResponse = await fetch(waafipayApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.text();
      console.error("WaafiPay API error:", errorData);
      return new Response(JSON.stringify({ error: "Payment processing failed", details: "Payment service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the WaafiPay API response
    const paymentResult = await paymentResponse.json();
    console.log("WaafiPay response code:", paymentResult.responseCode);

    // Check if WaafiPay returned an error
    if (paymentResult.responseCode !== "2001") {
      return new Response(JSON.stringify({ 
        error: paymentResult.responseMsg || "Payment failed",
        details: "Please check your account balance and try again"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transactionId = paymentResult.params?.transactionId || paymentResult.responseId || null;

    // Store the payment record (RLS will enforce user_id = auth.uid() for authenticated users)
    const { data: paymentRecord, error: paymentError } = await supabaseClient
      .from("evc_payments")
      .insert({
        phone_number: formattedPhone,
        amount: amount,
        email: email,
        transaction_id: transactionId,
        status: "success",
        user_id: verifiedUserId, // Only set if authenticated
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error saving payment record:", paymentError);
    }

    let subscriptionId: string | undefined;

    // Create subscription record if user is authenticated and plan type is provided
    if (verifiedUserId && planType) {
      const endDate = calculateEndDate(planType);
      
      const { data: subscription, error: subscriptionError } = await supabaseClient
        .from("subscriptions")
        .insert({
          user_id: verifiedUserId,
          plan_type: planType,
          status: "active",
          amount_paid: amount,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          transaction_id: transactionId,
          payment_id: paymentRecord?.id || null,
        })
        .select()
        .single();

      if (subscriptionError) {
        console.error("Error creating subscription:", subscriptionError);
      } else {
        subscriptionId = subscription?.id;
        console.log("Subscription created:", subscriptionId);
      }
    }

    // Return the success response
    const responseData: EVCPaymentResponse = {
      status: "success",
      message: paymentResult.responseMsg || "Payment successful!",
      transactionId: transactionId || undefined,
      subscriptionId,
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in hormuud-evc-payment function:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});






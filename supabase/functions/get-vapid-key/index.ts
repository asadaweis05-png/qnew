import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');

  if (!vapidPublicKey) {
    return new Response(JSON.stringify({ error: 'VAPID public key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Clean up the key - remove any surrounding quotes
  vapidPublicKey = vapidPublicKey.replace(/^["']|["']$/g, '').trim();

  console.log('Returning VAPID public key:', vapidPublicKey);

  return new Response(JSON.stringify({ publicKey: vapidPublicKey }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});






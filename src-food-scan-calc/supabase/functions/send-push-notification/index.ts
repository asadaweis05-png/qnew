import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Web Push library for Deno
async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<Response> {
  const encoder = new TextEncoder();
  
  // Import the VAPID keys
  const privateKeyData = Uint8Array.from(atob(vapidPrivateKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyData,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  // Create JWT for VAPID
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    aud: new URL(subscription.endpoint).origin,
    exp: now + 12 * 60 * 60,
    sub: 'mailto:admin@somdiet.com'
  };

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const claimsB64 = btoa(JSON.stringify(claims)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${headerB64}.${claimsB64}`;

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${unsignedToken}.${signatureB64}`;

  // Send the push notification
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
    },
    body: encoder.encode(payload),
  });

  return response;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, url } = await req.json();
    
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) throw error;

    console.log(`Sending notifications to ${subscriptions?.length || 0} subscribers`);

    const payload = JSON.stringify({ title, body, url });
    const results = { success: 0, failed: 0, removed: 0 };

    for (const sub of subscriptions || []) {
      try {
        const response = await sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          },
          payload,
          vapidPublicKey,
          vapidPrivateKey
        );

        if (response.ok) {
          results.success++;
        } else if (response.status === 410 || response.status === 404) {
          // Subscription expired, remove it
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          results.removed++;
        } else {
          console.error(`Failed to send to ${sub.endpoint}: ${response.status}`);
          results.failed++;
        }
      } catch (err) {
        console.error(`Error sending notification:`, err);
        results.failed++;
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Notifications sent',
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

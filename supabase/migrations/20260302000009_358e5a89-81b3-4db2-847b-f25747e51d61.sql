-- Create table for storing push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for anonymous visitors)
CREATE POLICY "Anyone can subscribe to notifications"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (true);

-- Allow service to read subscriptions (for sending notifications)
CREATE POLICY "Service can read subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (true);

-- Allow delete by endpoint (for unsubscribing)
CREATE POLICY "Anyone can unsubscribe"
ON public.push_subscriptions
FOR DELETE
USING (true);
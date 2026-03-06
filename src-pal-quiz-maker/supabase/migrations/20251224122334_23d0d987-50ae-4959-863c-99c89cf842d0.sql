-- Create table for push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert subscriptions (for anonymous users)
CREATE POLICY "Anyone can subscribe to notifications"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (true);

-- Allow anyone to delete their own subscription by endpoint
CREATE POLICY "Anyone can unsubscribe"
ON public.push_subscriptions
FOR DELETE
USING (true);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_subscriptions;
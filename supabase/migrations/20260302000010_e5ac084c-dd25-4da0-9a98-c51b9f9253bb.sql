-- Add columns to subscriptions table for premium status
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);

-- Users can view their own subscriptions
DO $$ BEGIN
    CREATE POLICY "Users can view their own subscriptions" 
    ON public.subscriptions 
    FOR SELECT 
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can insert their own subscriptions
DO $$ BEGIN
    CREATE POLICY "Users can insert their own subscriptions" 
    ON public.subscriptions 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
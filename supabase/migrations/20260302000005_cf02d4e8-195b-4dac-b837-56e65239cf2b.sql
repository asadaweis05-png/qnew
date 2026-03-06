-- Alter existing subscriptions table
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_type TEXT,
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC,
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.evc_payments(id);

-- Create RLS policies for the new columns (using DO block to avoid duplicate errors)
DO $$ BEGIN
    CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own subscriptions"
    ON public.subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON public.subscriptions(end_date);
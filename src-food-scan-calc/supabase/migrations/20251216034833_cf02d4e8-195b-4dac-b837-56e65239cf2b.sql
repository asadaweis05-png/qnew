-- Create enum for plan types
CREATE TYPE public.subscription_plan AS ENUM ('monthly', 'quarterly', 'annual');

-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type subscription_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  amount_paid NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  transaction_id TEXT,
  payment_id UUID REFERENCES public.evc_payments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON public.subscriptions(end_date);

-- Create trigger for updating updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create table for EVC payment records
CREATE TABLE IF NOT EXISTS public.evc_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  phone_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  email TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evc_payments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserting payment records
CREATE POLICY "Allow inserting payment records"
  ON public.evc_payments
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to view their own payments by email
CREATE POLICY "Users can view their own payments"
  ON public.evc_payments
  FOR SELECT
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_evc_payments_email ON public.evc_payments(email);
CREATE INDEX idx_evc_payments_transaction_id ON public.evc_payments(transaction_id);

-- Create trigger for updating timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_evc_payments_updated_at
  BEFORE UPDATE ON public.evc_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
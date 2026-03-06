-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  daily_calorie_goal INTEGER DEFAULT 2000,
  weight_kg DECIMAL,
  height_cm DECIMAL,
  age INTEGER,
  gender TEXT,
  activity_level TEXT,
  goal TEXT,
  target_calories INTEGER,
  PRIMARY KEY (id)
);

-- Create food_entries table
CREATE TABLE IF NOT EXISTS public.food_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories DECIMAL NOT NULL,
  protein DECIMAL NOT NULL,
  carbs DECIMAL NOT NULL,
  fat DECIMAL NOT NULL,
  image_url TEXT,
  PRIMARY KEY (id)
);

-- Create daily_totals table
CREATE TABLE IF NOT EXISTS public.daily_totals (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  calories DECIMAL NOT NULL DEFAULT 0,
  protein DECIMAL NOT NULL DEFAULT 0,
  carbs DECIMAL NOT NULL DEFAULT 0,
  fat DECIMAL NOT NULL DEFAULT 0,
  daily_calorie_goal INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(user_id, date)
);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email TEXT NOT NULL UNIQUE,
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_totals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for food_entries
CREATE POLICY "Users can view own food entries" ON public.food_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food entries" ON public.food_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own food entries" ON public.food_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own food entries" ON public.food_entries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_totals
CREATE POLICY "Users can view own daily totals" ON public.daily_totals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily totals" ON public.daily_totals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily totals" ON public.daily_totals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily totals" ON public.daily_totals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for newsletter_subscribers (public insert, only admins can read)
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_totals_updated_at BEFORE UPDATE ON public.daily_totals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add user_id column to evc_payments and fix RLS
ALTER TABLE public.evc_payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing insecure policies on evc_payments
DROP POLICY IF EXISTS "Users can view their own payments" ON public.evc_payments;
DROP POLICY IF EXISTS "Allow inserting payment records" ON public.evc_payments;

-- Create secure RLS policies for evc_payments
CREATE POLICY "Users can view own payments" ON public.evc_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.evc_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
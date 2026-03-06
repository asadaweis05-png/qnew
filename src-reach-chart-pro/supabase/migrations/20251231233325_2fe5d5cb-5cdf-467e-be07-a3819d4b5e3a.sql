-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by authenticated users
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  timeframe TEXT NOT NULL CHECK (timeframe IN ('today', 'week', 'month', 'year')),
  is_habit BOOLEAN NOT NULL DEFAULT false,
  completed BOOLEAN NOT NULL DEFAULT false,
  streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Users can view their own goals
CREATE POLICY "Users can view their own goals"
ON public.goals FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own goals
CREATE POLICY "Users can insert their own goals"
ON public.goals FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own goals
CREATE POLICY "Users can update their own goals"
ON public.goals FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own goals
CREATE POLICY "Users can delete their own goals"
ON public.goals FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Create goal notes table
CREATE TABLE public.goal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on goal_notes
ALTER TABLE public.goal_notes ENABLE ROW LEVEL SECURITY;

-- Users can view notes on their goals
CREATE POLICY "Users can view notes on their goals"
ON public.goal_notes FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.goals WHERE id = goal_id AND user_id = auth.uid())
  OR user_id = auth.uid()
);

-- Users can insert notes
CREATE POLICY "Users can insert notes"
ON public.goal_notes FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes"
ON public.goal_notes FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Create friend invitations table
CREATE TABLE public.friend_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.friend_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations they sent or received
CREATE POLICY "Users can view their invitations"
ON public.friend_invitations FOR SELECT TO authenticated
USING (
  inviter_id = auth.uid() 
  OR invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Users can create invitations
CREATE POLICY "Users can create invitations"
ON public.friend_invitations FOR INSERT TO authenticated
WITH CHECK (inviter_id = auth.uid());

-- Users can update invitations sent to them
CREATE POLICY "Users can respond to invitations"
ON public.friend_invitations FOR UPDATE TO authenticated
USING (invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create friendships table
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can view their friendships
CREATE POLICY "Users can view their friendships"
ON public.friendships FOR SELECT TO authenticated
USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Users can create friendships
CREATE POLICY "Users can create friendships"
ON public.friendships FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can delete friendships
CREATE POLICY "Users can delete friendships"
ON public.friendships FOR DELETE TO authenticated
USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Create shared goals table (which goals are shared with which friends)
CREATE TABLE public.shared_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_complete BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(goal_id, shared_with_id)
);

-- Enable RLS
ALTER TABLE public.shared_goals ENABLE ROW LEVEL SECURITY;

-- Goal owners and shared users can view shared goals
CREATE POLICY "Users can view shared goals"
ON public.shared_goals FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR shared_with_id = auth.uid());

-- Goal owners can share their goals
CREATE POLICY "Owners can share their goals"
ON public.shared_goals FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Goal owners can unshare their goals
CREATE POLICY "Owners can unshare their goals"
ON public.shared_goals FOR DELETE TO authenticated
USING (owner_id = auth.uid());

-- Add policy for users to view goals shared with them
CREATE POLICY "Users can view goals shared with them"
ON public.goals FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.shared_goals WHERE goal_id = id AND shared_with_id = auth.uid())
);

-- Add policy for collaborators to update shared goals (mark complete)
CREATE POLICY "Collaborators can update shared goals"
ON public.goals FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.shared_goals WHERE goal_id = id AND shared_with_id = auth.uid() AND can_complete = true)
);

-- Add policy for users to add notes to shared goals
CREATE POLICY "Users can add notes to shared goals"
ON public.goal_notes FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.shared_goals WHERE goal_id = goal_notes.goal_id AND shared_with_id = auth.uid())
);

-- Add policy for users to view notes on shared goals
CREATE POLICY "Users can view notes on shared goals"
ON public.goal_notes FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.shared_goals sg 
    JOIN public.goals g ON g.id = sg.goal_id 
    WHERE g.id = goal_notes.goal_id AND sg.shared_with_id = auth.uid())
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
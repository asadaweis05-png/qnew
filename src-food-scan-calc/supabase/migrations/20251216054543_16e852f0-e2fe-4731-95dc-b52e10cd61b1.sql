-- Create friendships table for friend connections
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships where they are involved
CREATE POLICY "Users can view their friendships"
ON public.friendships
FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
ON public.friendships
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Users can update friendships they received (accept/reject)
CREATE POLICY "Users can respond to friend requests"
ON public.friendships
FOR UPDATE
USING (auth.uid() = addressee_id);

-- Users can delete their own friendships
CREATE POLICY "Users can delete their friendships"
ON public.friendships
FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Add email column to profiles for friend lookup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create trigger for updated_at
CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
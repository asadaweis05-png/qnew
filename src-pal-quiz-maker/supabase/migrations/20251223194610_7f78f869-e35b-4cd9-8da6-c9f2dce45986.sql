-- Create interest groups table
CREATE TABLE public.interest_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '🎯',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  member_count INTEGER NOT NULL DEFAULT 0
);

-- Create group memberships table
CREATE TABLE public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.interest_groups(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Create group messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.interest_groups(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interest_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Interest groups policies (public read, admin write)
CREATE POLICY "Anyone can view groups"
ON public.interest_groups
FOR SELECT
USING (true);

-- Group memberships policies
CREATE POLICY "Users can view all memberships"
ON public.group_memberships
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can join groups"
ON public.group_memberships
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
ON public.group_memberships
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Group messages policies
CREATE POLICY "Members can view group messages"
ON public.group_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships
    WHERE group_memberships.group_id = group_messages.group_id
    AND group_memberships.user_id = auth.uid()
  )
);

CREATE POLICY "Members can send messages"
ON public.group_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.group_memberships
    WHERE group_memberships.group_id = group_messages.group_id
    AND group_memberships.user_id = auth.uid()
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_memberships;

-- Insert some default interest groups
INSERT INTO public.interest_groups (name, description, icon) VALUES
('Kubadda Cagta', 'Kuwa jecel kubadda cagta - Real Madrid, Barcelona, iyo kuwa kale', '⚽'),
('Muusiga', 'Wadaag heesaha aad jeceshahay iyo fanaaniinta cusub', '🎵'),
('Ciyaaraha Video', 'FIFA, Call of Duty, iyo ciyaaraha kale', '🎮'),
('Waxbarashada', 'Wadaag aqoontaada iyo wax cusub baro', '📚'),
('Socdaalka', 'Meelaha quruxda badan iyo safarka', '✈️'),
('Cuntada', 'Cunto kala duwan iyo karinta', '🍕');
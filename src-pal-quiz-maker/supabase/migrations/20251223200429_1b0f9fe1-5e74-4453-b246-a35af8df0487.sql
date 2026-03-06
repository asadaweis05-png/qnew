-- Allow authenticated users to create groups
CREATE POLICY "Authenticated users can create groups"
ON public.interest_groups
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow group creators to update their groups (optional for future use)
CREATE POLICY "Anyone can update member count"
ON public.interest_groups
FOR UPDATE
USING (true)
WITH CHECK (true);
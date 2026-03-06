-- Add restrictive UPDATE policy for evc_payments (payments should never be updated by clients)
CREATE POLICY "Payments cannot be updated by clients" 
ON public.evc_payments 
FOR UPDATE 
USING (false);

-- Add restrictive DELETE policy for evc_payments (payments should never be deleted)
CREATE POLICY "Payments cannot be deleted" 
ON public.evc_payments 
FOR DELETE 
USING (false);

-- Add restrictive UPDATE policy for subscriptions (subscriptions should not be updated by clients directly)
CREATE POLICY "Subscriptions cannot be updated by clients" 
ON public.subscriptions 
FOR UPDATE 
USING (false);

-- Add restrictive DELETE policy for subscriptions
CREATE POLICY "Subscriptions cannot be deleted" 
ON public.subscriptions 
FOR DELETE 
USING (false);
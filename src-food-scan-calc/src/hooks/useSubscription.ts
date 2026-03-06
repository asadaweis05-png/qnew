import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface Subscription {
  id: string;
  plan_type: 'monthly' | 'quarterly' | 'annual';
  status: 'active' | 'expired' | 'cancelled';
  amount_paid: number;
  start_date: string;
  end_date: string;
  transaction_id: string | null;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  phone_number: string;
  email: string;
  transaction_id: string | null;
  status: string;
  created_at: string;
}

export const useSubscription = (user: User | null) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setPayments([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      
      // Fetch active subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError) {
        console.error('Error fetching subscription:', subError);
      } else {
        setSubscription(subData as Subscription | null);
      }

      // Fetch payment history
      const { data: paymentData, error: paymentError } = await supabase
        .from('evc_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (paymentError) {
        console.error('Error fetching payments:', paymentError);
      } else {
        setPayments((paymentData || []) as Payment[]);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const cancelSubscription = async () => {
    if (!subscription) return { error: 'No active subscription' };

    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscription.id);

    if (error) {
      console.error('Error cancelling subscription:', error);
      return { error: error.message };
    }

    setSubscription({ ...subscription, status: 'cancelled' });
    return { success: true };
  };

  return {
    subscription,
    payments,
    loading,
    cancelSubscription,
  };
};

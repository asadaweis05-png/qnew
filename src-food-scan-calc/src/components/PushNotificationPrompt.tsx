import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PushNotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVapidKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-vapid-key');
        if (!error && data?.publicKey) {
          setVapidKey(data.publicKey);
        }
      } catch (err) {
        console.error('Error fetching VAPID key:', err);
      }
    };

    fetchVapidKey();
  }, []);

  useEffect(() => {
    if (!vapidKey) return;

    // Check if notifications are supported and not already subscribed
    const checkNotificationStatus = async () => {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        return;
      }

      // Don't show if already subscribed or denied
      if (Notification.permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) return;
      }

      if (Notification.permission === 'denied') {
        return;
      }

      // Check if user dismissed before (using localStorage)
      const dismissed = localStorage.getItem('push_prompt_dismissed');
      if (dismissed) {
        const dismissedDate = new Date(dismissed);
        const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) return; // Don't show for 7 days after dismiss
      }

      // Show prompt after 3 seconds
      setTimeout(() => setShowPrompt(true), 3000);
    };

    checkNotificationStatus();
  }, [vapidKey]);

  const subscribeToNotifications = async () => {
    if (!vapidKey) return;
    setIsSubscribing(true);
    
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({
          title: "Oggolaanshaha la diiday",
          description: "Waxaad ka soo bixin kartaa settings-ka browser-kaaga",
          variant: "destructive"
        });
        setShowPrompt(false);
        return;
      }

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(vapidKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer
      });

      const subscriptionJson = subscription.toJSON();

      // Save subscription to database
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          endpoint: subscriptionJson.endpoint,
          p256dh: subscriptionJson.keys?.p256dh || '',
          auth: subscriptionJson.keys?.auth || ''
        });

      if (error) throw error;

      toast({
        title: "Waad ku guulaysatay!",
        description: "Waxaad heli doontaa ogeysiisyo muhiim ah"
      });

      setShowPrompt(false);
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast({
        title: "Khalad ayaa dhacay",
        description: "Fadlan isku day mar kale",
        variant: "destructive"
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const dismissPrompt = () => {
    localStorage.setItem('push_prompt_dismissed', new Date().toISOString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-xl p-4 shadow-lg z-50 animate-in slide-in-from-bottom-4">
      <button 
        onClick={dismissPrompt}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Subscribe Saaro</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Si aad uhesho talooyin caafimaad, cunto iyo gym si free ah
          </p>
          <Button 
            onClick={subscribeToNotifications}
            disabled={isSubscribing}
            size="sm"
            className="mt-3"
          >
            {isSubscribing ? 'Sugaya...' : 'Ogolow'}
          </Button>
        </div>
      </div>
    </div>
  );
};

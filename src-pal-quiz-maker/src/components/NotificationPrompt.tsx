import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);

  useEffect(() => {
    const hasAsked = localStorage.getItem('notification_prompt_shown');
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    
    if (!hasAsked && isSupported && Notification.permission === 'default') {
      // Fetch VAPID key from backend
      supabase.functions.invoke('get-vapid-key').then(({ data, error }) => {
        if (data?.publicKey) {
          setVapidKey(data.publicKey);
          const timer = setTimeout(() => setShowPrompt(true), 1500);
          return () => clearTimeout(timer);
        } else {
          console.log('VAPID key not available:', error);
        }
      });
    }
  }, []);

  const subscribeToNotifications = async () => {
    if (!vapidKey) {
      toast.error('Notification service not configured');
      return;
    }
    
    setIsSubscribing(true);
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        setShowPrompt(false);
        localStorage.setItem('notification_prompt_shown', 'true');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      const subscriptionJson = subscription.toJSON();
      
      const { error } = await supabase.from('push_subscriptions').insert({
        endpoint: subscriptionJson.endpoint!,
        p256dh: subscriptionJson.keys!.p256dh,
        auth: subscriptionJson.keys!.auth,
        user_agent: navigator.userAgent
      });

      if (error) {
        console.error('Error saving subscription:', error);
        toast.error('Failed to save subscription');
      } else {
        toast.success('Notifications enabled! You\'ll be notified of new updates.');
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setIsSubscribing(false);
      setShowPrompt(false);
      localStorage.setItem('notification_prompt_shown', 'true');
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('notification_prompt_shown', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="mx-4 w-full max-w-sm bg-card p-6 rounded-2xl shadow-2xl border border-border">
        <button 
          onClick={dismissPrompt}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <Bell className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <div>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              Ogow Warka Cusub!
            </h3>
            <p className="text-muted-foreground">
              News, football iyo waxyaabo kale si aad uhesho fariinta furro. Mahadsanid!
            </p>
          </div>
          
          <div className="flex flex-col w-full gap-2 mt-2">
            <Button
              onClick={subscribeToNotifications}
              disabled={isSubscribing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isSubscribing ? 'Sugaya...' : 'Haa, Fur'}
            </Button>
            <Button
              onClick={dismissPrompt}
              variant="outline"
              className="w-full"
            >
              Hadda Maya
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

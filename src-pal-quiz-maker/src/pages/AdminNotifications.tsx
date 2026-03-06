import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Send, ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in title and message');
      return;
    }

    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: { title, body, url }
      });

      if (error) {
        console.error('Error sending notification:', error);
        toast.error('Failed to send notification');
        return;
      }

      setLastResult(data);
      toast.success(`Notification sent to ${data.sent} subscriber${data.sent !== 1 ? 's' : ''}`);
      
      // Clear form
      setTitle('');
      setBody('');
      setUrl('/');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text">
              Send Notifications
            </h1>
            <p className="text-muted-foreground">
              Notify all subscribers about updates
            </p>
          </div>
        </div>

        {/* Stats Card */}
        {lastResult && (
          <div className="glass-card p-4 rounded-2xl mb-6 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last notification</p>
                <p className="font-semibold text-foreground">
                  Sent to {lastResult.sent} of {lastResult.total} subscribers
                  {lastResult.failed > 0 && (
                    <span className="text-destructive ml-2">
                      ({lastResult.failed} failed)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={sendNotification} className="glass-card p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold text-foreground">
                New Notification
              </h2>
              <p className="text-sm text-muted-foreground">
                Fill in the details below
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New Article Published!"
                className="bg-background/50 border-white/10 focus:border-primary/50"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground text-right">
                {title.length}/60
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body" className="text-foreground">Message</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Check out our latest content..."
                className="bg-background/50 border-white/10 focus:border-primary/50 min-h-[100px]"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {body.length}/200
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-foreground">
                Link URL <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/news"
                className="bg-background/50 border-white/10 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground">
                Where users go when they click the notification
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSending || !title.trim() || !body.trim()}
            className="w-full mt-6 bg-gradient-primary hover:opacity-90 text-white font-semibold py-6"
          >
            {isSending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Notification
              </>
            )}
          </Button>
        </form>

        {/* Preview */}
        {(title || body) && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">Preview:</p>
            <div className="glass-card p-4 rounded-xl border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {title || 'Notification Title'}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {body || 'Notification message will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

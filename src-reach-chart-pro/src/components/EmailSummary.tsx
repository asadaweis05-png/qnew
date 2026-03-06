import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, X, Loader2, Calendar, CalendarDays, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Goal } from '@/types/goal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailSummaryProps {
  goals: Goal[];
}

export const EmailSummary = ({ goals }: EmailSummaryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-summary', {
        body: { email, period, goals }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSent(true);
      toast.success(`${period === 'weekly' ? 'Weekly' : 'Monthly'} summary sent to ${email}!`);
      
      setTimeout(() => {
        setIsOpen(false);
        setSent(false);
        setEmail('');
      }, 2000);
    } catch (err) {
      console.error('Email error:', err);
      const message = err instanceof Error ? err.message : 'Failed to send email';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2 rounded-full px-4 h-9 border-border hover:border-primary/30"
      >
        <Mail className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">Email</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isLoading && setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md rounded-2xl shadow-floating border border-border overflow-hidden"
            >
              {/* Header */}
              <div className="bg-card border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-lg">Email Summary</h2>
                    <p className="text-xs text-muted-foreground">Get AI insights in your inbox</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)} 
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 space-y-4">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">Email Sent!</h3>
                    <p className="text-muted-foreground text-sm">Check your inbox for your summary.</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Email Input */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Your Email
                      </label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Period Selection */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Summary Period
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setPeriod('weekly')}
                          disabled={isLoading}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            period === 'weekly'
                              ? 'bg-primary text-primary-foreground shadow-soft'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          Weekly
                        </button>
                        <button
                          onClick={() => setPeriod('monthly')}
                          disabled={isLoading}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            period === 'monthly'
                              ? 'bg-primary text-primary-foreground shadow-soft'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          <CalendarDays className="w-4 h-4" />
                          Monthly
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="bg-secondary/50 rounded-lg p-3 text-sm text-muted-foreground">
                      <p>
                        We'll send you a beautifully formatted email with your goal progress 
                        and AI-powered insights to help you stay on track.
                      </p>
                    </div>

                    {/* Send Button */}
                    <Button
                      onClick={handleSend}
                      disabled={isLoading || !email.trim()}
                      className="w-full gradient-warm border-0 h-12"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {isLoading ? 'Sending...' : 'Send Summary'}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

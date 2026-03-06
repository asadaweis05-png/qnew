
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Smartphone } from 'lucide-react';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('free');
  const { toast } = useToast();

  const handleFreeSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) throw error;

      toast({
        title: "Successfully subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail('');
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message === 'duplicate key value violates unique constraint "newsletter_subscribers_email_key"' 
          ? "This email is already subscribed!"
          : "Please enter a valid email address.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaidSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!phoneNumber || phoneNumber.length < 9) {
        throw new Error("Please enter a valid Somali phone number");
      }

      const response = await supabase.functions.invoke('hormuud-evc-payment', {
        body: {
          phoneNumber: phoneNumber,
          amount: 1,
          email: email,
          description: "Newsletter Subscription"
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Payment processing failed");
      }

      const result = response.data;
      
      if (result?.status === "success") {
        toast({
          title: "Payment successful!",
          description: result.message || "Thank you for subscribing!",
        });
        setEmail('');
        setPhoneNumber('');
      } else {
        toast({
          title: "Payment request sent!",
          description: "Please check your phone to confirm the payment.",
        });
      }
    } catch (error: any) {
      console.error("EVC payment error:", error);
      toast({
        title: "Payment failed",
        description: error.message || "There was a problem processing your payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="free" className="w-full" onValueChange={setPaymentMethod}>
        <TabsList className="grid grid-cols-2 mb-6 bg-secondary/50 p-1 rounded-full">
          <TabsTrigger 
            value="free" 
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            Free
          </TabsTrigger>
          <TabsTrigger 
            value="paid" 
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            Premium
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="free" className="mt-0">
          <form onSubmit={handleFreeSubscription} className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              className="flex-1 h-12 bg-secondary border-border rounded-full px-5 placeholder:text-muted-foreground focus:border-primary"
            />
            <Button 
              type="submit" 
              disabled={loading}
              className="h-12 px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="paid" className="mt-0">
          <form onSubmit={handlePaidSubscription} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-paid" className="text-sm text-muted-foreground">Email Address</Label>
              <Input
                id="email-paid"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                className="h-12 bg-secondary border-border rounded-xl px-4 placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm text-muted-foreground">EVC Phone Number</Label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="615123456"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="h-12 bg-secondary border-border rounded-xl pl-11 pr-4 placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Hormuud EVC-registered number only
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {loading ? "Processing..." : "Subscribe with EVC — $1/month"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsletterSignup;

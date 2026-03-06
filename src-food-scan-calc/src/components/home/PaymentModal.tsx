import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, Phone, Mail, Shield } from "lucide-react";

interface Plan {
  name: string;
  price: string;
  period: string;
  billedAs?: string;
  totalAmount: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}

const PaymentModal = ({ isOpen, onClose, plan }: PaymentModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user session
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    };
    getUser();
  }, [isOpen]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plan) return;

    // Basic validation
    if (!phoneNumber || phoneNumber.length < 9) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Map plan name to enum value (lowercase)
      const planType = plan.name.toLowerCase() as "monthly" | "quarterly" | "annual";

      const { data, error } = await supabase.functions.invoke("hormuud-evc-payment", {
        body: {
          phoneNumber: phoneNumber.replace(/\s/g, ""),
          amount: plan.totalAmount,
          email: email.trim(),
          description: `NutriTrack ${plan.name} subscription`,
          planType,
          userId,
        },
      });

      if (error) throw error;

      if (data?.status === "success") {
        toast({
          title: "Payment Successful! 🎉",
          description: `Your ${plan.name} subscription is now active. Transaction ID: ${data.transactionId || "N/A"}`,
        });
        onClose();
        setPhoneNumber("");
      } else {
        throw new Error(data?.error || data?.details || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Complete Your Purchase
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Subscribe to {plan.name} plan via EVC Plus
          </DialogDescription>
        </DialogHeader>

        {/* Plan Summary */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-foreground">{plan.name} Plan</p>
              <p className="text-sm text-muted-foreground">{plan.billedAs || `Billed ${plan.period}`}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">${plan.totalAmount}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        {!userId && (
          <div className="bg-muted/50 border border-border rounded-lg p-3 mb-2">
            <p className="text-xs text-muted-foreground">
              💡 Sign in to track your subscription and access premium features.
            </p>
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              EVC Plus Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., 61XXXXXXX or 252XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter your Hormuud/EVC Plus phone number
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-muted-foreground">
              We'll send your subscription details here
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-secondary/10 rounded-lg border border-secondary/20">
            <Shield className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your payment is secure. You'll receive an EVC Plus prompt on your phone to confirm the payment.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border text-foreground hover:bg-muted"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${plan.totalAmount}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;

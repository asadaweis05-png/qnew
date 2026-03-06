import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Loader2,
  Receipt,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import PaymentModal from '@/components/home/PaymentModal';
import Footer from '@/components/Footer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const planDetails = {
  monthly: { name: 'Monthly', price: '$4', period: '/month', totalAmount: 4 },
  quarterly: { name: 'Quarterly', price: '$2', period: '/month', billedAs: 'Billed as $6 every 3 months', totalAmount: 6 },
  annual: { name: 'Annual', price: '$2', period: '/month', billedAs: 'Billed as $24 per year', totalAmount: 24 },
};

const Subscription = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { subscription, payments, loading, cancelSubscription } = useSubscription(user);
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleUpgrade = (planType: 'monthly' | 'quarterly' | 'annual') => {
    setSelectedPlan(planDetails[planType]);
    setIsModalOpen(true);
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    const result = await cancelSubscription();
    setIsCancelling(false);
    
    if (result.success) {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You'll retain access until the end of your billing period.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Sign In Required</h2>
              <p className="text-muted-foreground text-center mb-6">
                Please sign in to view your subscription and payment history.
              </p>
              <Button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isActive = subscription?.status === 'active';
  const daysRemaining = subscription 
    ? Math.max(0, Math.ceil((new Date(subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pt-24">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground">Subscription</h1>
              <p className="text-sm text-muted-foreground">Manage your plan and billing</p>
            </div>
          </div>

          {/* Current Plan Card */}
          <Card className="bg-card border-border mb-8 overflow-hidden">
            {isActive && (
              <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    Current Plan
                    {isActive && <Sparkles className="w-4 h-4 text-primary" />}
                  </CardTitle>
                  <CardDescription>Your subscription status</CardDescription>
                </div>
                {subscription && (
                  <Badge 
                    variant={isActive ? "default" : "secondary"}
                    className={isActive ? "bg-secondary text-secondary-foreground" : ""}
                  >
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-xl">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {planDetails[subscription.plan_type]?.name || subscription.plan_type} Plan
                      </p>
                      <p className="text-muted-foreground">
                        {planDetails[subscription.plan_type]?.price}{planDetails[subscription.plan_type]?.period}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">
                        ${subscription.amount_paid}
                      </p>
                      <p className="text-xs text-muted-foreground">paid</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Started</p>
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(subscription.start_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Expires</p>
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(subscription.end_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-secondary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Days Left</p>
                        <p className="text-sm font-medium text-foreground">{daysRemaining} days</p>
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                      {subscription.plan_type !== 'annual' && (
                        <Button 
                          onClick={() => handleUpgrade('annual')}
                          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                          Upgrade to Annual
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                            Cancel Subscription
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-foreground">Cancel Subscription?</AlertDialogTitle>
                            <AlertDialogDescription>
                              You'll retain access until {format(new Date(subscription.end_date), 'MMMM d, yyyy')}. 
                              After that, you'll lose access to premium features.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-border">Keep Subscription</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleCancel}
                              className="bg-destructive hover:bg-destructive/90"
                              disabled={isCancelling}
                            >
                              {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Cancel'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Active Subscription</h3>
                  <p className="text-muted-foreground mb-6">
                    Subscribe to unlock all premium features and track your nutrition effortlessly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => handleUpgrade('monthly')} variant="outline" className="border-border">
                      Monthly - $4
                    </Button>
                    <Button onClick={() => handleUpgrade('quarterly')} variant="outline" className="border-border">
                      Quarterly - $6
                    </Button>
                    <Button onClick={() => handleUpgrade('annual')} className="bg-primary hover:bg-primary/90">
                      Annual - $24 (Best Value)
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Payment History
              </CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            ${payment.amount} Payment
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.created_at), 'MMM d, yyyy • h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={payment.status === 'success' ? 'default' : 'secondary'} className="bg-secondary/20 text-secondary">
                          {payment.status}
                        </Badge>
                        {payment.transaction_id && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ID: {payment.transaction_id.slice(-8)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No payment history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
};

export default Subscription;

import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentModal from "./PaymentModal";

interface Plan {
  name: string;
  price: string;
  period: string;
  billedAs?: string;
  description: string;
  features: string[];
  popular: boolean;
  savings: string | null;
  totalAmount: number;
}

const PricingSection = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const plans: Plan[] = [
    {
      name: "Monthly",
      price: "$4",
      period: "/month",
      description: "Perfect for trying out",
      features: [
        "Unlimited food tracking",
        "AI-powered analysis",
        "Daily nutrition insights",
        "Goal tracking",
        "Basic support"
      ],
      popular: false,
      savings: null,
      totalAmount: 4
    },
    {
      name: "Quarterly",
      price: "$2",
      period: "/month",
      billedAs: "Billed as $6 every 3 months",
      description: "Most flexible savings",
      features: [
        "Everything in Monthly",
        "Priority AI processing",
        "Advanced analytics",
        "Custom meal plans",
        "Priority support"
      ],
      popular: false,
      savings: "Save 50%",
      totalAmount: 6
    },
    {
      name: "Annual",
      price: "$2",
      period: "/month",
      billedAs: "Billed as $24 per year",
      description: "Best value for committed users",
      features: [
        "Everything in Quarterly",
        "Exclusive features first",
        "Personal nutrition coach",
        "API access",
        "24/7 Premium support"
      ],
      popular: true,
      savings: "Save 50%",
      totalAmount: 24
    }
  ];

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Simple Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start your nutrition journey today. Save more with longer commitments.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative group rounded-2xl p-8 transition-all duration-500 ${
                plan.popular
                  ? "bg-gradient-to-b from-primary/20 via-primary/10 to-background border-2 border-primary/40 scale-105 shadow-2xl shadow-primary/20"
                  : "bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-xl"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Savings badge */}
              {plan.savings && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-secondary/20 text-secondary text-xs font-bold rounded-full border border-secondary/30">
                    {plan.savings}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.billedAs && (
                  <p className="text-sm text-muted-foreground mt-2">{plan.billedAs}</p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-1 ${plan.popular ? "bg-primary/20" : "bg-primary/10"}`}>
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-6 text-base font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                    : "bg-foreground/10 hover:bg-foreground/20 text-foreground border border-border/50"
                }`}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-muted-foreground mt-12">
          All plans include a 7-day free trial. Cancel anytime.
        </p>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
      />
    </section>
  );
};

export default PricingSection;

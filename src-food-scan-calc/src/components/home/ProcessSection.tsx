
import { ArrowRight } from "lucide-react";

export const ProcessSection = () => {
  const steps = [
    {
      number: "01",
      title: "Log Your Food",
      description: "Search for foods, scan barcodes, or upload images of your meals for instant tracking."
    },
    {
      number: "02",
      title: "Track Nutrients",
      description: "Get a detailed breakdown of calories, protein, carbs, and fats for every meal."
    },
    {
      number: "03",
      title: "Achieve Goals",
      description: "Monitor your progress with beautiful insights and adjust your diet accordingly."
    }
  ];

  return (
    <section className="section-padding bg-card relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/[0.03] to-transparent" />
      
      <div className="container-wide relative z-10">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-20 gap-8">
          <div>
            <span className="label-pill mb-6">How It Works</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mt-6">
              Simple Process,
              <br />
              <span className="text-muted-foreground">Powerful Results</span>
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground text-lg">
            Start your nutrition journey in three easy steps. No complicated setup, just results.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent z-0" />
              )}
              
              <div className="relative z-10 p-8 rounded-2xl bg-background border border-border transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_40px_-15px_hsl(35_90%_55%/0.2)]">
                {/* Step number */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-display text-5xl text-primary/40 group-hover:text-primary transition-colors duration-500">
                    {step.number}
                  </span>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground/30 lg:hidden" />
                  )}
                </div>
                
                {/* Content */}
                <h3 className="font-display text-2xl text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


import { Camera, BarChart3, Target, Utensils } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Camera,
      title: "Snap & Track",
      description: "Take a photo of your meal and let AI identify ingredients and calculate nutrition instantly.",
      accent: "from-primary/20 to-primary/5"
    },
    {
      icon: Utensils,
      title: "Smart Search",
      description: "Access our extensive database of foods with detailed nutritional breakdowns.",
      accent: "from-accent/20 to-accent/5"
    },
    {
      icon: BarChart3,
      title: "Visual Analytics",
      description: "Beautiful charts and insights to help you understand your eating patterns over time.",
      accent: "from-primary/20 to-primary/5"
    },
    {
      icon: Target,
      title: "Personal Goals",
      description: "Set custom nutrition targets based on your unique health and fitness objectives.",
      accent: "from-accent/20 to-accent/5"
    }
  ];

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.02] rounded-full blur-3xl" />
      
      <div className="container-wide relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <span className="label-pill mb-6">Features</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mt-6">
            Everything You Need
            <br />
            <span className="text-muted-foreground">In One Place</span>
          </h2>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-card group"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.accent} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110`}>
                <feature.icon className="w-6 h-6 text-foreground" />
              </div>
              
              {/* Content */}
              <h3 className="font-display text-2xl text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

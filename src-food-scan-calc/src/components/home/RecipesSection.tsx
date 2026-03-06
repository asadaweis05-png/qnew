
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export const RecipesSection = () => {
  const recipes = [
    {
      title: "Quick Breakfast Ideas",
      description: "Start your day with nutritious and energizing breakfast options.",
      image: "https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?q=80&w=800&h=600&fit=crop&auto=format",
      category: "Morning"
    },
    {
      title: "Protein-Rich Lunches",
      description: "Power through your afternoon with these protein-packed recipes.",
      image: "https://images.unsplash.com/photo-1547496502-affa22d38842?q=80&w=800&h=600&fit=crop&auto=format",
      category: "Midday"
    },
    {
      title: "Balanced Dinners",
      description: "End your day with nutritious meals that support your health goals.",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800&h=600&fit=crop&auto=format",
      category: "Evening"
    }
  ];

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="container-wide">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-8">
          <div>
            <span className="label-pill mb-6">Recipes</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mt-6">
              Curated Meals
              <br />
              <span className="text-muted-foreground">For Every Goal</span>
            </h2>
          </div>
          <Link 
            to="/recipes" 
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all group"
          >
            View All Recipes
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Recipe cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <article 
              key={index}
              className="group cursor-pointer"
            >
              {/* Image container */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-secondary">
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Category badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground">
                  {recipe.category}
                </div>
              </div>
              
              {/* Content */}
              <h3 className="font-display text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                {recipe.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {recipe.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

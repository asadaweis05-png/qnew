import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, TrendingUp, Zap, ArrowUpRight, Newspaper, Trophy, Cpu, Landmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: "sports" | "technology" | "politics";
  imageUrl: string;
  author: string;
  publishedAt: string;
  readTime: string;
  featured?: boolean;
}

const newsData: NewsArticle[] = [
  // Sports
  {
    id: "1",
    title: "Champions League Final: Epic Showdown Between European Giants",
    excerpt: "The biggest match of the season approaches as two titans of European football prepare for an unforgettable night at Wembley Stadium.",
    category: "sports",
    imageUrl: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80",
    author: "James Wilson",
    publishedAt: "2 hours ago",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: "2",
    title: "NBA Finals Game 7: Historic Night for Basketball",
    excerpt: "An incredible finish to the season as both teams battle for championship glory in what many call the greatest finals in decades.",
    category: "sports",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
    author: "Michael Chen",
    publishedAt: "4 hours ago",
    readTime: "4 min read",
  },
  {
    id: "3",
    title: "Tennis Grand Slam: Rising Stars Challenge Established Champions",
    excerpt: "Young talents are making waves at Wimbledon, challenging the dominance of seasoned veterans in thrilling matches.",
    category: "sports",
    imageUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
    author: "Sarah Thompson",
    publishedAt: "6 hours ago",
    readTime: "3 min read",
  },
  {
    id: "4",
    title: "Formula 1: Revolutionary Car Designs Unveiled",
    excerpt: "Teams reveal groundbreaking aerodynamic innovations that promise to shake up the competitive landscape.",
    category: "sports",
    imageUrl: "https://images.unsplash.com/photo-1541447270888-83e8494f9c08?w=800&q=80",
    author: "David Martinez",
    publishedAt: "8 hours ago",
    readTime: "6 min read",
  },
  // Technology
  {
    id: "5",
    title: "AI Revolution: New Models Achieve Human-Level Reasoning",
    excerpt: "Breakthrough in artificial intelligence as researchers announce models capable of complex problem-solving and creative thinking.",
    category: "technology",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    author: "Dr. Emily Zhang",
    publishedAt: "1 hour ago",
    readTime: "7 min read",
    featured: true,
  },
  {
    id: "6",
    title: "Quantum Computing Milestone: Commercial Applications Emerge",
    excerpt: "Tech giants announce practical quantum computing solutions for pharmaceutical research and financial modeling.",
    category: "technology",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    author: "Robert Kumar",
    publishedAt: "3 hours ago",
    readTime: "5 min read",
  },
  {
    id: "7",
    title: "SpaceX Starship: Ready for Mars Mission",
    excerpt: "Elon Musk's vision for interplanetary travel takes a major step forward with successful test flights.",
    category: "technology",
    imageUrl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&q=80",
    author: "Lisa Anderson",
    publishedAt: "5 hours ago",
    readTime: "4 min read",
  },
  {
    id: "8",
    title: "Apple Vision Pro 2: Future of Spatial Computing",
    excerpt: "Next generation mixed reality headset promises revolutionary experiences for work and entertainment.",
    category: "technology",
    imageUrl: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&q=80",
    author: "Mark Stevens",
    publishedAt: "7 hours ago",
    readTime: "6 min read",
  },
  // Politics
  {
    id: "9",
    title: "Global Climate Summit: Historic Agreement by 195 Nations",
    excerpt: "World leaders commit to ambitious carbon reduction targets in landmark environmental accord.",
    category: "politics",
    imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    author: "Jennifer Brooks",
    publishedAt: "30 minutes ago",
    readTime: "8 min read",
    featured: true,
  },
  {
    id: "10",
    title: "Economic Policy Shift: Central Banks Coordinate",
    excerpt: "Major economies align on monetary policy to address inflation concerns and stimulate sustainable growth.",
    category: "politics",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    author: "Thomas Wright",
    publishedAt: "2 hours ago",
    readTime: "5 min read",
  },
  {
    id: "11",
    title: "Healthcare Reform: Universal Coverage Bill",
    excerpt: "Bipartisan legislation aims to expand healthcare access while controlling costs through innovative approaches.",
    category: "politics",
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
    author: "Amanda Collins",
    publishedAt: "4 hours ago",
    readTime: "6 min read",
  },
  {
    id: "12",
    title: "Diplomatic Breakthrough: Peace Talks Progress",
    excerpt: "International mediators report significant advancement in resolving long-standing regional conflicts.",
    category: "politics",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80",
    author: "William Harris",
    publishedAt: "6 hours ago",
    readTime: "4 min read",
  },
];

const categoryConfig = {
  sports: { icon: Trophy, class: "category-sports", label: "Sports" },
  technology: { icon: Cpu, class: "category-tech", label: "Technology" },
  politics: { icon: Landmark, class: "category-politics", label: "Politics" },
};

const categories = ["all", "sports", "technology", "politics"] as const;

// Hero Featured Card - Large asymmetric layout
const HeroCard = ({ article }: { article: NewsArticle }) => {
  const config = categoryConfig[article.category];
  const Icon = config.icon;
  
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-foreground h-[500px] lg:h-[600px] card-lift cursor-pointer">
      <div className="absolute inset-0">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-transparent" />
      </div>
      
      <div className="relative h-full flex flex-col justify-end p-6 lg:p-10">
        <div className="flex items-center gap-3 mb-4">
          <Badge className={`${config.class} border font-medium`}>
            <Icon className="w-3 h-3 mr-1.5" />
            {config.label}
          </Badge>
          <span className="flex items-center gap-1 text-background/70 text-sm">
            <Zap className="w-3 h-3" />
            Breaking
          </span>
        </div>
        
        <h2 className="font-display text-3xl lg:text-5xl font-bold text-background mb-4 leading-tight">
          {article.title}
        </h2>
        
        <p className="text-background/80 text-lg mb-6 max-w-2xl line-clamp-2">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-background/60 text-sm">
            <span className="font-medium text-background/80">{article.author}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.publishedAt}
            </span>
            <span>{article.readTime}</span>
          </div>
          
          <Button 
            variant="secondary" 
            className="rounded-full gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            Read Story
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </article>
  );
};

// Featured Side Cards - Compact horizontal layout
const FeaturedSideCard = ({ article, index }: { article: NewsArticle; index: number }) => {
  const config = categoryConfig[article.category];
  const Icon = config.icon;
  
  return (
    <article 
      className="group flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 card-lift cursor-pointer"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="w-28 h-28 flex-shrink-0 overflow-hidden rounded-lg">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <Badge variant="outline" className={`${config.class} text-xs mb-2`}>
            <Icon className="w-2.5 h-2.5 mr-1" />
            {config.label}
          </Badge>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug">
            {article.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{article.author}</span>
          <span>•</span>
          <span>{article.publishedAt}</span>
        </div>
      </div>
    </article>
  );
};

// Standard News Card - Grid layout
const NewsCard = ({ article, index }: { article: NewsArticle; index: number }) => {
  const config = categoryConfig[article.category];
  const Icon = config.icon;
  
  return (
    <article 
      className="group flex flex-col bg-card rounded-xl border border-border overflow-hidden card-lift cursor-pointer animate-fade-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge className={`${config.class} border text-xs`}>
            <Icon className="w-2.5 h-2.5 mr-1" />
            {config.label}
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 p-5 flex flex-col">
        <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
          <span className="font-medium">{article.author}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.publishedAt}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

// Compact List Card - Mobile optimized
const ListCard = ({ article }: { article: NewsArticle }) => {
  const config = categoryConfig[article.category];
  const Icon = config.icon;
  
  return (
    <article className="group flex gap-4 py-4 border-b border-border last:border-0 cursor-pointer">
      <div className="w-24 h-20 flex-shrink-0 overflow-hidden rounded-lg">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-3 h-3 text-category-${article.category === 'technology' ? 'tech' : article.category}`} />
          <span className="text-xs text-muted-foreground">{config.label}</span>
        </div>
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>{article.publishedAt}</span>
        </div>
      </div>
    </article>
  );
};

const News = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredNews = activeCategory === "all" 
    ? newsData 
    : newsData.filter(article => article.category === activeCategory);

  const featuredNews = filteredNews.filter(article => article.featured);
  const regularNews = filteredNews.filter(article => !article.featured);
  const heroArticle = featuredNews[0];
  const sideArticles = featuredNews.slice(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Editorial Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Newspaper className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-foreground">The Daily</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Breaking news & insights</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Live
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <nav className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const config = cat !== "all" ? categoryConfig[cat] : null;
              const Icon = config?.icon || Sparkles;
              
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${isActive 
                      ? 'bg-foreground text-background' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {cat === "all" ? "All News" : config?.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section - Asymmetric Layout */}
        {heroArticle && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">Featured Stories</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Hero */}
              <div className="lg:col-span-2">
                <HeroCard article={heroArticle} />
              </div>
              
              {/* Side Stack */}
              <div className="space-y-4">
                {sideArticles.map((article, index) => (
                  <FeaturedSideCard key={article.id} article={article} index={index} />
                ))}
                
                {/* Trending Box */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Trending Now</span>
                  </div>
                  <ul className="space-y-3">
                    {regularNews.slice(0, 3).map((article, i) => (
                      <li key={article.id} className="flex items-start gap-3 group cursor-pointer">
                        <span className="text-2xl font-display font-bold text-primary/30 group-hover:text-primary transition-colors">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 font-medium">
                          {article.title}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Latest News Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">Latest News</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {regularNews.length} articles
            </span>
          </div>
          
          {/* Desktop: Grid layout */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map((article, index) => (
              <NewsCard key={article.id} article={article} index={index} />
            ))}
          </div>
          
          {/* Mobile: List layout */}
          <div className="md:hidden bg-card rounded-xl border border-border p-4">
            {regularNews.map((article) => (
              <ListCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/">
              <Button variant="outline" className="rounded-full">Home</Button>
            </Link>
            <Link to="/football">
              <Button variant="outline" className="rounded-full">Football</Button>
            </Link>
            <Link to="/chat">
              <Button variant="outline" className="rounded-full">Chat</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="rounded-full">Dashboard</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default News;
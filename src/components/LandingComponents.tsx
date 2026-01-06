import React from 'react';
import { ArrowRight, Sparkles, Globe2, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero pt-32">
    <div className="container mx-auto px-4 sm:px-6 relative z-10">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm mb-8">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">
            Regenerative Value Exchange • Powered by AI & Blockchain
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-8">
          <span className="text-foreground">Regenerating</span>
          <br />
          <span className="text-gradient">Earth's Future</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
          The world's first regenerative platform uniting ecosystems across land,
          oceans, and human health—scaling to trillion-dollar impact with an enduring ethical core.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button variant="hero" size="lg">
            Enter the Sanctum
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" size="lg">
            <Globe2 className="w-4 h-4 mr-2" />
            Explore Platform
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { value: "$2.4T", label: "Addressable Market" },
            { value: "150+", label: "Global Partners" },
            { value: "12M", label: "Hectares Protected" },
            { value: "99.9%", label: "Carbon Verified" },
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold text-gradient-gold mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export const PlatformLayers = () => (
  <section className="py-20 bg-muted/20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Platform Architecture</h2>
        <p className="text-lg text-muted-foreground">
          Multi-layered infrastructure for regenerative impact
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Verification Layer", description: "Satellite & AI verification", icon: "🛰️" },
          { title: "Marketplace Layer", description: "Global carbon credit trading", icon: "🌍" },
          { title: "Impact Layer", description: "Real-time regenerative outcomes", icon: "🌱" }
        ].map((layer, index) => (
          <div key={index} className="text-center p-8 rounded-xl bg-card border border-border">
            <div className="text-4xl mb-4">{layer.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{layer.title}</h3>
            <p className="text-muted-foreground">{layer.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const ImpactMetrics = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Global Impact</h2>
        <p className="text-lg text-muted-foreground">
          Measurable regenerative outcomes at planetary scale
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { value: "24.5M", label: "RIUs Traded", color: "text-emerald-600" },
          { value: "$1.84B", label: "Trading Volume", color: "text-blue-600" },
          { value: "2,847", label: "Active Projects", color: "text-purple-600" },
          { value: "850K+", label: "Global Users", color: "text-amber-600" }
        ].map((metric, index) => (
          <div key={index} className="text-center">
            <div className={`text-3xl font-bold mb-2 ${metric.color}`}>
              {metric.value}
            </div>
            <div className="text-sm text-muted-foreground">{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const TechnologyStack = () => (
  <section className="py-20 bg-muted/20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Technology Stack</h2>
        <p className="text-lg text-muted-foreground">
          Cutting-edge technology for verified regenerative impact
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: "Satellite Verification", description: "Real-time monitoring" },
          { name: "AI Risk Assessment", description: "Predictive analytics" },
          { name: "Blockchain Registry", description: "Immutable records" },
          { name: "IoT Sensors", description: "Ground truth data" }
        ].map((tech, index) => (
          <div key={index} className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-semibold mb-2">{tech.name}</h3>
            <p className="text-sm text-muted-foreground">{tech.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const CTASection = () => (
  <section className="py-20">
    <div className="container mx-auto px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join thousands of organizations creating verified regenerative impact
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg">
            Start Your Journey
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export const NewsletterBanner = () => (
  <section className="py-12 bg-gradient-to-r from-primary/10 to-ocean/10">
    <div className="container mx-auto px-4 text-center">
      <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
      <p className="text-muted-foreground mb-6">
        Get the latest updates on regenerative projects and market insights
      </p>
      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
        />
        <Button>Subscribe</Button>
      </div>
    </div>
  </section>
);

export default HeroSection;
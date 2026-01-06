import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Leaf } from 'lucide-react';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Atlas Sanctum - Regenerative Carbon Credits</title>
        <meta name="description" content="Leading platform for verified regenerative carbon credits and ecosystem restoration" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-32">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 mb-8">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-muted-foreground">
                  Regenerative Value Exchange • Powered by AI & Blockchain
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                <span className="text-foreground">Regenerating</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
                  Earth's Future
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
                The world's first regenerative platform uniting ecosystems across land,
                oceans, and human health—scaling to trillion-dollar impact with an enduring ethical core.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                  Enter the Sanctum
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-8 py-4 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors">
                  Explore Platform
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {[
                  { value: "$2.4T", label: "Addressable Market" },
                  { value: "150+", label: "Global Partners" },
                  { value: "12M", label: "Hectares Protected" },
                  { value: "99.9%", label: "Carbon Verified" },
                ].map((stat, index) => (
                  <div key={index} className="text-center p-4 rounded-xl bg-card/50 border border-border/50">
                    <div className="text-2xl md:text-3xl font-bold text-emerald-600 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Platform Overview */}
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

        {/* Impact Metrics */}
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

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-emerald-500/10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of organizations creating verified regenerative impact
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Start Your Journey
                </button>
                <button className="px-8 py-4 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
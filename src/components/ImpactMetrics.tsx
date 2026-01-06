import React from 'react';

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
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Subscribe
        </button>
      </div>
    </div>
  </section>
);

export default ImpactMetrics;
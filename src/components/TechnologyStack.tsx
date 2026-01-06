import React from 'react';

const TechnologyStack = () => (
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

export default TechnologyStack;
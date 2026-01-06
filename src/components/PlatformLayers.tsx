import React from 'react';

const PlatformLayers = () => (
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

export default PlatformLayers;
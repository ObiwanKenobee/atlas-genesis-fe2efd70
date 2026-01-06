import React from 'react';

const CTASection = () => (
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

export default CTASection;
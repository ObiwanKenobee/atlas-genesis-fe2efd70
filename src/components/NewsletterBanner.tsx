import React from 'react';

const NewsletterBanner = () => (
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

export default NewsletterBanner;
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Route, ArrowRight, Users } from 'lucide-react';
import { EndToEndJourney } from '@/components/EndToEndJourney';
import { Badge } from '@/components/ui/badge';

const EndToEndExperience = () => {
  return (
    <>
      <Helmet>
        <title>End-to-End Experience - Atlas Sanctum</title>
        <meta name="description" content="Complete user journey from discovery to impact tracking in the regenerative economy" />
      </Helmet>
      
      <div className="min-h-screen bg-background pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-ocean flex items-center justify-center">
                <Route className="w-8 h-8 text-white" />
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Complete Journey
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
              End-to-End Experience
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              Experience the complete Atlas Sanctum journey from project discovery 
              to real-time impact tracking. Every step designed for maximum impact 
              and seamless user experience.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/30">
                <div className="text-2xl font-bold text-primary">5</div>
                <div className="text-xs text-muted-foreground">Journey Steps</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/30">
                <div className="text-2xl font-bold text-emerald-600">30s</div>
                <div className="text-xs text-muted-foreground">Credit Verification</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/30">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-xs text-muted-foreground">Impact Tracking</div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Journey */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Interactive Journey</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Follow the complete user experience from initial discovery to ongoing impact monitoring
              </p>
            </div>
            
            <EndToEndJourney />
          </div>
        </section>

        {/* Journey Benefits */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Our Experience Matters</h2>
              <p className="text-lg text-muted-foreground">
                Every touchpoint optimized for trust, transparency, and impact
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">User-Centric Design</h3>
                <p className="text-sm text-muted-foreground">
                  Every step designed with user research and feedback, ensuring 
                  intuitive navigation and clear value proposition.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Route className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Seamless Flow</h3>
                <p className="text-sm text-muted-foreground">
                  Frictionless experience from discovery to purchase, with 
                  intelligent defaults and progressive disclosure.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Continuous Value</h3>
                <p className="text-sm text-muted-foreground">
                  Value delivery doesn't stop at purchase - ongoing tracking, 
                  reporting, and engagement maintain long-term relationships.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-ocean/10">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience Atlas Sanctum?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your regenerative impact journey today with our guided experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Start Your Journey
              </button>
              <button className="px-8 py-4 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default EndToEndExperience;
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Building, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CriticalSystems = () => {
  return (
    <>
      <Helmet>
        <title>Critical Systems - Atlas Sanctum</title>
        <meta name="description" content="Civilizational infrastructure powering the regenerative economy" />
      </Helmet>
      
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-ocean to-emerald-500 flex items-center justify-center">
                <Building className="w-8 h-8 text-white" />
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                Civilizational OS
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
              Critical Systems Infrastructure
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              The foundational systems powering regenerative impact at planetary scale.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg">
                System Overview
              </Button>
              <Button variant="outline" size="lg">
                Configuration
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <Shield className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-emerald-600 mb-1">99.97%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <Globe className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-600 mb-1">3,111</div>
              <div className="text-sm text-muted-foreground">Active Nodes</div>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <Zap className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-amber-600 mb-1">847ms</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <Building className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-600 mb-1">2.8PB</div>
              <div className="text-sm text-muted-foreground">Data Processed</div>
            </div>
          </div>

          <div className="text-center bg-gradient-to-r from-primary/10 to-ocean/10 rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Scale Regenerative Impact?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the civilizational operating system powering the regenerative economy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg">
                Enterprise Access
              </Button>
              <Button variant="outline" size="lg">
                System Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CriticalSystems;
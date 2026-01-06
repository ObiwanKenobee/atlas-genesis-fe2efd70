import React from 'react';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, DollarSign, Target, Building } from 'lucide-react';
import { BusinessModelOverview, EconomicEngine, GrowthStrategy } from '@/components/BusinessModel';
import { Badge } from '@/components/ui/badge';

const BusinessModelPage = () => {
  return (
    <>
      <Helmet>
        <title>Business Model - Atlas Sanctum</title>
        <meta name="description" content="Robust business model powering the regenerative economy at trillion-dollar scale" />
      </Helmet>
      
      <div className="min-h-screen bg-background pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                $1.32B ARR
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
              Regenerative Business Model
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              A trillion-dollar economic engine built on verified regenerative impact, 
              sustainable unit economics, and exponential network effects.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/30">
                <div className="text-2xl font-bold text-emerald-600">$2.4T</div>
                <div className="text-xs text-muted-foreground">TAM</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/30">
                <div className="text-2xl font-bold text-blue-600">87%</div>
                <div className="text-xs text-muted-foreground">Gross Margin</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/30">
                <div className="text-2xl font-bold text-purple-600">156%</div>
                <div className="text-xs text-muted-foreground">NRR</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-card/50 border border-border/30">
                <div className="text-2xl font-bold text-amber-600">4.2mo</div>
                <div className="text-xs text-muted-foreground">Payback</div>
              </div>
            </div>
          </div>
        </section>

        {/* Business Model Overview */}
        <section className="py-20">
          <BusinessModelOverview />
        </section>

        {/* Economic Engine */}
        <section>
          <EconomicEngine />
        </section>

        {/* Growth Strategy */}
        <section>
          <GrowthStrategy />
        </section>

        {/* Investment Thesis */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-ocean/10">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">Investment Thesis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="p-6 rounded-xl bg-card/50 border border-border/30">
                <DollarSign className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Massive Market</h3>
                <p className="text-sm text-muted-foreground">
                  $2.4T addressable market with regulatory tailwinds driving adoption
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card/50 border border-border/30">
                <Building className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Defensible Moats</h3>
                <p className="text-sm text-muted-foreground">
                  Proprietary verification, network effects, and regulatory compliance
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card/50 border border-border/30">
                <Target className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Proven Execution</h3>
                <p className="text-sm text-muted-foreground">
                  Strong unit economics with 87% gross margins and 156% net retention
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-500/10 to-green-600/10 rounded-2xl p-8 border border-emerald-500/20">
              <h3 className="text-2xl font-bold mb-4">Ready to Scale Impact?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join the regenerative revolution with proven business model, 
                sustainable economics, and trillion-dollar market opportunity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Partner With Us
                </button>
                <button className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors">
                  Download Deck
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BusinessModelPage;
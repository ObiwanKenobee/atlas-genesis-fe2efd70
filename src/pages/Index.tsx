import React from 'react';
import { Helmet } from 'react-helmet-async';
import SEO from "@/components/SEO";
import { useSEO } from "@/hooks/usePerformanceMonitoring";
import HeroSection from "@/components/HeroSection";
import PlatformLayers from "@/components/PlatformLayers";
import { ImpactMetrics } from "@/components/ImpactMetrics";
import TechnologyStack from "@/components/TechnologyStack";
import CTASection from "@/components/CTASection";
import NewsletterBanner from "@/components/NewsletterBanner";

const Index = () => {
  const seoData = useSEO({
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Atlas Sanctum",
      "description": "Leading platform for regenerative carbon credits and ecosystem restoration",
      "url": "https://atlassanctum.com",
      "logo": "https://atlassanctum.com/logo.png"
    }
  });

  return (
    <>
      <SEO {...seoData} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <main>
          <HeroSection />
          <PlatformLayers />
          <ImpactMetrics />
          <TechnologyStack />
          <CTASection />
        </main>
        <NewsletterBanner />
      </div>
    </>
  );
};

export default Index;
import SEO from "@/components/SEO";
import { useSEO } from "@/hooks/useSEO";
import HeroSection from "@/components/HeroSection";
import PlatformLayers from "@/components/PlatformLayers";
import ImpactMetrics from "@/components/ImpactMetrics";
import TechnologyStack from "@/components/TechnologyStack";
import CTASection from "@/components/CTASection";
import NewsletterBanner from "@/components/NewsletterBanner";

const Index = () => {
  const seoData = useSEO({
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Atlas Genesis",
      "description": "Leading platform for regenerative agriculture, carbon credits, and sustainable farming solutions",
      "url": "https://atlasgenesis.com",
      "logo": "https://atlasgenesis.com/logo.png",
      "sameAs": [
        "https://twitter.com/atlasgenesis",
        "https://linkedin.com/company/atlas-genesis"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-555-123-4567",
        "contactType": "customer service",
        "availableLanguage": "English"
      }
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

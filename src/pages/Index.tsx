import SEO from "@/components/SEO";
import { useSEO } from "@/hooks/useSEO";
import ImprovedNavigation from "@/components/ImprovedNavigation";
import HeroSection from "@/components/HeroSection";
import PlatformLayers from "@/components/PlatformLayers";
import ImpactMetrics from "@/components/ImpactMetrics";
import TechnologyStack from "@/components/TechnologyStack";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import NewsletterBanner from "@/components/NewsletterBanner";
import BackToTop from "@/components/BackToTop";

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
      <div className="min-h-screen bg-background">
        <ImprovedNavigation />
        <main className="pt-24">
          <HeroSection />
          <PlatformLayers />
          <ImpactMetrics />
          <TechnologyStack />
          <CTASection />
        </main>
        <Footer />
        <NewsletterBanner />
        <BackToTop threshold={300} />
      </div>
    </>
  );
};

export default Index;

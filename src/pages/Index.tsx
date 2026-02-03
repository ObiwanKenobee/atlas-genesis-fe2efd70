import SEO from "@/components/SEO";
import { useSEO } from "@/hooks/useSEO";
import EnterpriseHeader from "@/components/EnterpriseHeader";
import HeroSection from "@/components/HeroSection";
import ExploreVerifiedProjects from "@/components/ExploreVerifiedProjects";
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
      "name": "Atlas Sanctum",
      "description": "Leading platform for regenerative agriculture, carbon credits, and sustainable farming solutions",
      "url": "https://atlasgenesis.com",
      "logo": "https://atlasgenesis.com/logo.png",
      "sameAs": [
        "https://twitter.com/atlasgenesis",
        "https://linkedin.com/company/atlas-genesis"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+254-759-895-739",
        "contactType": "customer service",
        "availableLanguage": "English"
      }
    }
  });

  return (
    <>
      <SEO {...seoData} />
      <div className="min-h-screen bg-background">
        <EnterpriseHeader />
        <main className="pt-24">
          <HeroSection />
          <ExploreVerifiedProjects />
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

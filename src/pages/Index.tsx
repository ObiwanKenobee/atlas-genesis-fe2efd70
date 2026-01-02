import EnterpriseHeader from "@/components/EnterpriseHeader";
import HeroSection from "@/components/HeroSection";
import PlatformLayers from "@/components/PlatformLayers";
import ImpactMetrics from "@/components/ImpactMetrics";
import TechnologyStack from "@/components/TechnologyStack";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import NewsletterBanner from "@/components/NewsletterBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <EnterpriseHeader />
      <main className="pt-[104px]">
        <HeroSection />
        <PlatformLayers />
        <ImpactMetrics />
        <TechnologyStack />
        <CTASection />
      </main>
      <Footer />
      <NewsletterBanner />
    </div>
  );
};

export default Index;

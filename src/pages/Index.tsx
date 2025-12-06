import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import PlatformLayers from "@/components/PlatformLayers";
import ImpactMetrics from "@/components/ImpactMetrics";
import TechnologyStack from "@/components/TechnologyStack";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <PlatformLayers />
        <ImpactMetrics />
        <TechnologyStack />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

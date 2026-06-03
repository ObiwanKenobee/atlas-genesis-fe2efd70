import SEO from "@/components/SEO";
import { useSEO } from "@/hooks/useSEO";
import EnterpriseHeader from "@/components/EnterpriseHeader";
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
    title: 'Atlas Sanctum',
    description: 'Atlas Sanctum is the civilization operating system for regenerative impact, uniting regenerative agriculture, climate resilience, health, AI, and carbon markets in one platform.',
    keywords: 'Atlas Sanctum, regenerative platform, climate resilience, carbon credits, regenerative agriculture, ecosystem intelligence, sustainable finance',
    image: '/og-image.jpg',
    url: '/',
    canonical: 'https://atlassanctum.com/',
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Atlas Sanctum",
        "legalName": "Atlas Sanctum",
        "url": "https://atlassanctum.com",
        "logo": "https://atlassanctum.com/logo.png",
        "sameAs": [
          "https://twitter.com/AtlasSanctum",
          "https://www.linkedin.com/company/atlas-sanctum",
          "https://github.com/AtlasSanctum"
        ],
        "foundingDate": "2024-01-01",
        "founders": [
          {
            "@type": "Person",
            "name": "Atlas Sanctum Team"
          }
        ],
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+254-759-895-739",
            "contactType": "customer service",
            "availableLanguage": ["English"]
          }
        ],
        "department": [
          {
            "@type": "Organization",
            "name": "Atlas Sanctum AI",
            "url": "https://atlassanctum.com/ai"
          },
          {
            "@type": "Organization",
            "name": "Atlas Sanctum Health",
            "url": "https://atlassanctum.com/health"
          },
          {
            "@type": "Organization",
            "name": "Atlas Sanctum Commerce",
            "url": "https://atlassanctum.com/marketplace"
          },
          {
            "@type": "Organization",
            "name": "Atlas Sanctum Community",
            "url": "https://atlassanctum.com/community"
          }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://atlassanctum.com",
        "name": "Atlas Sanctum",
        "description": "A civilization operating system for regenerative impact and ethical digital infrastructure.",
        "publisher": {
          "@type": "Organization",
          "name": "Atlas Sanctum",
          "logo": {
            "@type": "ImageObject",
            "url": "https://atlassanctum.com/logo.png"
          }
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Atlas Sanctum",
        "operatingSystem": "Web",
        "applicationCategory": "BusinessApplication",
        "url": "https://atlassanctum.com",
        "description": "Atlas Sanctum is a civilization operating system for regenerative agriculture, carbon markets, health, AI, and sustainable commerce.",
        "provider": {
          "@type": "Organization",
          "name": "Atlas Sanctum"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Atlas Sanctum Navigation",
        "itemListElement": [
          {
            "@type": "SiteNavigationElement",
            "position": 1,
            "name": "About",
            "url": "https://atlassanctum.com/about"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 2,
            "name": "Marketplace",
            "url": "https://atlassanctum.com/marketplace"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 3,
            "name": "Community",
            "url": "https://atlassanctum.com/community"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 4,
            "name": "Health",
            "url": "https://atlassanctum.com/health"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 5,
            "name": "Governance",
            "url": "https://atlassanctum.com/governance"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 6,
            "name": "Regenerative Agriculture",
            "url": "https://atlassanctum.com/regenerative-agriculture"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 7,
            "name": "Bioregions",
            "url": "https://atlassanctum.com/bioregions"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 8,
            "name": "Measurements",
            "url": "https://atlassanctum.com/measurements"
          }
        ]
      }
    ]
  });

  return (
    <>
      <SEO {...seoData} />
      <div className="min-h-screen bg-background">
        <EnterpriseHeader />
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

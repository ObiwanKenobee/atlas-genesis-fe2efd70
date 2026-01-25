// import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ApiStatus from './components/ApiStatus';
import NewsletterBanner from './components/NewsletterBanner';
import Layout from './components/Layout';
import BackToTop from './components/BackToTop';
import BusinessModel from './pages/BusinessModel';
import CriticalInnovations from './pages/CriticalInnovations';
import AzureProductionStrategy from './pages/AzureProductionStrategy';
import EthicalGovernance from './pages/EthicalGovernance';
import RegenerativeValueExchange from './pages/RegenerativeValueExchange';
import DataMetricsEngine from './pages/DataMetricsEngine';
import CulturalKnowledgeImpact from './pages/CulturalKnowledgeImpact';
import GlobalImpactEconomy from './pages/GlobalImpactEconomy';
import EndToEndExperience from './pages/EndToEndExperience';
import EngineeringArchitecture from './pages/EngineeringArchitecture';
import RVXInnovations from './pages/RVXInnovations';
import DashboardWithSidebar from './pages/DashboardWithSidebar';
import SupabaseAuth from './pages/SupabaseAuth';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import ProjectDetail from './pages/ProjectDetail';
import TransactionHistory from './pages/TransactionHistory';
import CarbonCalculator from './pages/CarbonCalculator';
import Status from './pages/Status';
import Demo from './pages/Demo';

const SimplePage = ({ title, description }: { title: string; description: string }) => (
  <Layout>
    <div className="py-8 px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">{title}</h1>
        <p className="text-xl text-slate-400 mb-8">{description}</p>
        <div className="glass p-8 rounded-2xl">
          <p className="text-slate-400">Feature coming soon...</p>
        </div>
      </div>
    </div>
  </Layout>
);

const HeroSection = () => (
  <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 px-4 sm:px-8 lg:px-16 py-32 ">
    <div className="absolute inset-0 overflow-hidden pointer-events-none ">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse "></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse animate-delay-2s "></div>
    </div>
    
    <div className="relative z-10 max-w-7xl px-8 text-center ">
      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass mb-12 text-emerald-400 animate-float">
        <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse "></span>
        <span className="text-lg font-medium ">Regenerative Value Exchange • Powered by AI & Blockchain</span>
      </div>

      <h1 className="text-7xl md:text-9xl font-black leading-tight mb-12">
        <span className="block text-white">Regenerating</span>
        <span className="block text-gradient animate-pulse-glow">Earth's Future</span>
      </h1>

      <p className="text-2xl text-slate-300 max-w-5xl mx-auto mb-16 leading-relaxed">
        The world's first regenerative platform uniting ecosystems across land, oceans, and human health—scaling to trillion-dollar impact with an enduring ethical core.
      </p>

      <div className="flex gap-8 justify-center mb-20 flex-wrap">
        <Link to="/dashboard" className="btn-glow px-12 py-6 rounded-2xl text-white font-bold text-xl hover-lift focus:outline-none focus:ring-2 focus:ring-emerald-500/50" aria-label="Enter the Sanctum dashboard">
          Enter the Sanctum
        </Link>
        <Link to="/marketplace" className="glass px-12 py-6 rounded-2xl text-white font-bold text-xl hover-lift border-2 border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" aria-label="Explore the marketplace">
          Explore Platform
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {[
          { value: "$2.4T", label: "Addressable Market" },
          { value: "150+", label: "Global Partners" },
          { value: "12M", label: "Hectares Protected" },
          { value: "99.9%", label: "Carbon Verified" }
        ].map((stat, index) => (
          <div key={index} className="glass p-8 rounded-2xl hover-lift text-center group animate-float" data-delay={index * 0.5}>
            <div className="text-4xl font-black text-emerald-400 mb-3">{stat.value}</div>
            <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Social Proof Strip */}
      <div className="mt-12 text-center px-4 py-6 bg-slate-800/50 border border-slate-700 rounded-2xl glass max-w-4xl mx-auto">
        <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-[0.2em] mb-4">Trusted by impact leaders</p>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-slate-200/80">
          {["UN Climate Lab", "Global Regen Fund", "WEF Cohort", "IUCN Partners", "EarthBank"].map((org) => (
            <div
              key={org}
              className="px-4 py-2 rounded-xl glass text-sm sm:text-base font-semibold tracking-tight border border-emerald-500/20"
            >
              {org}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const PlatformArchitecture = () => (
  <section className="py-32 bg-slate-800 relative">
    <div className="max-w-7xl mx-auto px-8">
      <div className="text-center mb-20">
        <h2 className="text-6xl font-black mb-6">PLATFORM ARCHITECTURE</h2>
        <h3 className="text-3xl text-emerald-500 mb-8">Five Layers of Regeneration</h3>
        <p className="text-xl text-slate-400 max-w-4xl mx-auto">
          A multi-layered ecosystem designed to preserve humanity and the planet, blending impact finance with ethical technology.
        </p>
      </div>

      <div className="space-y-12 ">
        {[
          {
            number: "01",
            title: "Infinite Purpose & Ethical Governance",
            description: "Decentralized AI-driven decision-making grounded in universal ethics, ensuring transparent governance through DAO participation.",
            stat: "12,450+",
            statLabel: "Governance Participants",
            statDesc: "Active DAO members",
            features: ["Moral AI Protocols", "DAO Governance", "Values Engine", "Ethical Frameworks", "Sacred Land Protection"]
          },
          {
            number: "02", 
            title: "Regenerative Value Exchange",
            description: "Seamless exchange of regenerative assets including carbon credits, ecosystem restoration credits, and cultural preservation funds.",
            stat: "$1.84B",
            statLabel: "Trading Volume",
            statDesc: "Total value exchanged",
            features: ["Blockchain Records", "AI-Powered Oracles", "Living Smart Contracts", "RIU Trading", "Impact Verification"]
          },
          {
            number: "03",
            title: "Data Integration & Metrics Engine", 
            description: "Measure real-world regenerative impact across agriculture, oceanic, healthcare, and circular economy sectors.",
            stat: "15,000+",
            statLabel: "Data Points",
            statDesc: "IoT sensors active",
            features: ["Big Data Analytics", "AI Forecasting", "Ecosystem Mapping", "Satellite Integration", "IoT Sensor Networks"]
          },
          {
            number: "04",
            title: "Cultural & Knowledge Impact",
            description: "Build and share a global knowledge ecosystem through impact stories, collaboration, and ethical AI research.",
            stat: "8,500+", 
            statLabel: "Knowledge Assets",
            statDesc: "Stories & resources",
            features: ["Impact Stories", "Global Hub", "AI Library", "Cultural Preservation", "Knowledge Sharing"]
          },
          {
            number: "05",
            title: "Global Impact Economy",
            description: "Enable financial flows supporting regenerative businesses through impact investing, DeFi, and microfinance.",
            stat: "$4.2B",
            statLabel: "Value Generated", 
            statDesc: "Economic impact",
            features: ["Impact Marketplace", "Sustainable Finance", "Microfinance Platform", "DeFi Integration", "Impact Bonds"]
          }
        ].map((layer, index) => (
          <div key={index} className="grid md:grid-cols-12 gap-12 glass p-12 rounded-3xl hover-lift ">
            <div className="md:col-span-3 text-center">
              <div className="text-8xl font-black text-emerald-500 mb-4">{layer.number}</div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">{layer.stat}</div>
              <div className="text-lg font-semibold text-white mb-1">{layer.statLabel}</div>
              <div className="text-sm text-slate-400">{layer.statDesc}</div>
            </div>
            
            <div className="md:col-span-6">
              <h4 className="text-3xl font-bold mb-6">{layer.title}</h4>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">{layer.description}</p>
            </div>
            
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 gap-4">
                {layer.features.map((feature, i) => (
                  <div key={i} className="bg-emerald-500/10 px-6 py-4 rounded-xl text-center border border-emerald-500/20">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-12 text-xl text-slate-400">
        Each layer interconnects to create a unified regenerative ecosystem
      </div>
    </div>
  </section>
);

const RealTimeImpact = () => (
  <section className="py-32 bg-slate-900 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-8">
      <div className="text-center mb-20">
        <h2 className="text-6xl font-black mb-6">REAL-TIME IMPACT</h2>
        <h3 className="text-3xl text-emerald-500 mb-8">Measuring Regeneration</h3>
        <p className="text-xl text-slate-400 max-w-4xl mx-auto">
          Transparent, verifiable metrics powered by AI oracles and IoT sensors tracking our collective impact across all ecosystems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
        {[
          { value: "12.4M", unit: "Hectares", label: "Land Restored", change: "+23%" },
          { value: "847K", unit: "km²", label: "Ocean Protected", change: "+18%" },
          { value: "2.8M", unit: "Lives", label: "Health Improved", change: "+45%" },
          { value: "94%", unit: "Rate", label: "Circular Economy", change: "+12%" },
          { value: "$4.2B", unit: "USD", label: "Value Generated", change: "+67%" },
          { value: "156", unit: "Nations", label: "Global Reach", change: "+8%" }
        ].map((metric, index) => (
          <div key={index} className="glass p-10 rounded-3xl text-center hover-lift group">
            <div className="text-5xl font-black text-emerald-400 mb-3">{metric.value}</div>
            <div className="text-lg text-slate-400 mb-3">{metric.unit}</div>
            <div className="text-2xl font-bold mb-4">{metric.label}</div>
            <div className="text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full inline-block font-semibold">
              {metric.change} vs last year
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <div className="glass p-8 rounded-2xl inline-flex items-center gap-4 text-xl">
          <span className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-slate-300">Live data from 15,000+ IoT sensors worldwide</span>
        </div>
      </div>
    </div>
  </section>
);

const TechStack = () => (
  <section className="py-32 bg-slate-800 relative">
    <div className="max-w-7xl mx-auto px-8">
      <div className="text-center mb-20">
        <h2 className="text-6xl font-black mb-6">TECHNOLOGY STACK</h2>
        <h3 className="text-3xl text-emerald-500 mb-8">Built for Scale & Trust</h3>
        <p className="text-xl text-slate-400 max-w-4xl mx-auto">
          Enterprise-grade infrastructure combining the latest in blockchain, AI, and cloud technology to power global regeneration.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {[
          {
            title: "Blockchain Layer",
            description: "Ethereum & Polkadot-based infrastructure for immutable records and decentralized applications.",
            features: ["Smart Contracts", "Carbon Tokens", "DeFi"]
          },
          {
            title: "AI & Machine Learning",
            description: "Real-time ecosystem analysis, predictive modeling, and optimization algorithms.",
            features: ["AI Oracles", "Pattern Recognition", "Forecasting"]
          },
          {
            title: "Security & Privacy",
            description: "Zero-Knowledge Proofs ensuring privacy without compromising transparency.",
            features: ["ZKPs", "Encryption", "Secure Compute"]
          },
          {
            title: "Cloud Infrastructure",
            description: "Scalable hosting on AWS, Google Cloud, and Azure with decentralized storage.",
            features: ["Multi-Cloud", "IPFS", "Edge Computing"]
          },
          {
            title: "IoT Integration",
            description: "Global sensor network providing real-time environmental data feeds.",
            features: ["Satellites", "Sensors", "Real-Time Data"]
          },
          {
            title: "API Ecosystem",
            description: "Open-source APIs enabling third-party integrations and ecosystem growth.",
            features: ["REST", "GraphQL", "Webhooks"]
          }
        ].map((tech, index) => (
          <div key={index} className="glass p-8 rounded-2xl hover-lift">
            <h4 className="text-2xl font-bold mb-4 text-emerald-500">{tech.title}</h4>
            <p className="text-slate-400 mb-6">{tech.description}</p>
            <div className="space-y-2">
              {tech.features.map((feature, i) => (
                <div key={i} className="bg-emerald-500/10 px-4 py-2 rounded-lg text-sm border border-emerald-500/20">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-12 rounded-3xl text-center">
        <h4 className="text-3xl font-bold mb-6">Decentralized by Design</h4>
        <p className="text-xl text-slate-400 mb-8 max-w-4xl mx-auto">
          Our architecture ensures no single point of failure, with data distributed across global nodes and verified through consensus mechanisms.
        </p>
        <div className="flex justify-center items-center gap-8 mb-6">
          {['N1', 'N2', 'N3', 'N4'].map((node, i) => (
            <div key={i} className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">
              {node}
            </div>
          ))}
        </div>
        <div className="text-emerald-400 font-semibold">4,000+ global nodes</div>
      </div>
    </div>
  </section>
);

const JoinRevolution = () => (
  <section className="py-32 bg-slate-900 relative">
    <div className="max-w-7xl mx-auto px-8 text-center">
      <h2 className="text-6xl font-black mb-6">JOIN THE REVOLUTION</h2>
      <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto">
        Be part of the regenerative transformation. Every action counts.
      </p>
      <div className="flex justify-center gap-6">
        <Link to="/auth" className="btn-glow px-8 py-4 rounded-xl font-bold text-lg">
          Start Regenerating
        </Link>
        <Link to="/marketplace" className="glass px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-700/50">
          Explore Platform
        </Link>
      </div>
    </div>
  </section>
);

const EnhancedFooter = () => (
  <footer className="bg-slate-900 text-white py-16">
    <div className="max-w-7xl mx-auto px-8">
      <div className="grid md:grid-cols-5 gap-12 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
              🌱
            </div>
            <div>
              <div className="text-xl font-bold">Atlas Sanctum</div>
              <div className="text-xs text-slate-400">REGENERATIVE PLATFORM</div>
            </div>
          </div>
          <p className="text-slate-400 mb-6">
            The world's first regenerative platform uniting ecosystems for trillion-dollar impact.
          </p>
          <div className="space-y-2 text-sm text-slate-400">
            <div>hello@atlassanctum.com</div>
            <div>+1 (234) 567-890</div>
            <div>San Francisco, CA</div>
            <div>United States</div>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-4">FEATURES</h4>
          <div className="space-y-2 text-sm text-slate-400">
            <Link to="/measurements" className="block hover:text-emerald-400">Measurements</Link>
            <Link to="/bioregions" className="block hover:text-emerald-400">Bioregions</Link>
            <Link to="/regenerative-agriculture" className="block hover:text-emerald-400">Regeneration</Link>
            <Link to="/valuation" className="block hover:text-emerald-400">Valuation</Link>
            <Link to="/governance" className="block hover:text-emerald-400">Governance</Link>
          </div>
          <div className="mt-6">
            <h5 className="font-semibold mb-3">📱 Download Apps</h5>
            <div className="space-y-2 text-xs">
              <div className="glass px-3 py-2 rounded">📱 App Store</div>
              <div className="glass px-3 py-2 rounded">📦 APK</div>
              <div className="glass px-3 py-2 rounded">🤖 Google Play</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-4">MORE FEATURES</h4>
          <div className="space-y-2 text-sm text-slate-400">
            <Link to="/health" className="block hover:text-emerald-400">Health</Link>
            <Link to="/adoption" className="block hover:text-emerald-400">Adoption</Link>
            <Link to="/business-model" className="block hover:text-emerald-400">Business Model</Link>
            <Link to="/innovations" className="block hover:text-emerald-400">Innovations</Link>
          </div>
          <div className="mt-6">
            <h5 className="font-bold mb-4">PLATFORM</h5>
            <div className="space-y-2 text-sm text-slate-400">
              <Link to="/marketplace" className="block hover:text-emerald-400">Marketplace</Link>
              <Link to="/dashboard" className="block hover:text-emerald-400">Dashboard</Link>
              <Link to="/engineering-architecture" className="block hover:text-emerald-400">Engineering</Link>
              <Link to="/rvx-innovations" className="block hover:text-emerald-400">RVX Innovations</Link>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-4">RESOURCES</h4>
          <div className="space-y-2 text-sm text-slate-400">
            <Link to="/azure-strategy" className="block hover:text-emerald-400">Azure Strategy</Link>
            <Link to="/end-to-end-experience" className="block hover:text-emerald-400">User Experience</Link>
            <div>API Documentation</div>
            <div>Impact Guides</div>
          </div>
          <div className="mt-6">
            <h5 className="font-bold mb-4">SUPPORT</h5>
            <div className="space-y-2 text-sm text-slate-400">
              <div>Help Center</div>
              <div>Contact Support</div>
              <div>Documentation</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div>
          <h5 className="font-bold mb-4">LEGAL</h5>
          <div className="space-y-2 text-sm text-slate-400">
            <div>Privacy Policy</div>
            <div>Terms of Service</div>
            <div>Cookie Policy</div>
            <div>Accessibility Statement</div>
          </div>
        </div>
        <div>
          <h5 className="font-bold mb-4">COMPANY</h5>
          <div className="space-y-2 text-sm text-slate-400">
            <div>About Atlas</div>
            <div>Join Our Team</div>
            <div>Media Kit</div>
            <div>Get in Touch</div>
          </div>
        </div>
        <div className="text-right">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-end gap-2">
              <ApiStatus showLabel />
            </div>
            <Link to="/status" className="text-emerald-400 hover:text-emerald-300 block">Status Page</Link>
            <div className="text-slate-400">Global Network</div>
            <div className="text-slate-400">Enterprise Security</div>
          </div>
        </div>
      </div>  

      <div className="border-t border-slate-700 pt-8 flex justify-between items-center">
        <div className="text-sm text-slate-400">
          © 2025 Atlas Sanctum. All rights reserved.<br />
          Regenerating Earth's future through verified, ethical impact.
        </div>
        <div className="text-center">
          <div className="text-lg font-bold mb-2">Ready to join the regeneration?</div>
          <Link to="/marketplace" className="btn-glow px-6 py-3 rounded-lg font-semibold">
            Explore Platform
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="glass p-6 rounded-xl inline-block">
          <div className="text-lg font-bold mb-2">STAY UPDATED</div>
          <div className="text-slate-400">Get weekly insights on regenerative impact</div>
        </div>
      </div>
    </div>
  </footer>
);

const Index = () => (
  <div className="font-display bg-slate-900 text-white">
    <Layout showFooter={false}>
      <HeroSection />
      <PlatformArchitecture />
      <RealTimeImpact />
      <TechStack />
      <JoinRevolution />
    </Layout>
    <EnhancedFooter />
    <NewsletterBanner />
  </div>
);

const Dashboard = () => (
  <Layout>
    <div className="py-8 px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">🌱 Regenerative Dashboard</h1>
        <p className="text-xl text-slate-400 mb-8">Track your impact, manage investments, and scale regeneration.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-2xl hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">🎯</div>
              <h3 className="text-2xl font-bold text-emerald-500">Your Impact</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Carbon Offset</span>
                <span className="text-emerald-500 font-bold">2.4 tons CO₂</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Land Restored</span>
                <span className="text-emerald-500 font-bold">0.8 hectares</span>
              </div>
            </div>
          </div>
          
          <div className="glass p-8 rounded-2xl hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">📊</div>
              <h3 className="text-2xl font-bold text-blue-500">Portfolio</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">RIU Balance</span>
                <span className="text-blue-500 font-bold">1,247 RIU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Portfolio Value</span>
                <span className="text-blue-500 font-bold">$87,290</span>
              </div>
            </div>
          </div>
          
          <div className="glass p-8 rounded-2xl hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">🌱</div>
              <h3 className="text-2xl font-bold text-purple-500">Projects</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Projects</span>
                <span className="text-purple-500 font-bold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Investment</span>
                <span className="text-purple-500 font-bold">$24,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

// Auth is now imported from SupabaseAuth page

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const pageTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const,
};

// Animated Route wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DashboardWithSidebar />} />
          <Route path="/auth" element={<SupabaseAuth />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ProjectDetail />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/calculator" element={<CarbonCalculator />} />
          <Route path="/status" element={<Status />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/measurements" element={<SimplePage title="Planetary Measurement & Verification" description="Real-time satellite data integration with multi-metric tracking and 95% confidence intervals." />} />
          <Route path="/bioregions" element={<SimplePage title="Geographic Intelligence & Bioregional Mapping" description="PostGIS-powered bioregional visualization with climate risk forecasting." />} />
          <Route path="/regenerative-agriculture" element={<SimplePage title="Regenerative Agriculture & Ecosystem Recovery" description="Comprehensive ecosystem health monitoring with farmer income projections." />} />
          <Route path="/valuation" element={<SimplePage title="Mathematical Trust & Credit Valuation Engine" description="Multi-variable impact scoring with dynamic pricing model." />} />
          <Route path="/governance" element={<SimplePage title="Ethical, Cultural & Spiritual Governance" description="Bioregional Ethics Councils with 67% indigenous representation." />} />
          <Route path="/health" element={<SimplePage title="Human Health Integration" description="Air quality credits and healthcare savings projections." />} />
          <Route path="/adoption" element={<SimplePage title="Adoption Pathway for Global Change" description="Six actor entry points with The Flywheel Effect economic model." />} />
          <Route path="/business-model" element={<BusinessModel />} />
          <Route path="/innovations" element={<CriticalInnovations />} />
          <Route path="/azure-strategy" element={<AzureProductionStrategy />} />
          <Route path="/ethical-governance" element={<EthicalGovernance />} />
          <Route path="/regenerative-value-exchange" element={<RegenerativeValueExchange />} />
          <Route path="/data-metrics-engine" element={<DataMetricsEngine />} />
          <Route path="/cultural-knowledge-impact" element={<CulturalKnowledgeImpact />} />
          <Route path="/global-impact-economy" element={<GlobalImpactEconomy />} />
          <Route path="/end-to-end-experience" element={<EndToEndExperience />} />
          <Route path="/engineering-architecture" element={<EngineeringArchitecture />} />
          <Route path="/rvx-innovations" element={<RVXInnovations />} />
          <Route path="*" element={<Index />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
        <BrowserRouter>
    <AnimatedRoutes />
    <BackToTop threshold={400} />
        </BrowserRouter>
);

export default App;
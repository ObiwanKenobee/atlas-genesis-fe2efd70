import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';

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
  <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900">
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
    </div>
    
    <div className="relative z-10 max-w-7xl px-8 text-center">
      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass mb-12 text-emerald-400 animate-float">
        <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
        <span className="text-lg font-medium">Regenerative Value Exchange • Powered by AI & Blockchain</span>
      </div>

      <h1 className="text-7xl md:text-9xl font-black leading-tight mb-12">
        <span className="block text-white">Regenerating</span>
        <span className="block text-gradient animate-pulse-glow">Earth's Future</span>
      </h1>

      <p className="text-2xl text-slate-300 max-w-5xl mx-auto mb-16 leading-relaxed">
        The world's first <span className="text-emerald-400 font-semibold">regenerative platform</span> uniting ecosystems across land, oceans, and human health—scaling to <span className="text-blue-400 font-semibold">trillion-dollar impact</span> with an enduring ethical core.
      </p>

      <div className="flex gap-8 justify-center mb-20 flex-wrap">
        <Link to="/dashboard" className="btn-glow px-12 py-6 rounded-2xl text-white font-bold text-xl hover-lift">
          🚀 Enter the Sanctum
        </Link>
        <Link to="/marketplace" className="glass px-12 py-6 rounded-2xl text-white font-bold text-xl hover-lift border-2 border-emerald-500/30">
          🌱 Explore Platform
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {[
          { value: "$2.4T", label: "Addressable Market", icon: "🌍" },
          { value: "150+", label: "Global Partners", icon: "🤝" },
          { value: "12M", label: "Hectares Protected", icon: "🌱" },
          { value: "99.9%", label: "Carbon Verified", icon: "✅" }
        ].map((stat, index) => (
          <div key={index} className="glass p-8 rounded-2xl hover-lift text-center group animate-float" style={{animationDelay: `${index * 0.5}s`}}>
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
            <div className="text-4xl font-black text-emerald-400 mb-3">{stat.value}</div>
            <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
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

      <div className="space-y-12">
        {[
          {
            number: "01",
            title: "Infinite Purpose & Ethical Governance",
            description: "Decentralized AI-driven decision-making grounded in universal ethics, ensuring transparent governance through DAO participation.",
            stat: "12,450+",
            statLabel: "Governance Participants",
            features: ["Moral AI Protocols", "DAO Governance", "Values Engine", "Ethical Frameworks", "Sacred Land Protection"]
          },
          {
            number: "02", 
            title: "Regenerative Value Exchange",
            description: "Seamless exchange of regenerative assets including carbon credits, ecosystem restoration credits, and cultural preservation funds.",
            stat: "$1.84B",
            statLabel: "Trading Volume",
            features: ["Blockchain Records", "AI-Powered Oracles", "Living Smart Contracts", "RIU Trading", "Impact Verification"]
          },
          {
            number: "03",
            title: "Data Integration & Metrics Engine", 
            description: "Measure real-world regenerative impact across agriculture, oceanic, healthcare, and circular economy sectors.",
            stat: "15,000+",
            statLabel: "Data Points",
            features: ["Big Data Analytics", "AI Forecasting", "Ecosystem Mapping", "Satellite Integration", "IoT Sensor Networks"]
          },
          {
            number: "04",
            title: "Cultural & Knowledge Impact",
            description: "Build and share a global knowledge ecosystem through impact stories, collaboration, and ethical AI research.",
            stat: "8,500+", 
            statLabel: "Knowledge Assets",
            features: ["Impact Stories", "Global Hub", "AI Library", "Cultural Preservation", "Knowledge Sharing"]
          },
          {
            number: "05",
            title: "Global Impact Economy",
            description: "Enable financial flows supporting regenerative businesses through impact investing, DeFi, and microfinance.",
            stat: "$4.2B",
            statLabel: "Value Generated", 
            features: ["Impact Marketplace", "Sustainable Finance", "Microfinance Platform", "DeFi Integration", "Impact Bonds"]
          }
        ].map((layer, index) => (
          <div key={index} className="grid md:grid-cols-12 gap-12 glass p-12 rounded-3xl hover-lift">
            <div className="md:col-span-3 text-center">
              <div className="text-8xl font-black text-emerald-500 mb-4">{layer.number}</div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">{layer.stat}</div>
              <div className="text-lg font-semibold text-white mb-1">{layer.statLabel}</div>
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
          { value: "12.4M", unit: "Hectares", label: "Land Restored", change: "+23%", icon: "🌱" },
          { value: "847K", unit: "km²", label: "Ocean Protected", change: "+18%", icon: "🌊" },
          { value: "2.8M", unit: "Lives", label: "Health Improved", change: "+45%", icon: "❤️" },
          { value: "94%", unit: "Rate", label: "Circular Economy", change: "+12%", icon: "♻️" },
          { value: "$4.2B", unit: "USD", label: "Value Generated", change: "+67%", icon: "💰" },
          { value: "156", unit: "Nations", label: "Global Reach", change: "+8%", icon: "🌍" }
        ].map((metric, index) => (
          <div key={index} className="glass p-10 rounded-3xl text-center hover-lift group">
            <div className="text-5xl mb-6 group-hover:animate-bounce">{metric.icon}</div>
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

const Index = () => (
  <Layout>
    <HeroSection />
    <PlatformArchitecture />
    <RealTimeImpact />
  </Layout>
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

const Auth = () => (
  <Layout showFooter={false}>
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌱</div>
          <h1 className="text-4xl font-bold mb-4">Welcome to Atlas Sanctum</h1>
          <p className="text-slate-400">Join the regenerative revolution</p>
        </div>
        
        <div className="glass p-8 rounded-2xl">
          <div className="space-y-6">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button className="w-full btn-glow py-3 rounded-lg text-white font-semibold text-lg">
              🚀 Start Regenerating
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/measurements" element={<SimplePage title="Planetary Measurement & Verification" description="Real-time satellite data integration with multi-metric tracking and 95% confidence intervals." />} />
      <Route path="/bioregions" element={<SimplePage title="Geographic Intelligence & Bioregional Mapping" description="PostGIS-powered bioregional visualization with climate risk forecasting." />} />
      <Route path="/regenerative-agriculture" element={<SimplePage title="Regenerative Agriculture & Ecosystem Recovery" description="Comprehensive ecosystem health monitoring with farmer income projections." />} />
      <Route path="/valuation" element={<SimplePage title="Mathematical Trust & Credit Valuation Engine" description="Multi-variable impact scoring with dynamic pricing model." />} />
      <Route path="/governance" element={<SimplePage title="Ethical, Cultural & Spiritual Governance" description="Bioregional Ethics Councils with 67% indigenous representation." />} />
      <Route path="/marketplace" element={<SimplePage title="Marketplace & Financial Infrastructure" description="RIU trading platform with 24.5M RIUs in circulation." />} />
      <Route path="/health" element={<SimplePage title="Human Health Integration" description="Air quality credits and healthcare savings projections." />} />
      <Route path="/adoption" element={<SimplePage title="Adoption Pathway for Global Change" description="Six actor entry points with The Flywheel Effect economic model." />} />
      <Route path="*" element={<Index />} />
    </Routes>
  </BrowserRouter>
);

export default App;
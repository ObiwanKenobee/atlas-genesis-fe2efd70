import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Measurements, Bioregions, RegenerativeAgriculture, Valuation, Governance, Marketplace, Health, Adoption } from './pages';

const HeroSection = () => (
  <section className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-hero text-center relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
    <div className="relative z-10 max-w-6xl px-8">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-slate-400 animate-float">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
        Regenerative Value Exchange • Powered by AI & Blockchain
      </div>

      <h1 className="text-6xl md:text-8xl font-bold leading-tight mb-8">
        <span className="block">Regenerating</span>
        <span className="block text-gradient animate-pulse-glow">Earth's Future</span>
      </h1>

      <p className="text-xl text-slate-400 max-w-4xl mx-auto mb-12 leading-relaxed">
        The world's first regenerative platform uniting ecosystems across land, oceans, and human health—scaling to trillion-dollar impact with an enduring ethical core.
      </p>

      <div className="flex gap-6 justify-center mb-16 flex-wrap">
        <button className="btn-glow px-8 py-4 rounded-lg text-white font-semibold text-lg hover-lift">
          Enter the Sanctum
        </button>
        <button className="glass px-8 py-4 rounded-lg text-white font-semibold text-lg hover-lift border border-slate-600">
          Explore Platform
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {[
          { value: "$2.4T", label: "Addressable Market", icon: "🌍" },
          { value: "150+", label: "Global Partners", icon: "🤝" },
          { value: "12M", label: "Hectares Protected", icon: "🌱" },
          { value: "99.9%", label: "Carbon Verified", icon: "✅" }
        ].map((stat, index) => (
          <div key={index} className="glass p-6 rounded-xl hover-lift text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-emerald-500 mb-2">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
    
    <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl animate-float"></div>
    <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-xl animate-float-delayed"></div>
  </section>
);

const PlatformArchitecture = () => (
  <section className="py-20 bg-slate-800 relative">
    <div className="max-w-7xl mx-auto px-8">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold mb-4">PLATFORM ARCHITECTURE</h2>
        <h3 className="text-2xl text-emerald-500 mb-6">Five Layers of Regeneration</h3>
        <p className="text-xl text-slate-400 max-w-4xl mx-auto">
          A multi-layered ecosystem designed to preserve humanity and the planet, blending impact finance with ethical technology.
        </p>
      </div>

      <div className="space-y-8">
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
          <div key={index} className="grid md:grid-cols-12 gap-8 glass p-8 rounded-2xl hover-lift">
            <div className="md:col-span-2 text-center">
              <div className="text-6xl font-bold text-emerald-500 mb-4">{layer.number}</div>
              <div className="text-3xl font-bold text-emerald-500 mb-2">{layer.stat}</div>
              <div className="text-sm text-slate-400">{layer.statLabel}</div>
            </div>
            
            <div className="md:col-span-6">
              <h4 className="text-2xl font-bold mb-4">{layer.title}</h4>
              <p className="text-slate-400 mb-6 leading-relaxed">{layer.description}</p>
            </div>
            
            <div className="md:col-span-4">
              <div className="grid grid-cols-1 gap-3">
                {layer.features.map((feature, i) => (
                  <div key={i} className="bg-emerald-500/10 px-4 py-2 rounded-lg text-sm text-center border border-emerald-500/20">
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
  <section className="py-20 bg-slate-900 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-8">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold mb-4">REAL-TIME IMPACT</h2>
        <h3 className="text-2xl text-emerald-500 mb-6">Measuring Regeneration</h3>
        <p className="text-xl text-slate-400 max-w-4xl mx-auto">
          Transparent, verifiable metrics powered by AI oracles and IoT sensors tracking our collective impact across all ecosystems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {[
          { value: "12.4M", unit: "Hectares", label: "Land Restored", change: "+23%", icon: "🌱" },
          { value: "847K", unit: "km²", label: "Ocean Protected", change: "+18%", icon: "🌊" },
          { value: "2.8M", unit: "Lives", label: "Health Improved", change: "+45%", icon: "❤️" },
          { value: "94%", unit: "Rate", label: "Circular Economy", change: "+12%", icon: "♻️" },
          { value: "$4.2B", unit: "USD", label: "Value Generated", change: "+67%", icon: "💰" },
          { value: "156", unit: "Nations", label: "Global Reach", change: "+8%", icon: "🌍" }
        ].map((metric, index) => (
          <div key={index} className="glass p-8 rounded-2xl text-center hover-lift group">
            <div className="text-4xl mb-4 group-hover:animate-bounce">{metric.icon}</div>
            <div className="text-4xl font-bold text-emerald-500 mb-2">{metric.value}</div>
            <div className="text-lg text-slate-400 mb-2">{metric.unit}</div>
            <div className="text-xl font-medium mb-3">{metric.label}</div>
            <div className="text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full inline-block">
              {metric.change} vs last year
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center text-lg text-slate-400 glass p-6 rounded-xl">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
          Live data from 15,000+ IoT sensors worldwide
        </span>
      </div>
    </div>
    
    <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
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
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Dashboard</h1>
          <p className="text-xl text-slate-400 mb-8">Welcome to your Atlas Sanctum dashboard.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-2xl hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">🎯</div>
              <h3 className="text-2xl font-bold text-emerald-500">Your Impact</h3>
            </div>
            <p className="text-slate-400 mb-6">Track your regenerative contributions and verified impact metrics.</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Carbon Offset</span>
                <span className="text-emerald-500 font-semibold">2.4 tons CO₂</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Land Restored</span>
                <span className="text-emerald-500 font-semibold">0.8 hectares</span>
              </div>
            </div>
          </div>
          
          <div className="glass p-8 rounded-2xl hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">📊</div>
              <h3 className="text-2xl font-bold text-blue-500">Portfolio</h3>
            </div>
            <p className="text-slate-400 mb-6">Manage your RIU holdings and investment performance.</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">RIU Balance</span>
                <span className="text-blue-500 font-semibold">1,247 RIU</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Portfolio Value</span>
                <span className="text-blue-500 font-semibold">$87,290</span>
              </div>
            </div>
          </div>
          
          <div className="glass p-8 rounded-2xl hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">🌱</div>
              <h3 className="text-2xl font-bold text-purple-500">Projects</h3>
            </div>
            <p className="text-slate-400 mb-6">Explore and invest in verified regenerative projects worldwide.</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Active Projects</span>
                <span className="text-purple-500 font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Total Investment</span>
                <span className="text-purple-500 font-semibold">$24,500</span>
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
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your Atlas Sanctum account</p>
        </div>
        
        <div className="glass p-8 rounded-2xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <button className="w-full btn-glow py-3 rounded-lg text-white font-semibold text-lg">
              Sign In
            </button>
            
            <div className="text-center">
              <a href="#" className="text-emerald-500 hover:text-emerald-400 text-sm">Forgot your password?</a>
            </div>
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
      <Route path="/measurements" element={<Measurements />} />
      <Route path="/bioregions" element={<Bioregions />} />
      <Route path="/regenerative-agriculture" element={<RegenerativeAgriculture />} />
      <Route path="/valuation" element={<Valuation />} />
      <Route path="/governance" element={<Governance />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/health" element={<Health />} />
      <Route path="/adoption" element={<Adoption />} />
      <Route path="*" element={<Index />} />
    </Routes>
  </BrowserRouter>
);

export default App;
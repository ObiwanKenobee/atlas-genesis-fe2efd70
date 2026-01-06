import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import { Measurements, Bioregions, RegenerativeAgriculture, Valuation, Governance, Marketplace, Health, Adoption } from './pages';

const HeroSection = () => (
  <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900">
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
    </div>
    
    <div className="relative z-10 max-w-7xl px-8 text-center">
      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass mb-12 text-emerald-400 animate-float">
        <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
        <span className="text-lg font-medium">🌍 Regenerative Value Exchange • Powered by AI & Blockchain</span>
      </div>

      <h1 className="text-7xl md:text-9xl font-black leading-tight mb-12">
        <span className="block text-white">Regenerating</span>
        <span className="block text-gradient animate-pulse-glow">Earth's Future</span>
      </h1>

      <p className="text-2xl text-slate-300 max-w-5xl mx-auto mb-16 leading-relaxed font-light">
        The world's first <span className="text-emerald-400 font-semibold">regenerative platform</span> uniting ecosystems across land, oceans, and human health—scaling to <span className="text-blue-400 font-semibold">trillion-dollar impact</span> with an enduring ethical core.
      </p>

      <div className="flex gap-8 justify-center mb-20 flex-wrap">
        <Link to="/dashboard" className="btn-glow px-12 py-6 rounded-2xl text-white font-bold text-xl hover-lift shadow-2xl">
          🚀 Enter the Sanctum
        </Link>
        <Link to="/marketplace" className="glass px-12 py-6 rounded-2xl text-white font-bold text-xl hover-lift border-2 border-emerald-500/30">
          🌱 Explore Platform
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {[
          { value: "$2.4T", label: "Addressable Market", icon: "🌍", color: "emerald" },
          { value: "150+", label: "Global Partners", icon: "🤝", color: "blue" },
          { value: "12M", label: "Hectares Protected", icon: "🌱", color: "green" },
          { value: "99.9%", label: "Carbon Verified", icon: "✅", color: "teal" }
        ].map((stat, index) => (
          <div key={index} className="glass p-8 rounded-2xl hover-lift text-center group animate-float" style={{animationDelay: `${index * 0.5}s`}}>
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
            <div className="text-4xl font-black text-emerald-400 mb-3">{stat.value}</div>
            <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const UserJourney = () => (
  <section className="py-32 bg-slate-800 relative">
    <div className="max-w-7xl mx-auto px-8">
      <div className="text-center mb-20">
        <h2 className="text-6xl font-black mb-6">YOUR REGENERATIVE JOURNEY</h2>
        <h3 className="text-3xl text-emerald-500 mb-8">From Discovery to Global Impact</h3>
        <p className="text-xl text-slate-400 max-w-4xl mx-auto">
          Experience the complete end-to-end journey from learning about regenerative impact to becoming a verified contributor to Earth's restoration.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8 mb-16">
        {[
          {
            step: "01",
            title: "Discover",
            description: "Explore regenerative projects worldwide",
            icon: "🔍",
            action: "Browse Projects",
            link: "/marketplace"
          },
          {
            step: "02", 
            title: "Learn",
            description: "Understand impact metrics and verification",
            icon: "📚",
            action: "View Metrics",
            link: "/measurements"
          },
          {
            step: "03",
            title: "Invest",
            description: "Purchase verified RIUs and impact bonds",
            icon: "💰",
            action: "Start Trading",
            link: "/valuation"
          },
          {
            step: "04",
            title: "Track",
            description: "Monitor real-time impact and returns",
            icon: "📊",
            action: "View Dashboard",
            link: "/dashboard"
          },
          {
            step: "05",
            title: "Scale",
            description: "Join governance and expand globally",
            icon: "🌍",
            action: "Join DAO",
            link: "/governance"
          }
        ].map((step, index) => (
          <div key={index} className="text-center group">
            <div className="glass p-8 rounded-2xl hover-lift mb-6 relative">
              <div className="text-6xl mb-4 group-hover:animate-bounce">{step.icon}</div>
              <div className="text-2xl font-bold text-emerald-500 mb-2">{step.step}</div>
              <h4 className="text-xl font-bold mb-3">{step.title}</h4>
              <p className="text-slate-400 mb-6">{step.description}</p>
              <Link to={step.link} className="btn-glow px-6 py-3 rounded-lg text-sm font-semibold">
                {step.action}
              </Link>
            </div>
            {index < 4 && (
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-0.5 bg-emerald-500/50"></div>
                <div className="w-0 h-0 border-l-4 border-l-emerald-500/50 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-8"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PlatformShowcase = () => (
  <section className="py-32 bg-slate-900 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-8">
      <div className="text-center mb-20">
        <h2 className="text-6xl font-black mb-6">PLATFORM ARCHITECTURE</h2>
        <h3 className="text-3xl text-emerald-500 mb-8">Five Layers of Regeneration</h3>
      </div>

      <div className="space-y-12">
        {[
          {
            number: "01",
            title: "Infinite Purpose & Ethical Governance",
            description: "Decentralized AI-driven decision-making grounded in universal ethics",
            stat: "12,450+",
            statLabel: "Governance Participants",
            features: ["Moral AI Protocols", "DAO Governance", "Values Engine", "Sacred Land Protection"],
            icon: "⚖️",
            color: "emerald"
          },
          {
            number: "02", 
            title: "Regenerative Value Exchange",
            description: "Seamless exchange of regenerative assets and carbon credits",
            stat: "$1.84B",
            statLabel: "Trading Volume",
            features: ["Blockchain Records", "AI Oracles", "Smart Contracts", "RIU Trading"],
            icon: "🔄",
            color: "blue"
          },
          {
            number: "03",
            title: "Data Integration & Metrics Engine", 
            description: "Real-world regenerative impact measurement across all ecosystems",
            stat: "15,000+",
            statLabel: "Data Points",
            features: ["Big Data Analytics", "AI Forecasting", "Satellite Integration", "IoT Networks"],
            icon: "📡",
            color: "purple"
          },
          {
            number: "04",
            title: "Cultural & Knowledge Impact",
            description: "Global knowledge ecosystem through impact stories and collaboration",
            stat: "8,500+", 
            statLabel: "Knowledge Assets",
            features: ["Impact Stories", "Global Hub", "AI Library", "Cultural Preservation"],
            icon: "🧠",
            color: "amber"
          },
          {
            number: "05",
            title: "Global Impact Economy",
            description: "Financial flows supporting regenerative businesses worldwide",
            stat: "$4.2B",
            statLabel: "Value Generated", 
            features: ["Impact Marketplace", "Sustainable Finance", "DeFi Integration", "Impact Bonds"],
            icon: "🌐",
            color: "rose"
          }
        ].map((layer, index) => (
          <div key={index} className="grid md:grid-cols-12 gap-12 glass p-12 rounded-3xl hover-lift group">
            <div className="md:col-span-3 text-center">
              <div className="text-8xl mb-6 group-hover:animate-bounce">{layer.icon}</div>
              <div className="text-8xl font-black text-emerald-500 mb-4">{layer.number}</div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">{layer.stat}</div>
              <div className="text-slate-400 uppercase tracking-wider">{layer.statLabel}</div>
            </div>
            
            <div className="md:col-span-6">
              <h4 className="text-3xl font-bold mb-6">{layer.title}</h4>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">{layer.description}</p>
            </div>
            
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 gap-4">
                {layer.features.map((feature, i) => (
                  <div key={i} className="bg-emerald-500/10 px-6 py-4 rounded-xl text-center border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
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

const LiveImpact = () => (
  <section className="py-32 bg-gradient-to-br from-slate-900 via-emerald-900/10 to-slate-900 relative">
    <div className="max-w-7xl mx-auto px-8">
      <div className="text-center mb-20">
        <h2 className="text-6xl font-black mb-6">LIVE GLOBAL IMPACT</h2>
        <h3 className="text-3xl text-emerald-500 mb-8">Real-Time Regeneration Metrics</h3>
        <p className="text-xl text-slate-400 max-w-4xl mx-auto">
          Transparent, verifiable metrics powered by AI oracles and 15,000+ IoT sensors tracking our collective impact across all ecosystems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
        {[
          { value: "12.4M", unit: "Hectares", label: "Land Restored", change: "+23%", icon: "🌱", trend: "↗️" },
          { value: "847K", unit: "km²", label: "Ocean Protected", change: "+18%", icon: "🌊", trend: "↗️" },
          { value: "2.8M", unit: "Lives", label: "Health Improved", change: "+45%", icon: "❤️", trend: "↗️" },
          { value: "94%", unit: "Rate", label: "Circular Economy", change: "+12%", icon: "♻️", trend: "↗️" },
          { value: "$4.2B", unit: "USD", label: "Value Generated", change: "+67%", icon: "💰", trend: "↗️" },
          { value: "156", unit: "Nations", label: "Global Reach", change: "+8%", icon: "🌍", trend: "↗️" }
        ].map((metric, index) => (
          <div key={index} className="glass p-10 rounded-3xl text-center hover-lift group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex justify-center items-center gap-2 mb-6">
                <span className="text-5xl group-hover:animate-bounce">{metric.icon}</span>
                <span className="text-2xl">{metric.trend}</span>
              </div>
              <div className="text-5xl font-black text-emerald-400 mb-3">{metric.value}</div>
              <div className="text-lg text-slate-400 mb-3">{metric.unit}</div>
              <div className="text-2xl font-bold mb-4">{metric.label}</div>
              <div className="text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full inline-block font-semibold">
                {metric.change} vs last year
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <div className="glass p-8 rounded-2xl inline-flex items-center gap-4 text-xl">
          <span className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-slate-300">Live data from 15,000+ IoT sensors worldwide</span>
          <span className="text-emerald-400 font-semibold">Updated every 30 seconds</span>
        </div>
      </div>
    </div>
  </section>
);

const CallToAction = () => (
  <section className="py-32 bg-gradient-to-r from-emerald-900 via-slate-900 to-blue-900 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10"></div>
    </div>
    
    <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
      <h2 className="text-7xl font-black mb-8">
        <span className="text-white">Ready to</span>
        <br />
        <span className="text-gradient">Regenerate Earth?</span>
      </h2>
      
      <p className="text-2xl text-slate-300 mb-16 leading-relaxed">
        Join thousands of regenerative pioneers creating verified, measurable impact across land, oceans, and communities worldwide.
      </p>
      
      <div className="flex gap-8 justify-center flex-wrap mb-16">
        <Link to="/auth" className="btn-glow px-16 py-8 rounded-2xl text-white font-bold text-2xl hover-lift shadow-2xl">
          🌱 Start Your Journey
        </Link>
        <Link to="/marketplace" className="glass px-16 py-8 rounded-2xl text-white font-bold text-2xl hover-lift border-2 border-emerald-500/50">
          🔍 Explore Projects
        </Link>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div className="glass p-8 rounded-2xl">
          <div className="text-4xl mb-4">⚡</div>
          <div className="text-xl font-bold mb-2">Instant Impact</div>
          <div className="text-slate-400">Start contributing to regeneration in minutes</div>
        </div>
        <div className="glass p-8 rounded-2xl">
          <div className="text-4xl mb-4">🔒</div>
          <div className="text-xl font-bold mb-2">100% Verified</div>
          <div className="text-slate-400">All projects verified by AI oracles and IoT sensors</div>
        </div>
        <div className="glass p-8 rounded-2xl">
          <div className="text-4xl mb-4">🌍</div>
          <div className="text-xl font-bold mb-2">Global Scale</div>
          <div className="text-slate-400">Impact across 156 nations and growing</div>
        </div>
      </div>
    </div>
  </section>
);

const Index = () => (
  <Layout>
    <HeroSection />
    <UserJourney />
    <PlatformShowcase />
    <LiveImpact />
    <CallToAction />
  </Layout>
);

const Dashboard = () => (
  <Layout>
    <div className="py-8 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">🌱 Regenerative Dashboard</h1>
          <p className="text-xl text-slate-400 mb-8">Track your impact, manage investments, and scale regeneration.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="glass p-8 rounded-2xl hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">🎯</div>
              <h3 className="text-2xl font-bold text-emerald-500">Your Impact</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Carbon Offset</span>
                <span className="text-emerald-500 font-bold text-xl">2.4 tons CO₂</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Land Restored</span>
                <span className="text-emerald-500 font-bold text-xl">0.8 hectares</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ocean Protected</span>
                <span className="text-emerald-500 font-bold text-xl">12.3 km²</span>
              </div>
            </div>
          </div>
          
          <div className="glass p-8 rounded-2xl hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">📊</div>
              <h3 className="text-2xl font-bold text-blue-500">Portfolio</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">RIU Balance</span>
                <span className="text-blue-500 font-bold text-xl">1,247 RIU</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Portfolio Value</span>
                <span className="text-blue-500 font-bold text-xl">$87,290</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">24h Change</span>
                <span className="text-emerald-500 font-bold text-xl">+5.2%</span>
              </div>
            </div>
          </div>
          
          <div className="glass p-8 rounded-2xl hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">🌱</div>
              <h3 className="text-2xl font-bold text-purple-500">Active Projects</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Projects</span>
                <span className="text-purple-500 font-bold text-xl">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Investment</span>
                <span className="text-purple-500 font-bold text-xl">$24,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Avg Return</span>
                <span className="text-emerald-500 font-bold text-xl">12.8%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link to="/marketplace" className="btn-glow px-8 py-4 rounded-xl text-white font-semibold text-lg">
            🚀 Explore More Projects
          </Link>
        </div>
      </div>
    </div>
  </Layout>
);

const Auth = () => (
  <Layout showFooter={false}>
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-8 bg-gradient-to-br from-slate-900 via-emerald-900/10 to-slate-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌱</div>
          <h1 className="text-4xl font-bold mb-4">Welcome to Atlas Sanctum</h1>
          <p className="text-slate-400">Join the regenerative revolution</p>
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
              🚀 Start Regenerating
            </button>
            
            <div className="text-center text-sm text-slate-400">
              By signing up, you agree to help regenerate Earth's future
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
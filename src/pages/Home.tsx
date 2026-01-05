import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Globe, Shield, TrendingUp, Users, Heart, BookOpen, Zap, Target } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-6 border border-emerald-500/30">
            🌱 Join the regenerative revolution — Explore verified projects
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight text-white mb-4">
            Regenerating<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Earth's Future</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-4xl mx-auto">
            The world's first regenerative platform uniting ecosystems across land, oceans, and human health—scaling to trillion-dollar impact with an enduring ethical core.
          </p>
          <div className="flex gap-4 justify-center mb-12">
            <Link 
              to="/marketplace" 
              className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-lg"
            >
              Enter the Sanctum
            </Link>
            <Link 
              to="/measurements" 
              className="px-8 py-4 border border-emerald-600 text-emerald-400 rounded-lg hover:bg-emerald-600/10 transition-colors font-medium text-lg"
            >
              Explore Platform
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">$2.4T</div>
              <div className="text-sm text-slate-400">Addressable Market</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">150+</div>
              <div className="text-sm text-slate-400">Global Partners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">12M</div>
              <div className="text-sm text-slate-400">Hectares Protected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-sm text-slate-400">Carbon Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Architecture */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Platform Architecture</h2>
            <p className="text-xl text-slate-300 mb-2">Five Layers of Regeneration</p>
            <p className="text-slate-400">A multi-layered ecosystem designed to preserve humanity and the planet, blending impact finance with ethical technology.</p>
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
              }
            ].map((layer, index) => (
              <div key={index} className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
                <div className="flex items-start gap-6">
                  <div className="text-6xl font-bold text-emerald-400/30">{layer.number}</div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold text-white mb-4">{layer.title}</h3>
                    <p className="text-slate-300 mb-6">{layer.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {layer.features.map((feature, i) => (
                        <span key={i} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm border border-emerald-500/30">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{layer.stat}</div>
                    <div className="text-sm text-slate-400">{layer.statLabel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-Time Impact */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Real-Time Impact</h2>
            <p className="text-xl text-slate-300 mb-2">Measuring Regeneration</p>
            <p className="text-slate-400">Transparent, verifiable metrics powered by AI oracles and IoT sensors tracking our collective impact across all ecosystems.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { value: "12.4M", unit: "Hectares", label: "Land Restored", change: "+23%" },
              { value: "847K", unit: "km²", label: "Ocean Protected", change: "+18%" },
              { value: "2.8M", unit: "Lives", label: "Health Improved", change: "+45%" },
              { value: "94%", unit: "Rate", label: "Circular Economy", change: "+12%" },
              { value: "$4.2B", unit: "USD", label: "Value Generated", change: "+67%" },
              { value: "156", unit: "Nations", label: "Global Reach", change: "+8%" }
            ].map((metric, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6 text-center">
                <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-sm text-slate-400 mb-2">{metric.unit}</div>
                <div className="text-slate-300 mb-3">{metric.label}</div>
                <div className="text-emerald-400 text-sm font-medium">{metric.change} vs last year</div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-slate-400">Live data from 15,000+ IoT sensors worldwide</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600/20 to-blue-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Join the Regenerative Revolution
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Be part of the world's largest ecosystem for regenerating land, oceans, and human flourishing. Together, we scale to trillions.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/marketplace" 
              className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Request Early Access
            </Link>
            <Link 
              to="/contact" 
              className="px-8 py-4 border border-emerald-600 text-emerald-400 rounded-lg hover:bg-emerald-600/10 transition-colors font-medium"
            >
              Contact Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
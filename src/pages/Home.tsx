import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="pt-20"> {/* Proper padding for fixed nav */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
              Version 2.0.0 • Production Ready
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Atlas Genesis
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Regenerative Carbon Credit Marketplace Platform
            </p>
            <p className="text-lg text-gray-500 mb-8 max-w-3xl mx-auto">
              A comprehensive full-stack platform for managing, valuing, and trading 
              Regenerative Impact Units (RIUs) at a global scale.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                to="/marketplace" 
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Explore Marketplace →
              </Link>
              <Link 
                to="/measurements" 
                className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
              >
                View Live Data
              </Link>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {[
              { label: "RIUs in Circulation", value: "24.5M", change: "+12%" },
              { label: "Trading Volume", value: "$1.84B", change: "+28%" },
              { label: "Active Projects", value: "2,847", change: "+15%" },
              { label: "Carbon Sequestered", value: "156K tons", change: "+22%" }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                <div className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  {stat.change}
                </div>
              </div>
            ))}
          </div>
          
          {/* Features Grid */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
            <p className="text-lg text-gray-600">
              Ten fully-integrated systems for regenerative impact at scale
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Measurements", link: "/measurements", desc: "Real-time satellite data with 95% confidence intervals", icon: "🛰️" },
              { title: "Bioregions", link: "/bioregions", desc: "PostGIS-powered geographic zones with climate forecasting", icon: "🗺️" },
              { title: "Agriculture", link: "/regenerative-agriculture", desc: "Soil microbiome scoring and ecosystem recovery tracking", icon: "🌱" },
              { title: "Valuation", link: "/valuation", desc: "Mathematical trust engine with dynamic pricing", icon: "💰" },
              { title: "Governance", link: "/governance", desc: "Indigenous-led councils with DAO-style voting", icon: "🏛️" },
              { title: "Marketplace", link: "/marketplace", desc: "$1.84B trading volume with regeneration-backed bonds", icon: "💹" },
              { title: "Health", link: "/health", desc: "Healthcare savings projections and air quality credits", icon: "❤️" },
              { title: "Outreach", link: "/outreach", desc: "45+ languages with 850K+ students engaged", icon: "📚" },
              { title: "Security", link: "/security", desc: "SHA-256 tamper-proof records with ML anomaly detection", icon: "🔐" },
              { title: "Adoption", link: "/adoption", desc: "Six actor entry points with flywheel economics", icon: "🚀" },
              { title: "Innovation", link: "/innovation", desc: "Next-generation regenerative technologies", icon: "⚡" },
              { title: "Profile", link: "/profile", desc: "User account and preferences", icon: "👤" }
            ].map((feature, index) => (
              <Link 
                key={index}
                to={feature.link}
                className="group block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border hover:border-green-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    Active
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
                <div className="mt-3 text-green-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
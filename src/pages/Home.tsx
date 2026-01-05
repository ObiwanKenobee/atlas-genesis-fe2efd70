import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Atlas Genesis
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Regenerative Carbon Credit Marketplace Platform
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/marketplace" 
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Explore Marketplace
            </Link>
            <Link 
              to="/measurements" 
              className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              View Live Data
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Measurements", link: "/measurements", desc: "Real-time satellite data" },
            { title: "Bioregions", link: "/bioregions", desc: "Geographic intelligence" },
            { title: "Agriculture", link: "/regenerative-agriculture", desc: "Ecosystem recovery" },
            { title: "Valuation", link: "/valuation", desc: "Credit pricing engine" },
            { title: "Governance", link: "/governance", desc: "Ethical decision making" },
            { title: "Marketplace", link: "/marketplace", desc: "RIU trading platform" },
            { title: "Health", link: "/health", desc: "Human health integration" },
            { title: "Outreach", link: "/outreach", desc: "Global education" },
            { title: "Security", link: "/security", desc: "Tamper-proof records" },
            { title: "Adoption", link: "/adoption", desc: "Global change pathway" },
            { title: "Innovation", link: "/innovation", desc: "Next-gen systems" },
            { title: "Sanctum", link: "/sanctum", desc: "Civilizational layer" }
          ].map((feature, index) => (
            <Link 
              key={index}
              to={feature.link}
              className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
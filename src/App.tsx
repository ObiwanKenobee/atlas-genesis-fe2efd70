import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const Header = () => (
  <header style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  }}>
    <div style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', textAlign: 'center', fontSize: '0.875rem', color: 'white' }}>
      🌱 Join the regenerative revolution — Explore verified projects
    </div>
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          🌱
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Atlas Sanctum</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>REGENERATIVE PLATFORM</div>
        </div>
      </div>
      
      <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem', color: '#94a3b8' }}>
        <span>Platform</span>
        <span>Solutions</span>
        <span>Impact</span>
        <span>Resources</span>
      </nav>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/auth" style={{ color: '#94a3b8', textDecoration: 'none' }}>Sign In</Link>
        <button style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          cursor: 'pointer'
        }}>
          Get Started
        </button>
      </div>
    </div>
  </header>
);

const HeroSection = () => (
  <section style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    color: 'white',
    paddingTop: '8rem',
    textAlign: 'center'
  }}>
    <div style={{ maxWidth: '1200px', padding: '0 2rem' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '9999px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        marginBottom: '2rem',
        fontSize: '0.875rem',
        color: '#94a3b8'
      }}>
        Regenerative Value Exchange • Powered by AI & Blockchain
      </div>

      <h1 style={{
        fontSize: 'clamp(3rem, 8vw, 6rem)',
        fontWeight: 'bold',
        lineHeight: '1.1',
        marginBottom: '2rem'
      }}>
        <span>Regenerating</span><br />
        <span style={{
          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Earth's Future
        </span>
      </h1>

      <p style={{
        fontSize: '1.25rem',
        color: '#94a3b8',
        maxWidth: '48rem',
        margin: '0 auto 3rem',
        lineHeight: '1.7'
      }}>
        The world's first regenerative platform uniting ecosystems across land, oceans, and human health—scaling to trillion-dollar impact with an enduring ethical core.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
        <button style={{
          padding: '1rem 2rem',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Enter the Sanctum
        </button>
        <button style={{
          padding: '1rem 2rem',
          backgroundColor: 'transparent',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Explore Platform
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        maxWidth: '64rem',
        margin: '0 auto'
      }}>
        {[
          { value: "$2.4T", label: "Addressable Market" },
          { value: "150+", label: "Global Partners" },
          { value: "12M", label: "Hectares Protected" },
          { value: "99.9%", label: "Carbon Verified" }
        ].map((stat, index) => (
          <div key={index} style={{
            textAlign: 'center',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#10b981',
              marginBottom: '0.5rem'
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PlatformArchitecture = () => (
  <section style={{ padding: '5rem 2rem', backgroundColor: '#1e293b', color: 'white' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>PLATFORM ARCHITECTURE</h2>
        <h3 style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '1rem' }}>Five Layers of Regeneration</h3>
        <p style={{ fontSize: '1.125rem', color: '#94a3b8', maxWidth: '48rem', margin: '0 auto' }}>
          A multi-layered ecosystem designed to preserve humanity and the planet, blending impact finance with ethical technology.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
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
          <div key={index} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            gap: '2rem',
            padding: '2rem',
            borderRadius: '1rem',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981', marginBottom: '1rem' }}>
                {layer.number}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
                {layer.stat}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                {layer.statLabel}
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {layer.title}
              </h4>
              <p style={{ color: '#94a3b8', marginBottom: '1rem', lineHeight: '1.6' }}>
                {layer.description}
              </p>
            </div>
            
            <div>
              {layer.features.map((feature, i) => (
                <div key={i} style={{
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  textAlign: 'center'
                }}>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '1.125rem', color: '#94a3b8' }}>
        Each layer interconnects to create a unified regenerative ecosystem
      </div>
    </div>
  </section>
);

const RealTimeImpact = () => (
  <section style={{ padding: '5rem 2rem', backgroundColor: '#0f172a', color: 'white' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>REAL-TIME IMPACT</h2>
        <h3 style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '1rem' }}>Measuring Regeneration</h3>
        <p style={{ fontSize: '1.125rem', color: '#94a3b8', maxWidth: '48rem', margin: '0 auto' }}>
          Transparent, verifiable metrics powered by AI oracles and IoT sensors tracking our collective impact across all ecosystems.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {[
          { value: "12.4M", unit: "Hectares", label: "Land Restored", change: "+23%" },
          { value: "847K", unit: "km²", label: "Ocean Protected", change: "+18%" },
          { value: "2.8M", unit: "Lives", label: "Health Improved", change: "+45%" },
          { value: "94%", unit: "Rate", label: "Circular Economy", change: "+12%" },
          { value: "$4.2B", unit: "USD", label: "Value Generated", change: "+67%" },
          { value: "156", unit: "Nations", label: "Global Reach", change: "+8%" }
        ].map((metric, index) => (
          <div key={index} style={{
            textAlign: 'center',
            padding: '2rem',
            borderRadius: '1rem',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
              {metric.value}
            </div>
            <div style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              {metric.unit}
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              {metric.label}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#10b981' }}>
              {metric.change} vs last year
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', fontSize: '1rem', color: '#94a3b8' }}>
        Live data from 15,000+ IoT sensors worldwide
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer style={{ backgroundColor: '#1e293b', color: 'white', padding: '3rem 2rem 1rem' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Atlas Sanctum</div>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
            The world's first regenerative platform uniting ecosystems for trillion-dollar impact.
          </p>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            <div>hello@atlassanctum.com</div>
            <div>+1 (234) 567-890</div>
            <div>San Francisco, CA</div>
          </div>
        </div>
        
        <div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>FEATURES</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            <span>Measurements</span>
            <span>Bioregions</span>
            <span>Regeneration</span>
            <span>Valuation</span>
          </div>
        </div>
        
        <div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>PLATFORM</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            <span>Marketplace</span>
            <span>Adoption</span>
            <span>Dashboard</span>
            <span>Portfolio</span>
          </div>
        </div>
        
        <div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>RESOURCES</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            <span>API Documentation</span>
            <span>Impact Guides</span>
            <span>Community Forum</span>
            <span>Case Studies</span>
          </div>
        </div>
      </div>
      
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>
          © 2025 Atlas Sanctum. All rights reserved.
        </div>
        <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
          Regenerating Earth's future through verified, ethical impact.
        </div>
      </div>
    </div>
  </footer>
);

const Index = () => (
  <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#0f172a' }}>
    <Header />
    <HeroSection />
    <PlatformArchitecture />
    <RealTimeImpact />
    <Footer />
  </div>
);

const Dashboard = () => (
  <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', padding: '8rem 2rem 2rem' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Dashboard</h1>
      <p style={{ color: '#94a3b8' }}>Welcome to your Atlas Sanctum dashboard.</p>
    </div>
  </div>
);

const Auth = () => (
  <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', padding: '8rem 2rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ maxWidth: '400px', width: '100%' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>Sign In</h1>
      <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
        <input
          type="email"
          placeholder="Email"
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '0.5rem',
            color: 'white'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '0.5rem',
            color: 'white'
          }}
        />
        <button style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          cursor: 'pointer'
        }}>
          Sign In
        </button>
      </div>
    </div>
  </div>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<Index />} />
    </Routes>
  </BrowserRouter>
);

export default App;
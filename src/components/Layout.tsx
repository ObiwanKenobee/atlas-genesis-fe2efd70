import React from 'react';
import { Link } from 'react-router-dom';

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
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          🌱
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Atlas Sanctum</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>REGENERATIVE PLATFORM</div>
        </div>
      </Link>
      
      <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem', color: '#94a3b8' }}>
        <Link to="/measurements" style={{ color: '#94a3b8', textDecoration: 'none' }}>Platform</Link>
        <Link to="/marketplace" style={{ color: '#94a3b8', textDecoration: 'none' }}>Marketplace</Link>
        <Link to="/business-model" style={{ color: '#94a3b8', textDecoration: 'none' }}>Business</Link>
        <Link to="/innovations" style={{ color: '#94a3b8', textDecoration: 'none' }}>Innovations</Link>
        <Link to="/engineering-architecture" style={{ color: '#94a3b8', textDecoration: 'none' }}>Engineering</Link>
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
            <Link to="/measurements" style={{ color: '#94a3b8', textDecoration: 'none' }}>Measurements</Link>
            <Link to="/bioregions" style={{ color: '#94a3b8', textDecoration: 'none' }}>Bioregions</Link>
            <Link to="/regenerative-agriculture" style={{ color: '#94a3b8', textDecoration: 'none' }}>Regeneration</Link>
            <Link to="/valuation" style={{ color: '#94a3b8', textDecoration: 'none' }}>Valuation</Link>
          </div>
        </div>
        
        <div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>PLATFORM</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            <Link to="/marketplace" style={{ color: '#94a3b8', textDecoration: 'none' }}>Marketplace</Link>
            <Link to="/adoption" style={{ color: '#94a3b8', textDecoration: 'none' }}>Adoption</Link>
            <Link to="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/health" style={{ color: '#94a3b8', textDecoration: 'none' }}>Health</Link>
          </div>
        </div>
        
        <div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>ARCHITECTURE</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            <Link to="/ethical-governance" style={{ color: '#94a3b8', textDecoration: 'none' }}>Ethical Governance</Link>
            <Link to="/regenerative-value-exchange" style={{ color: '#94a3b8', textDecoration: 'none' }}>Value Exchange</Link>
            <Link to="/data-metrics-engine" style={{ color: '#94a3b8', textDecoration: 'none' }}>Data Engine</Link>
            <Link to="/cultural-knowledge-impact" style={{ color: '#94a3b8', textDecoration: 'none' }}>Cultural Impact</Link>
            <Link to="/global-impact-economy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Impact Economy</Link>
          </div>
        </div>
        
        <div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>RESOURCES</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            <Link to="/business-model" style={{ color: '#94a3b8', textDecoration: 'none' }}>Business Model</Link>
            <Link to="/innovations" style={{ color: '#94a3b8', textDecoration: 'none' }}>Innovations</Link>
            <Link to="/azure-strategy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Azure Strategy</Link>
            <Link to="/rvx-innovations" style={{ color: '#94a3b8', textDecoration: 'none' }}>RVX Innovations</Link>
            <Link to="/end-to-end-experience" style={{ color: '#94a3b8', textDecoration: 'none' }}>User Experience</Link>
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

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => (
  <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#0f172a', minHeight: '100vh' }}>
    <Header />
    <main style={{ paddingTop: '6rem' }}>
      {children}
    </main>
    {showFooter && <Footer />}
  </div>
);

export default Layout;
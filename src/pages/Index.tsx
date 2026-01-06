import React from 'react';

const Index = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', paddingTop: '10rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.5rem 1rem', 
          borderRadius: '9999px', 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '2rem'
        }}>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Regenerative Value Exchange • Powered by AI & Blockchain
          </span>
        </div>

        <h1 style={{ 
          fontSize: 'clamp(2rem, 8vw, 4rem)', 
          fontWeight: 'bold', 
          lineHeight: '1.2', 
          marginBottom: '2rem' 
        }}>
          <span>Regenerating</span>
          <br />
          <span style={{ 
            background: 'linear-gradient(135deg, #10b981, #3b82f6)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Earth's Future
          </span>
        </h1>

        <p style={{ 
          fontSize: '1.125rem', 
          color: '#94a3b8', 
          maxWidth: '48rem', 
          margin: '0 auto 3rem', 
          lineHeight: '1.7' 
        }}>
          The world's first regenerative platform uniting ecosystems across land,
          oceans, and human health—scaling to trillion-dollar impact with an enduring ethical core.
        </p>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem', 
          alignItems: 'center',
          marginBottom: '4rem'
        }}>
          <button style={{
            padding: '1rem 2rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            Enter the Sanctum →
          </button>
          <button style={{
            padding: '1rem 2rem',
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
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
            { value: "99.9%", label: "Carbon Verified" },
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
    </div>
  );
};

export default Index;
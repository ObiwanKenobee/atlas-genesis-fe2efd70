import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Index = () => (
  <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', padding: '2rem' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', paddingTop: '5rem' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        <span>Regenerating </span>
        <span style={{ 
          background: 'linear-gradient(135deg, #10b981, #3b82f6)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent' 
        }}>
          Earth's Future
        </span>
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '3rem' }}>
        The world's first regenerative platform for carbon credits and ecosystem restoration
      </p>
      <button style={{
        padding: '1rem 2rem',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        cursor: 'pointer'
      }}>
        Enter the Sanctum
      </button>
    </div>
  </div>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<Index />} />
    </Routes>
  </BrowserRouter>
);

export default App;
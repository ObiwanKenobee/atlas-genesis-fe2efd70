import React from 'react';
import Layout from '../components/Layout';

const Measurements = () => (
  <Layout>
    <div style={{ padding: '2rem', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Planetary Measurement & Verification</h1>
        <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginBottom: '2rem' }}>
          Real-time satellite data integration with multi-metric tracking and 95% confidence intervals.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Satellite Integration</h3>
            <p style={{ color: '#94a3b8' }}>Sentinel-2 and Landsat data processing for real-time ecosystem monitoring.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Multi-Metric Tracking</h3>
            <p style={{ color: '#94a3b8' }}>CO₂, soil carbon, NDVI, and biodiversity measurements with anomaly detection.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Verification Engine</h3>
            <p style={{ color: '#94a3b8' }}>95% confidence intervals with ML-powered validation and fraud detection.</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

const Bioregions = () => (
  <Layout>
    <div style={{ padding: '2rem', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Geographic Intelligence & Bioregional Mapping</h1>
        <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginBottom: '2rem' }}>
          PostGIS-powered bioregional visualization with climate risk forecasting and indigenous land recognition.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Climate Forecasting</h3>
            <p style={{ color: '#94a3b8' }}>25-year climate risk projections with bioregional zone analysis.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Indigenous Recognition</h3>
            <p style={{ color: '#94a3b8' }}>Sacred land protection with justice-aware pricing multipliers.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>PostGIS Integration</h3>
            <p style={{ color: '#94a3b8' }}>Advanced geospatial queries and bioregional zone visualization.</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

const RegenerativeAgriculture = () => (
  <Layout>
    <div style={{ padding: '2rem', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Regenerative Agriculture & Ecosystem Recovery</h1>
        <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginBottom: '2rem' }}>
          Comprehensive ecosystem health monitoring with farmer income projections of $205K-565K annually.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Soil Health Monitoring</h3>
            <p style={{ color: '#94a3b8' }}>Microbiome scoring and soil carbon tracking with IoT sensors.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Crop Diversity Tracking</h3>
            <p style={{ color: '#94a3b8' }}>Biodiversity metrics and regenerative farming practice verification.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Ecosystem Restoration</h3>
            <p style={{ color: '#94a3b8' }}>Mangrove and kelp restoration monitoring with impact projections.</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

const Valuation = () => (
  <Layout>
    <div style={{ padding: '2rem', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Mathematical Trust & Credit Valuation Engine</h1>
        <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginBottom: '2rem' }}>
          Multi-variable impact scoring with dynamic pricing model ($25 base → $70 final).
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Impact Scoring</h3>
            <p style={{ color: '#94a3b8' }}>CO₂ 45%, Biodiversity 35%, Health 20% with confidence intervals.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Risk Assessment</h3>
            <p style={{ color: '#94a3b8' }}>Reversal risk decay modeling over 25-year horizon.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Dynamic Pricing</h3>
            <p style={{ color: '#94a3b8' }}>AI-powered pricing engine with market demand optimization.</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

const Governance = () => (
  <Layout>
    <div style={{ padding: '2rem', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ethical, Cultural & Spiritual Governance</h1>
        <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginBottom: '2rem' }}>
          Bioregional Ethics Councils with 67% indigenous representation and DAO-style decision-making.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Ethics Councils</h3>
            <p style={{ color: '#94a3b8' }}>12-member councils with indigenous majority and community consent validation.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Sacred Land Protection</h3>
            <p style={{ color: '#94a3b8' }}>Cultural preservation protocols with spiritual governance integration.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>DAO Voting</h3>
            <p style={{ color: '#94a3b8' }}>Supermajority voting with transparent decision-making processes.</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

const Marketplace = () => (
  <Layout>
    <div style={{ padding: '2rem', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Marketplace & Financial Infrastructure</h1>
        <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginBottom: '2rem' }}>
          RIU trading platform with 24.5M RIUs in circulation and $1.84B trading volume.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>RIU Trading</h3>
            <p style={{ color: '#94a3b8' }}>Tiered buyer system from individuals to corporations to nations.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Impact Bonds</h3>
            <p style={{ color: '#94a3b8' }}>Regeneration-backed bonds with 3.8%-6.5% coupons.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Financial Infrastructure</h3>
            <p style={{ color: '#94a3b8' }}>Secure trading platform with institutional-grade settlement.</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

const Health = () => (
  <Layout>
    <div style={{ padding: '2rem', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Human Health Integration</h1>
        <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginBottom: '2rem' }}>
          Air quality credits and healthcare savings projections of $840M per 1M RIUs.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Air Quality Credits</h3>
            <p style={{ color: '#94a3b8' }}>Real-time air quality monitoring with health impact quantification.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Water Restoration</h3>
            <p style={{ color: '#94a3b8' }}>Water quality metrics with ecosystem health correlation.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Healthcare Savings</h3>
            <p style={{ color: '#94a3b8' }}>Urban green health scores with healthcare cost projections.</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

const Adoption = () => (
  <Layout>
    <div style={{ padding: '2rem', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Adoption Pathway for Global Change</h1>
        <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginBottom: '2rem' }}>
          Six actor entry points with The Flywheel Effect economic model for global adoption.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Entry Points</h3>
            <p style={{ color: '#94a3b8' }}>Six pathways from individuals to corporations to nations.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Role-Specific Onboarding</h3>
            <p style={{ color: '#94a3b8' }}>Customized onboarding flows for different stakeholder types.</p>
          </div>
          
          <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10b981' }}>Flywheel Effect</h3>
            <p style={{ color: '#94a3b8' }}>Economic model driving exponential adoption and impact scaling.</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

export { Measurements, Bioregions, RegenerativeAgriculture, Valuation, Governance, Marketplace, Health, Adoption };
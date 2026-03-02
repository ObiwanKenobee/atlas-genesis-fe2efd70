# 🚀 RVE Platform - Quick Reference Guide

**Version**: 2.0.0  
**Last Updated**: February 1, 2026  
**Status**: Production Ready ✅

---

## 📋 Table of Contents

1. [Dashboard Navigation](#dashboard-navigation)
2. [New Features (Q1-Q2 2025)](#new-features-q1-q2-2025)
3. [Component Reference](#component-reference)
4. [API Quick Reference](#api-quick-reference)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)

---

## Dashboard Navigation

### All Sections (21 Total)

#### Core Platform (3)
- **Overview** - Real-time platform metrics and system health
- **Operations** - Critical workflows hub (Asset Issuance, Custodian Onboarding, Impact Reporting, Governance)
- **Innovations** - Advanced features hub (AI Oracle, Biodiversity Tokens, Knowledge Graph, Regenerative DeFi)

#### Asset Management (6)
- **Asset Classes** - Environmental, Health, Cultural, Ecosystem assets
- **Verification** - Multi-modal verification layer (satellite, IoT, AI, community)
- **Governance** - DAO voting and proposal management
- **Trading** - Order books, limit orders, portfolio tracking
- **Impact** - Real-time regenerative outcome metrics
- **Custodians** - Project steward network

#### Infrastructure (3)
- **Oracle Network** - AI-powered verification and predictions
- **Token Economics** - RVE token supply, staking, incentives
- **Fiat On-Ramp** 🆕 - Fiat-to-crypto gateway

#### Financial Services (2)
- **Treasury** 🆕 - DAO treasury management dashboard
- **Insurance** 🆕 - Parametric regenerative insurance

#### Platform & Analytics (3)
- **Analytics** 🆕 - Advanced analytics and forecasting
- **White Label** 🆕 - Multi-tenant customization platform
- **Mobile App** 🆕 - Mobile experience demo

#### Developer & System (4)
- **Visualizations** - Advanced charts and graphs
- **API & Architecture** - Developer portal and API explorer
- **Compliance** - Audit reports and transparency
- **Alerts** - Real-time notification system

---

## New Features (Q1-Q2 2025)

### 1. Fiat On-Ramp 💳

**Component**: `/components/FiatOnRamp.tsx`  
**Tab ID**: `fiat-onramp`  
**Icon**: CreditCard

**Quick Facts**:
- Payment methods: Card, Bank, Wallet
- Fees: 0.5% - 3.5%
- Processing: Instant to 3 days
- Currencies: USD, EUR, GBP

**Key Features**:
```typescript
- Purchase RVE with fiat currency
- Multiple payment method support
- Real-time transaction tracking
- KYC/AML compliance ready
- Transaction history
```

**Usage Example**:
```typescript
// Navigate to Fiat On-Ramp
setActiveTab('fiat-onramp');

// User can:
1. Select payment method
2. Enter amount
3. Choose crypto asset
4. Complete purchase
5. Track transaction status
```

---

### 2. Treasury Management 🏦

**Component**: `/components/TreasuryManagement.tsx`  
**Tab ID**: `treasury`  
**Icon**: Building2

**Quick Facts**:
- Treasury value: $48.3M
- Multi-sig: 3-of-5 required
- Assets: RVE, USDC, ETH, DAI
- Cross-chain: Supported

**Key Features**:
```typescript
- Real-time balance dashboard
- Asset allocation pie charts
- Multi-sig proposal creation
- Voting on treasury operations
- Transaction history
- Performance analytics
- Staking management
```

**Usage Example**:
```typescript
// Create Treasury Proposal
1. Navigate to 'treasury' tab
2. Click "New Proposal"
3. Fill in:
   - Title
   - Amount
   - Recipient
   - Description
4. Submit for voting
5. Track proposal status
```

---

### 3. Advanced Analytics 📊

**Component**: `/components/AdvancedAnalytics.tsx`  
**Tab ID**: `analytics`  
**Icon**: BarChart3

**Quick Facts**:
- Chart types: 10+
- Metrics: 50+
- Export: CSV, PDF, JSON
- Updates: Real-time

**Key Features**:
```typescript
- User growth analysis
- Transaction volume tracking
- Asset performance metrics
- Geographic heatmaps
- Cohort analysis
- Radar charts
- Revenue attribution
- Predictive forecasting
- Custom date ranges
- Export functionality
```

**Usage Example**:
```typescript
// View Analytics
1. Navigate to 'analytics' tab
2. Select metric category:
   - User Metrics
   - Transaction Analysis
   - Asset Performance
   - Geographic Data
3. Choose date range
4. Export data if needed
```

---

### 4. Regenerative Insurance 🛡️

**Component**: `/components/RegenerativeInsurance.tsx`  
**Tab ID**: `insurance`  
**Icon**: Umbrella

**Quick Facts**:
- Products: 6 types
- AI accuracy: 94.2%
- Claim time: <24 hours
- Pool size: 1,200+ participants

**Key Features**:
```typescript
- Parametric climate insurance
  - Drought coverage
  - Flood protection
  - Wildfire insurance
- Biodiversity protection
- Harvest failure coverage
- AI claim verification
- Smart contract payouts
- Risk scoring
- Premium calculator
- Claims dashboard
```

**Usage Example**:
```typescript
// Purchase Insurance
1. Navigate to 'insurance' tab
2. Browse available products
3. Select coverage type
4. Configure parameters:
   - Coverage amount
   - Duration
   - Location
5. View premium calculation
6. Purchase policy
7. Track claims
```

---

### 5. White Label Solutions 🎨

**Component**: `/components/WhiteLabelSolutions.tsx`  
**Tab ID**: `whitelabel`  
**Icon**: Palette

**Quick Facts**:
- Clients: 3 pilot clients
- Setup time: <30 minutes
- Pricing: $199-$999/mo
- Multi-tenant: Yes

**Key Features**:
```typescript
- Full brand customization
  - Primary colors
  - Logo upload
  - Custom domains
- Feature toggles
- Client dashboard
- Usage analytics
- API key management
- Code snippet generation
- Embeddable widgets
- Tiered pricing
```

**Usage Example**:
```typescript
// Create White Label Client
1. Navigate to 'whitelabel' tab
2. Click "New Client"
3. Configure branding:
   - Upload logo
   - Set colors
   - Choose domain
4. Select features
5. Choose pricing tier
6. Generate API keys
7. Copy integration code
8. Launch branded platform
```

---

### 6. Mobile App Demo 📱

**Component**: `/components/MobileAppDemo.tsx`  
**Tab ID**: `mobile`  
**Icon**: Smartphone

**Quick Facts**:
- Platforms: iOS + Android
- Downloads: 15,000+
- Rating: 4.8/5 stars
- Features: 10+ native

**Key Features**:
```typescript
- Mobile trading interface
- Digital wallet
- Biometric authentication
- Push notifications
- Offline mode
- QR code scanning
- GPS impact tracking
- Camera verification
- NFC payments
- App store links
- User testimonials
```

**Usage Example**:
```typescript
// View Mobile Features
1. Navigate to 'mobile' tab
2. Browse feature list
3. View app screenshots
4. Read testimonials
5. Access download links:
   - iOS App Store
   - Google Play Store
6. View demo videos
```

---

## Component Reference

### File Locations

```
/components/
├── Core Dashboard
│   ├── Overview.tsx
│   ├── AssetClasses.tsx
│   ├── VerificationLayer.tsx
│   ├── Governance.tsx
│   ├── TradingInterface.tsx
│   ├── ImpactMetrics.tsx
│   ├── CustodianNetwork.tsx
│   ├── OracleNetwork.tsx
│   ├── TokenEconomics.tsx
│   ├── ComplianceAudits.tsx
│   ├── AlertSystem.tsx
│   ├── AdvancedVisualizations.tsx
│   ├── CriticalOperations.tsx
│   ├── CriticalInnovations.tsx
│   └── APIExplorer.tsx
│
├── New Features (Q1-Q2 2025)
│   ├── FiatOnRamp.tsx          🆕
│   ├── TreasuryManagement.tsx  🆕
│   ├── AdvancedAnalytics.tsx   🆕
│   ├── RegenerativeInsurance.tsx 🆕
│   ├── WhiteLabelSolutions.tsx 🆕
│   └── MobileAppDemo.tsx       🆕
│
├── critical/
│   ├── AssetIssuance.tsx
│   ├── CustodianOnboarding.tsx
│   ├── ImpactReporting.tsx
│   └── GovernanceParticipation.tsx
│
├── innovations/
│   ├── RegenerativeAIOracle.tsx
│   ├── BiodiversityTokens.tsx
│   ├── TraditionalKnowledgeGraph.tsx
│   └── RegenerativeDeFi.tsx
│
└── visualizations/
    ├── NetworkGraph.tsx
    ├── ImpactHeatmap.tsx
    ├── ImpactGauge.tsx
    ├── TimelineVisualization.tsx
    ├── TreeMapVisualization.tsx
    └── ValueFlowDiagram.tsx
```

---

## API Quick Reference

### Base Configuration

```typescript
import { apiClient } from './services/api/client';

// Base URL
const API_URL = process.env.VITE_API_URL || 'https://api.rve.network/v1';

// Authentication
apiClient.setAuthToken(token);
```

### Common Endpoints

#### Assets
```typescript
// List all assets
GET /assets

// Get asset details
GET /assets/:id

// Create asset
POST /assets
Body: { name, type, supply, verification, custodian }

// Update asset
PUT /assets/:id

// Delete asset
DELETE /assets/:id
```

#### Fiat On-Ramp (NEW)
```typescript
// Get payment methods
GET /fiat/methods

// Create purchase order
POST /fiat/purchase
Body: { amount, currency, method, cryptoAsset }

// Get transaction status
GET /fiat/transactions/:id

// List user transactions
GET /fiat/transactions?userId=:userId
```

#### Treasury (NEW)
```typescript
// Get treasury balance
GET /treasury/balance

// Get asset allocation
GET /treasury/allocation

// Create proposal
POST /treasury/proposals
Body: { title, amount, asset, recipient, description }

// Vote on proposal
POST /treasury/proposals/:id/vote
Body: { vote: 'for' | 'against' | 'abstain' }

// Execute proposal
POST /treasury/proposals/:id/execute
```

#### Analytics (NEW)
```typescript
// Get user metrics
GET /analytics/users?startDate=:date&endDate=:date

// Get transaction metrics
GET /analytics/transactions?period=:period

// Get asset performance
GET /analytics/assets/:id/performance

// Get geographic data
GET /analytics/geographic

// Export data
POST /analytics/export
Body: { format: 'csv' | 'pdf' | 'json', metrics: [] }
```

#### Insurance (NEW)
```typescript
// List insurance products
GET /insurance/products

// Get product details
GET /insurance/products/:id

// Purchase policy
POST /insurance/policies
Body: { productId, coverage, duration, location }

// File claim
POST /insurance/claims
Body: { policyId, type, evidence, amount }

// Get claim status
GET /insurance/claims/:id
```

#### White Label (NEW)
```typescript
// List clients
GET /whitelabel/clients

// Create client
POST /whitelabel/clients
Body: { name, domain, branding, features, plan }

// Update client
PUT /whitelabel/clients/:id

// Get client analytics
GET /whitelabel/clients/:id/analytics

// Generate API key
POST /whitelabel/clients/:id/apikeys
```

---

## Common Tasks

### Task 1: Add New Navigation Tab

```typescript
// 1. Import component in App.tsx
import { MyNewComponent } from './components/MyNewComponent';

// 2. Add to TabType union
type TabType = 'overview' | ... | 'mynewfeature';

// 3. Add tab definition
const tabs = [
  // ... existing tabs
  { id: 'mynewfeature' as TabType, label: 'My Feature', icon: MyIcon }
];

// 4. Add conditional render
{activeTab === 'mynewfeature' && <MyNewComponent />}
```

---

### Task 2: Create New Component

```typescript
// Template: /components/MyComponent.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export function MyComponent() {
  const [data, setData] = useState([]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Feature</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Content here */}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Task 3: Add API Endpoint

```typescript
// In /services/api/endpoints.ts
export const myEndpoint = {
  list: () => apiClient.get<MyType[]>('/my-endpoint'),
  get: (id: string) => apiClient.get<MyType>(`/my-endpoint/${id}`),
  create: (data: CreateMyType) => apiClient.post<MyType>('/my-endpoint', data),
  update: (id: string, data: UpdateMyType) => 
    apiClient.put<MyType>(`/my-endpoint/${id}`, data),
  delete: (id: string) => apiClient.delete(`/my-endpoint/${id}`)
};
```

---

### Task 4: Add Recharts Visualization

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  // ...
];

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
    <XAxis dataKey="name" stroke="#6ee7b7" />
    <YAxis stroke="#6ee7b7" />
    <Tooltip 
      contentStyle={{ 
        backgroundColor: '#1f2937', 
        border: '1px solid #34d399' 
      }} 
    />
    <Line 
      type="monotone" 
      dataKey="value" 
      stroke="#34d399" 
      strokeWidth={2} 
    />
  </LineChart>
</ResponsiveContainer>
```

---

## Troubleshooting

### Issue: Component Not Showing

**Symptoms**: Tab click but no content displays

**Solution**:
```typescript
// 1. Check import in App.tsx
import { MyComponent } from './components/MyComponent';

// 2. Check TabType includes your tab ID
type TabType = '...' | 'mytab';

// 3. Check conditional render exists
{activeTab === 'mytab' && <MyComponent />}

// 4. Check component has default export
export function MyComponent() { ... }
```

---

### Issue: TypeScript Errors

**Symptoms**: Red squiggly lines, build fails

**Solution**:
```typescript
// 1. Check all imports are typed
import { MyType } from './types';

// 2. Define interfaces for data
interface MyData {
  id: string;
  name: string;
  // ...
}

// 3. Type component props
interface MyComponentProps {
  data: MyData[];
  onUpdate: (id: string) => void;
}

export function MyComponent({ data, onUpdate }: MyComponentProps) {
  // ...
}
```

---

### Issue: Charts Not Rendering

**Symptoms**: Empty space where chart should be

**Solution**:
```typescript
// 1. Check Recharts import
import { LineChart, Line } from 'recharts';

// 2. Verify data structure
const data = [
  { name: 'A', value: 100 }, // Must have keys matching dataKey
];

// 3. Set ResponsiveContainer dimensions
<ResponsiveContainer width="100%" height={300}>

// 4. Check parent container has height
<div className="h-[300px]">
```

---

### Issue: Slow Performance

**Symptoms**: Laggy UI, slow rendering

**Solution**:
```typescript
// 1. Use useMemo for expensive calculations
const processedData = useMemo(() => 
  expensiveCalculation(data), 
  [data]
);

// 2. Use useCallback for functions
const handleClick = useCallback((id) => {
  // ...
}, [dependencies]);

// 3. Lazy load large lists
import { Virtuoso } from 'react-virtuoso';

// 4. Debounce inputs
import { useDebouncedValue } from './hooks';
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + 1` | Go to Overview |
| `Ctrl + 2` | Go to Operations |
| `Ctrl + 3` | Go to Innovations |
| `Ctrl + K` | Open command palette |
| `Ctrl + /` | Toggle help |
| `Esc` | Close modals |

---

## Environment Variables

```bash
# Required
VITE_API_URL=https://api.rve.network/v1
VITE_WS_URL=wss://ws.rve.network

# Blockchain
VITE_ETH_RPC_URL=your_alchemy_url
VITE_POLYGON_RPC_URL=your_polygon_url

# Contracts
VITE_CONTRACT_RVE_TOKEN=0x...
VITE_CONTRACT_ASSET_REGISTRY=0x...

# Optional
VITE_ENABLE_DEBUG=true
VITE_ANALYTICS_ID=UA-...
```

---

## Quick Links

- **GitHub**: https://github.com/rve-network/platform
- **Documentation**: https://docs.rve.network
- **API Docs**: https://docs.rve.network/api
- **Status Page**: https://status.rve.network
- **Support**: support@rve.network

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | Feb 1, 2026 | Added 6 new features (Q1-Q2 2025) |
| 1.5.0 | Dec 15, 2025 | Critical innovations |
| 1.0.0 | Oct 1, 2025 | Initial release |

---

**Document**: Quick Reference Guide  
**Version**: 2.0.0  
**Maintained by**: Engineering Team  
**Last Updated**: February 1, 2026

*From Extraction to Regeneration • From Depletion to Abundance*

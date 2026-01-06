export const platformNavigation = {
  // Main Platform Categories
  platform: {
    title: 'Platform',
    items: [
      {
        title: 'Marketplace',
        href: '/marketplace',
        description: 'Browse and purchase carbon credits',
        icon: 'ShoppingCart'
      },
      {
        title: 'Portfolio',
        href: '/portfolio',
        description: 'Track your carbon investments',
        icon: 'PieChart'
      },
      {
        title: 'Bioregions',
        href: '/bioregions',
        description: 'Explore geographic impact zones',
        icon: 'Globe'
      },
      {
        title: 'Measurements',
        href: '/measurements',
        description: 'Real-time environmental data',
        icon: 'Activity'
      }
    ]
  },

  // Solutions by Category
  solutions: {
    title: 'Solutions',
    categories: [
      {
        title: 'Environmental',
        items: [
          {
            title: 'Regenerative Agriculture',
            href: '/regenerative-agriculture',
            description: 'Soil health and biodiversity',
            icon: 'Sprout'
          },
          {
            title: 'Renewable Energy',
            href: '/renewable-energy',
            description: 'Clean energy transition projects',
            icon: 'Zap'
          },
          {
            title: 'Ecosystem Health',
            href: '/health',
            description: 'Human and planet wellness',
            icon: 'Heart'
          }
        ]
      },
      {
        title: 'Governance',
        items: [
          {
            title: 'Community Governance',
            href: '/governance',
            description: 'Democratic decision-making',
            icon: 'Users'
          },
          {
            title: 'Security & Trust',
            href: '/security',
            description: 'Blockchain verification',
            icon: 'Shield'
          },
          {
            title: 'Global Adoption',
            href: '/adoption',
            description: 'Worldwide scaling',
            icon: 'TrendingUp'
          }
        ]
      }
    ]
  },

  // Impact & Analytics
  impact: {
    title: 'Impact',
    items: [
      {
        title: 'Analytics & Insights',
        href: '/analytics',
        description: 'Data-driven impact analysis',
        icon: 'BarChart3'
      },
      {
        title: 'Valuation Engine',
        href: '/valuation',
        description: 'Credit pricing and analysis',
        icon: 'Calculator'
      },
      {
        title: 'Transactions',
        href: '/transactions',
        description: 'Complete transaction history',
        icon: 'Receipt'
      },
      {
        title: 'Dashboard',
        href: '/dashboard',
        description: 'Unified control center',
        icon: 'Layout'
      }
    ]
  },

  // Resources & Support
  resources: {
    title: 'Resources',
    categories: [
      {
        title: 'Learn',
        items: [
          {
            title: 'Documentation',
            href: '/docs',
            description: 'Guides and API reference',
            icon: 'Book'
          },
          {
            title: 'Education Hub',
            href: '/education',
            description: 'Carbon market education',
            icon: 'GraduationCap'
          },
          {
            title: 'Certifications',
            href: '/certifications',
            description: 'Standards and methodologies',
            icon: 'Award'
          }
        ]
      },
      {
        title: 'Support',
        items: [
          {
            title: 'Help Center',
            href: '/help',
            description: 'FAQs and troubleshooting',
            icon: 'HelpCircle'
          },
          {
            title: 'Pricing',
            href: '/pricing',
            description: 'Transparent pricing plans',
            icon: 'DollarSign'
          }
        ]
      }
    ]
  },

  // Use Cases
  useCases: {
    title: 'By Use Case',
    items: [
      {
        title: 'Carbon Offsetting',
        href: '/carbon-offsetting',
        description: 'Neutralize your carbon footprint',
        icon: 'Leaf'
      },
      {
        title: 'Impact Investment',
        href: '/impact-investment',
        description: 'Generate returns while doing good',
        icon: 'TrendingUp'
      },
      {
        title: 'Regulatory Compliance',
        href: '/compliance',
        description: 'Meet sustainability requirements',
        icon: 'FileCheck'
      }
    ]
  },

  // Industries
  industries: {
    title: 'By Industry',
    items: [
      {
        title: 'Enterprise',
        href: '/enterprise',
        description: 'Large-scale carbon programs',
        icon: 'Building'
      },
      {
        title: 'SMB',
        href: '/smb',
        description: 'Accessible sustainability solutions',
        icon: 'Store'
      },
      {
        title: 'Agriculture',
        href: '/agriculture',
        description: 'Regenerative farming credits',
        icon: 'Wheat'
      }
    ]
  },

  // Advanced Systems
  advanced: {
    title: 'Advanced Systems',
    items: [
      {
        title: 'Architecture',
        href: '/architecture',
        description: 'Civilizational operating system',
        icon: 'Network'
      },
      {
        title: 'Role Dashboards',
        href: '/role-dashboards',
        description: 'Tailored user experiences',
        icon: 'UserCheck'
      }
    ]
  }
};

// Flattened routes for easy access
export const allRoutes = [
  // Core Platform
  { path: '/marketplace', name: 'Marketplace' },
  { path: '/portfolio', name: 'Portfolio' },
  { path: '/bioregions', name: 'Bioregions' },
  { path: '/measurements', name: 'Measurements' },
  
  // Environmental Solutions
  { path: '/regenerative-agriculture', name: 'Regenerative Agriculture' },
  { path: '/renewable-energy', name: 'Renewable Energy' },
  { path: '/health', name: 'Ecosystem Health' },
  
  // Governance
  { path: '/governance', name: 'Community Governance' },
  { path: '/security', name: 'Security & Trust' },
  { path: '/adoption', name: 'Global Adoption' },
  
  // Analytics & Impact
  { path: '/analytics', name: 'Analytics & Insights' },
  { path: '/valuation', name: 'Valuation Engine' },
  { path: '/transactions', name: 'Transactions' },
  { path: '/dashboard', name: 'Dashboard' },
  
  // Resources
  { path: '/docs', name: 'Documentation' },
  { path: '/education', name: 'Education Hub' },
  { path: '/certifications', name: 'Certifications' },
  { path: '/help', name: 'Help Center' },
  { path: '/pricing', name: 'Pricing' },
  
  // Use Cases
  { path: '/carbon-offsetting', name: 'Carbon Offsetting' },
  { path: '/impact-investment', name: 'Impact Investment' },
  { path: '/compliance', name: 'Regulatory Compliance' },
  
  // Industries
  { path: '/enterprise', name: 'Enterprise' },
  { path: '/smb', name: 'SMB' },
  { path: '/agriculture', name: 'Agriculture' },
  
  // Advanced
  { path: '/architecture', name: 'Architecture' },
  { path: '/role-dashboards', name: 'Role Dashboards' }
];
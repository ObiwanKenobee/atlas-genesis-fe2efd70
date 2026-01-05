import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowRight, Globe, Leaf, TrendingUp, Shield, Users, Heart, BookOpen, Zap, Target } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Planetary Measurement",
      description: "Real-time satellite data with 95% confidence intervals",
      link: "/measurements",
      status: "Active"
    },
    {
      icon: <Leaf className="h-6 w-6" />,
      title: "Bioregional Intelligence",
      description: "PostGIS-powered geographic zones with climate forecasting",
      link: "/bioregions",
      status: "Active"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Regenerative Agriculture",
      description: "Soil microbiome scoring and ecosystem recovery tracking",
      link: "/regenerative-agriculture",
      status: "Active"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Credit Valuation",
      description: "Mathematical trust engine with dynamic pricing",
      link: "/valuation",
      status: "Active"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Ethical Governance",
      description: "Indigenous-led councils with DAO-style voting",
      link: "/governance",
      status: "Active"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "RIU Marketplace",
      description: "$1.84B trading volume with regeneration-backed bonds",
      link: "/marketplace",
      status: "Active"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Health Integration",
      description: "Healthcare savings projections and air quality credits",
      link: "/health",
      status: "Active"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Global Outreach",
      description: "45+ languages with 850K+ students engaged",
      link: "/outreach",
      status: "Active"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Security & Transparency",
      description: "SHA-256 tamper-proof records with ML anomaly detection",
      link: "/security",
      status: "Active"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Adoption Pathway",
      description: "Six actor entry points with flywheel economics",
      link: "/adoption",
      status: "Active"
    }
  ];

  const stats = [
    { label: "RIUs in Circulation", value: "24.5M", change: "+12%" },
    { label: "Trading Volume", value: "$1.84B", change: "+28%" },
    { label: "Active Projects", value: "2,847", change: "+15%" },
    { label: "Carbon Sequestered", value: "156K tons", change: "+22%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Version 2.0.0 • Production Ready
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Atlas Genesis
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Regenerative Carbon Credit Marketplace Platform
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-3xl mx-auto">
            A comprehensive full-stack platform for managing, valuing, and trading 
            Regenerative Impact Units (RIUs) at a global scale. Combining cutting-edge 
            technology with deep ecological and ethical principles.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/marketplace">
                Explore Marketplace <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/measurements">View Live Data</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <Badge variant="secondary" className="mt-2">
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
            <p className="text-lg text-gray-600">
              Ten fully-integrated systems for regenerative impact at scale
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link to={feature.link}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                          {feature.icon}
                        </div>
                        <Badge variant="secondary">{feature.status}</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      Explore <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Atlas Sanctum Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-100 to-blue-100">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-6 w-6 text-purple-600" />
            <Badge variant="secondary">Advanced System</Badge>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Atlas Sanctum
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Civilizational operating layer spanning 6 evolutionary phases from 
            bioregional foundations to Type III Cosmic Regenerative Civilization
          </p>
          <Button asChild size="lg" variant="outline">
            <Link to="/sanctum">
              Explore Sanctum <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Production-Ready Technology
            </h2>
            <p className="text-lg text-gray-600">
              Built with modern, scalable technologies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Frontend</CardTitle>
                <CardDescription>React 18.3 + TypeScript + Vite</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Tailwind CSS + shadcn/ui</li>
                  <li>• React Query (TanStack)</li>
                  <li>• Framer Motion</li>
                  <li>• Recharts visualization</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Backend</CardTitle>
                <CardDescription>Express.js + Node.js + TypeScript</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PostgreSQL + PostGIS</li>
                  <li>• JWT Authentication</li>
                  <li>• 40+ API Endpoints</li>
                  <li>• WebSocket Support</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure</CardTitle>
                <CardDescription>Cloud-native deployment ready</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Vercel/Netlify frontend</li>
                  <li>• AWS/Heroku backend</li>
                  <li>• Supabase database</li>
                  <li>• Docker containerization</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Build a Regenerative Future?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the movement toward planetary regeneration through verified carbon credits
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/marketplace">Start Trading</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-green-600" asChild>
              <Link to="/measurements">View Documentation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
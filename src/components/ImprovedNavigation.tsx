import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Leaf, LogIn, LayoutDashboard, ChevronDown,
  ShoppingBag, Briefcase, Globe, BarChart3, TrendingUp, 
  Zap, Shield, Heart, Users, BookOpen, HelpCircle,
  Building, Factory, Sprout, Target, Award, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface NavigationItem {
  label: string;
  href?: string;
  icon?: any;
  description?: string;
  submenu?: NavigationItem[];
}

const ImprovedNavigation = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navigationStructure: Record<string, NavigationItem> = {
    platform: {
      label: 'Platform',
      submenu: [
        {
          label: 'Core Features',
          submenu: [
            { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag, description: 'Browse and purchase carbon credits' },
            { label: 'Portfolio', href: '/portfolio', icon: Briefcase, description: 'Track your carbon investments' },
            { label: 'Bioregions', href: '/bioregions', icon: Globe, description: 'Explore geographic impact zones' },
            { label: 'Measurements', href: '/measurements', icon: BarChart3, description: 'Real-time environmental data' }
          ]
        },
        {
          label: 'Analytics & Insights',
          submenu: [
            { label: 'Valuation Engine', href: '/valuation', icon: TrendingUp, description: 'Credit pricing and analysis' },
            { label: 'Transactions', href: '/transactions', icon: BarChart3, description: 'Complete transaction history' },
            { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Unified control center' }
          ]
        },
        {
          label: 'Advanced Systems',
          submenu: [
            { label: 'Architecture', href: '/architecture', icon: Building, description: 'Civilizational operating system' },
            { label: 'Role Dashboards', href: '/dashboards', icon: Users, description: 'Tailored user experiences' }
          ]
        }
      ]
    },
    solutions: {
      label: 'Solutions',
      submenu: [
        {
          label: 'By Use Case',
          submenu: [
            { label: 'Carbon Offsetting', href: '/offsetting', icon: Leaf, description: 'Neutralize your carbon footprint' },
            { label: 'Impact Investment', href: '/investment', icon: TrendingUp, description: 'Generate returns while doing good' },
            { label: 'Regulatory Compliance', href: '/compliance', icon: Shield, description: 'Meet sustainability requirements' }
          ]
        },
        {
          label: 'By Industry',
          submenu: [
            { label: 'Enterprise', href: '/enterprise', icon: Building, description: 'Large-scale carbon programs' },
            { label: 'SMB', href: '/smb', icon: Factory, description: 'Accessible sustainability solutions' },
            { label: 'Agriculture', href: '/agriculture', icon: Sprout, description: 'Regenerative farming credits' }
          ]
        }
      ]
    },
    impact: {
      label: 'Impact',
      submenu: [
        {
          label: 'Environmental',
          submenu: [
            { label: 'Regenerative Agriculture', href: '/regenerative-agriculture', icon: Sprout, description: 'Soil health and biodiversity' },
            { label: 'Renewable Energy', href: '/renewable-energy', icon: Zap, description: 'Clean energy transition projects' },
            { label: 'Ecosystem Health', href: '/health', icon: Heart, description: 'Human and planet wellness' }
          ]
        },
        {
          label: 'Governance',
          submenu: [
            { label: 'Community Governance', href: '/governance', icon: Users, description: 'Democratic decision-making' },
            { label: 'Security & Trust', href: '/security', icon: Shield, description: 'Blockchain verification' },
            { label: 'Global Adoption', href: '/adoption', icon: Globe, description: 'Worldwide scaling' }
          ]
        }
      ]
    },
    resources: {
      label: 'Resources',
      submenu: [
        {
          label: 'Learn',
          submenu: [
            { label: 'Documentation', href: '/docs', icon: BookOpen, description: 'Guides and API reference' },
            { label: 'Education Hub', href: '/education', icon: BookOpen, description: 'Carbon market education' },
            { label: 'Certifications', href: '/certifications', icon: Award, description: 'Standards and methodologies' }
          ]
        },
        {
          label: 'Support',
          submenu: [
            { label: 'Help Center', href: '/help', icon: HelpCircle, description: 'FAQs and troubleshooting' },
            { label: 'Contact Sales', href: '/contact', icon: Phone, description: 'Enterprise inquiries' }
          ]
        }
      ]
    }
  };

  const handleDropdownToggle = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const DropdownMenu: React.FC<{ items: NavigationItem[]; level: number }> = ({ items, level }) => (
    <div className={`${level === 0 ? 'absolute top-full left-0 mt-2 w-screen max-w-4xl z-50' : ''} bg-card border border-border/50 rounded-lg shadow-xl p-6`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.map((section, index) => (
          <div key={index}>
            <h3 className="font-semibold text-foreground mb-4">{section.label}</h3>
            <div className="space-y-3">
              {section.submenu?.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  to={item.href || '#'}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  onClick={() => setActiveDropdown(null)}
                >
                  {item.icon && <item.icon className="w-5 h-5 text-primary mt-0.5" />}
                  <div>
                    <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.label}
                    </div>
                    {item.description && (
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 sm:gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-ocean flex items-center justify-center shadow-glow">
              <Leaf className="w-4 sm:w-5 h-4 sm:h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-display text-base sm:text-xl font-semibold text-foreground">
                Atlas <span className="text-gradient">Sanctum</span>
              </span>
              <div className="hidden sm:flex items-center gap-1">
                <Badge variant="secondary" className="h-5 text-xs px-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <Award className="w-3 h-3 mr-1" />
                  Enterprise
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            className="hidden lg:flex items-center gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {Object.entries(navigationStructure).map(([key, item]) => (
              <div key={key} className="relative">
                <button
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                  onClick={() => handleDropdownToggle(key)}
                  onMouseEnter={() => setActiveDropdown(key)}
                >
                  {item.label}
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === key && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 z-50"
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <DropdownMenu items={item.submenu || []} level={0} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.nav>

          {/* Desktop CTA */}
          <motion.div 
            className="hidden lg:flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {user ? (
              <Button variant="hero" size="sm" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button variant="hero" size="sm" asChild>
                <Link to="/auth">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-foreground p-2 hover:bg-muted/50 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 sm:px-6 py-6">
              <div className="space-y-6">
                {Object.entries(navigationStructure).map(([key, section]) => (
                  <div key={key}>
                    <h3 className="font-semibold text-foreground mb-3">{section.label}</h3>
                    <div className="space-y-4 ml-4">
                      {section.submenu?.map((category, categoryIndex) => (
                        <div key={categoryIndex}>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">{category.label}</h4>
                          <div className="space-y-2 ml-4">
                            {category.submenu?.map((item, itemIndex) => (
                              <Link
                                key={itemIndex}
                                to={item.href || '#'}
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground py-2"
                                onClick={() => setIsOpen(false)}
                              >
                                {item.icon && <item.icon className="w-4 h-4" />}
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-border">
                  {user ? (
                    <Button variant="hero" asChild className="w-full">
                      <Link to="/dashboard">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="hero" asChild className="w-full">
                      <Link to="/auth">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default ImprovedNavigation;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Leaf, LogIn, LayoutDashboard, ChevronDown, Globe, Zap, Shield, 
  Users, TrendingUp, Award, Bell, Search, User, Settings, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

const CivilizationalHeader = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const platformItems = [
    { label: 'Marketplace', href: '/marketplace', icon: TrendingUp },
    { label: 'Portfolio', href: '/portfolio', icon: LayoutDashboard },
    { label: 'Bioregions', href: '/bioregions', icon: Globe },
    { label: 'Measurements', href: '/measurements', icon: Zap }
  ];

  const solutionItems = [
    { label: 'Enterprise', href: '/enterprise', icon: Users },
    { label: 'Agriculture', href: '/agriculture', icon: Leaf },
    { label: 'Renewable Energy', href: '/renewable-energy', icon: Zap },
    { label: 'Compliance', href: '/compliance', icon: Shield }
  ];

  const impactItems = [
    { label: 'Regenerative Agriculture', href: '/regenerative-agriculture', icon: Leaf },
    { label: 'Governance', href: '/governance', icon: Users },
    { label: 'Security', href: '/security', icon: Shield },
    { label: 'Health', href: '/health', icon: Award }
  ];

  const resourceItems = [
    { label: 'Documentation', href: '/docs', icon: HelpCircle },
    { label: 'Education', href: '/education', icon: Award },
    { label: 'Help Center', href: '/help', icon: HelpCircle },
    { label: 'Contact', href: '/contact', icon: Users }
  ];

  const DropdownMenu = ({ items, title }: { items: any[], title: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-full left-0 mt-2 w-64 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl p-4 z-50"
    >
      <h3 className="font-semibold text-foreground mb-3 text-sm">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            onClick={() => setActiveDropdown(null)}
          >
            <item.icon className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground group-hover:text-primary transition-colors">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-ocean to-emerald-500 flex items-center justify-center shadow-glow">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold text-foreground">
                Atlas <span className="text-gradient">Sanctum</span>
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="h-5 text-xs px-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <Globe className="w-3 h-3 mr-1" />
                  Civilizational OS
                </Badge>
                <Badge variant="secondary" className="h-5 text-xs px-2 bg-blue-500/10 text-blue-600 border-blue-500/20">
                  v2.0
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { key: 'platform', label: 'Platform', items: platformItems },
              { key: 'solutions', label: 'Solutions', items: solutionItems },
              { key: 'impact', label: 'Impact', items: impactItems },
              { key: 'resources', label: 'Resources', items: resourceItems }
            ].map(({ key, label, items }) => (
              <div key={key} className="relative">
                <button
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                  onMouseEnter={() => setActiveDropdown(key)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {label}
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === key && (
                    <div onMouseEnter={() => setActiveDropdown(key)} onMouseLeave={() => setActiveDropdown(null)}>
                      <DropdownMenu items={items} title={label} />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative">
              <Search className="w-4 h-4" />
            </Button>
            
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/auth">
                    <LogIn className="w-4 h-4 mr-2" />
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>

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
            <div className="container mx-auto px-4 py-6">
              <div className="space-y-6">
                {[
                  { title: 'Platform', items: platformItems },
                  { title: 'Solutions', items: solutionItems },
                  { title: 'Impact', items: impactItems },
                  { title: 'Resources', items: resourceItems }
                ].map(({ title, items }) => (
                  <div key={title}>
                    <h3 className="font-semibold text-foreground mb-3">{title}</h3>
                    <div className="space-y-2 ml-4">
                      {items.map((item, index) => (
                        <Link
                          key={index}
                          to={item.href}
                          className="flex items-center gap-3 text-muted-foreground hover:text-foreground py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-border space-y-3">
                  {user ? (
                    <Button variant="hero" asChild className="w-full">
                      <Link to="/dashboard">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="ghost" asChild className="w-full">
                        <Link to="/auth">Sign In</Link>
                      </Button>
                      <Button variant="hero" asChild className="w-full">
                        <Link to="/auth">
                          <LogIn className="w-4 h-4 mr-2" />
                          Get Started
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default CivilizationalHeader;
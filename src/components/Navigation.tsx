import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Leaf, LogIn, ShoppingBag, Briefcase, LayoutDashboard, Crown, Award, Zap, Shield, TrendingUp, Globe, Heart, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { name: "Measurements", href: "/measurements", icon: LayoutDashboard },
    { name: "Bioregions", href: "/bioregions", icon: Briefcase },
    { name: "Regeneration", href: "/regenerative-agriculture", icon: Award },
    { name: "Valuation", href: "/valuation", icon: TrendingUp },
    { name: "Governance", href: "/governance", icon: Crown },
    { name: "Health", href: "/health", icon: Heart },
    { name: "Outreach", href: "/outreach", icon: Globe },
    { name: "Security", href: "/security", icon: Shield },
    { name: "Adoption", href: "/adoption", icon: Zap },
    { name: "Architecture", href: "/architecture", icon: Network },
    { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Enterprise Innovations */}
          <motion.div
            className="flex items-center gap-2 sm:gap-3 min-w-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-ocean flex items-center justify-center shadow-glow flex-shrink-0">
              <Leaf className="w-4 sm:w-5 h-4 sm:h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-display text-base sm:text-xl font-semibold text-foreground truncate">
                  Atlas <span className="text-gradient hidden xs:inline">Sanctum</span>
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1 flex-wrap">
                <Badge variant="secondary" className="h-5 gap-1 text-xs px-1.5 sm:px-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 whitespace-nowrap">
                  <Award className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                  <span className="hidden sm:inline">Enterprise</span>
                </Badge>
                <Badge variant="secondary" className="h-5 gap-1 text-xs px-1.5 sm:px-2 bg-blue-500/10 text-blue-600 border-blue-500/20 whitespace-nowrap">
                  <Shield className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                  <span className="hidden sm:inline">Verified</span>
                </Badge>
                <Badge variant="secondary" className="h-5 gap-1 text-xs px-1.5 sm:px-2 bg-amber-500/10 text-amber-600 border-amber-500/20 whitespace-nowrap">
                  <Zap className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                  <span className="hidden sm:inline">Innovative</span>
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            className="hidden md:flex items-center gap-6 lg:gap-8 overflow-x-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-md px-2 py-1 transition-colors duration-300 font-medium whitespace-nowrap"
                aria-label={link.name}
              >
                <link.icon className="w-4 h-4" aria-hidden="true" />
                {link.name}
              </Link>
            ))}
          </motion.nav>

          {/* Desktop CTA */}
          <motion.div 
            className="hidden md:flex items-center gap-4"
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
            className="md:hidden text-foreground p-2 hover:bg-muted/50 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
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
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            <div className="container mx-auto px-4 sm:px-6 py-6 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg transition-colors py-3 px-2 font-medium"
                  onClick={() => setIsOpen(false)}
                  aria-label={link.name}
                >
                  <link.icon className="w-4 h-4" aria-hidden="true" />
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
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
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;

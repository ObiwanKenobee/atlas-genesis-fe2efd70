import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Leaf,
  LogIn,
  Search,
  Bell,
  Settings,
  Globe,
  Moon,
  Sun,
  ChevronDown,
  Home,
  Zap,
  Users,
  ShieldCheck,
  TrendingUp,
  Heart,
  BookOpen,
  Lock,
  Map,
  Sprout,
  User,
  HelpCircle,
  Phone,
  FileText,
  LogOut,
  Shield,
  BellRing,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const Header = () => {
  const { user, signOut } = useSupabaseAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const featureNavigation: NavSection[] = [
    {
      title: "Core Features",
      items: [
        {
          name: "Measurements",
          href: "/measurements",
          icon: <Zap className="w-4 h-4" />,
          description: "Satellite & sensor data verification",
        },
        {
          name: "Bioregions",
          href: "/bioregions",
          icon: <Map className="w-4 h-4" />,
          description: "Geographic & climate intelligence",
        },
        {
          name: "Regeneration",
          href: "/regenerative-agriculture",
          icon: <Sprout className="w-4 h-4" />,
          description: "Ecosystem recovery tracking",
        },
        {
          name: "Valuation",
          href: "/valuation",
          icon: <TrendingUp className="w-4 h-4" />,
          description: "Credit pricing engine",
        },
      ],
    },
    {
      title: "Governance & Impact",
      items: [
        {
          name: "Governance",
          href: "/governance",
          icon: <Users className="w-4 h-4" />,
          description: "Community councils & consent",
        },
        {
          name: "Health",
          href: "/health",
          icon: <Heart className="w-4 h-4" />,
          description: "Human health integration",
        },
        {
          name: "Security",
          href: "/security",
          icon: <ShieldCheck className="w-4 h-4" />,
          description: "Anti-fraud & transparency",
        },
        {
          name: "Adoption",
          href: "/adoption",
          icon: <Users className="w-4 h-4" />,
          description: "Global adoption pathways",
        },
      ],
    },
    {
      title: "Platform",
      items: [
        {
          name: "Marketplace",
          href: "/marketplace",
          icon: <Leaf className="w-4 h-4" />,
          description: "RIU trading & bonds",
        },
        {
          name: "Outreach",
          href: "/outreach",
          icon: <BookOpen className="w-4 h-4" />,
          description: "Education & multilingual",
        },
      ],
    },
  ];

  const platformLinks: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: <Home className="w-4 h-4"/> },
    { name: "Marketplace", href: "/marketplace", icon: <Leaf className="w-4 h-4"/> },
    { name: "Portfolio", href: "/portfolio", icon: <TrendingUp className="w-4 h-4"/> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-colors duration-300">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:inline-block p-2 bg-emerald-500 text-white rounded-md m-4">
        Skip to content
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between h-20 space-x-4 md:space-x-6">
          {/* Logo Section */}
          <motion.div
            className="flex items-center gap-3 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-bold text-lg text-foreground leading-tight">
                  Atlas <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">Sanctum</span>
                </div>
                <div className="text-xs text-muted-foreground ">Regenerative Platform</div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            role="navigation"
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Features Mega Menu */}
            <div
              className="relative group"
              onMouseEnter={() => setActiveMega("features")}
              onMouseLeave={() => setActiveMega(null)}
            >
              <button
                id="features-menu"
                aria-haspopup="true"
                aria-expanded={activeMega === "features"}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                Features
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </button>

              {/* Mega Menu Dropdown */}
              <AnimatePresence>
                {activeMega === "features" && (
                  <motion.div
                    className="absolute left-0 top-full mt-0 w-screen max-w-4xl bg-background border border-border rounded-xl shadow-2xl p-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="grid grid-cols-3 gap-8">
                      {featureNavigation.map((section) => (
                        <div key={section.title}>
                          <h3 className="font-semibold text-sm text-foreground mb-4">{section.title}</h3>
                          <div className="space-y-3">
                            {section.items.map((item) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                              >
                                <div className="mt-1 text-emerald-600 group-hover:text-emerald-700">{item.icon}</div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-foreground">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">{item.description}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Hubs Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setActiveDropdown("navigation")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                id="navigation-menu"
                aria-haspopup="true"
                aria-expanded={activeDropdown === "navigation"}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                Navigation
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </button>

              <AnimatePresence>
                {activeDropdown === "navigation" && (
                  <motion.div
                    className="absolute left-0 top-full mt-0 w-48 bg-background border border-border rounded-xl shadow-2xl p-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="space-y-1">
                      {platformLinks.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <div className="text-emerald-600 group-hover:text-emerald-700">{link.icon}</div>
                          <div className="font-medium text-sm text-foreground">{link.name}</div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Dropdown */}
            {user && (
              <div
                className="relative group"
                onMouseEnter={() => setActiveDropdown("user")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  id="user-menu"
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === "user"}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                  <User className="w-4 h-4" />
                  {user.user_metadata?.full_name || user.email}
                  <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                </button>

                <AnimatePresence>
                  {activeDropdown === "user" && (
                    <motion.div
                      className="absolute left-0 top-full mt-0 w-48 bg-background border border-border rounded-xl shadow-2xl p-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="space-y-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <User className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" />
                          <div className="font-medium text-sm text-foreground">Profile</div>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <Settings className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" />
                          <div className="font-medium text-sm text-foreground">Account Settings</div>
                        </Link>
                        <button
                          onClick={async () => {
                            await signOut();
                          }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group w-full text-left"
                        >
                          <LogOut className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" />
                          <div className="font-medium text-sm text-foreground">Logout</div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Settings Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setActiveDropdown("settings")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                id="settings-menu"
                aria-haspopup="true"
                aria-expanded={activeDropdown === "settings"}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                <Settings className="w-4 h-4" />
                Settings
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </button>

              <AnimatePresence>
                {activeDropdown === "settings" && (
                  <motion.div
                    className="absolute left-0 top-full mt-0 w-48 bg-background border border-border rounded-xl shadow-2xl p-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="space-y-1">
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <Settings className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" />
                        <div className="font-medium text-sm text-foreground">General</div>
                      </Link>
                      <Link
                        to="/settings/security"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <Shield className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" />
                        <div className="font-medium text-sm text-foreground">Security</div>
                      </Link>
                      <Link
                        to="/settings/notifications"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <BellRing className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" />
                        <div className="font-medium text-sm text-foreground">Notifications</div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Help Center Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setActiveDropdown("help")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                id="help-menu"
                aria-haspopup="true"
                aria-expanded={activeDropdown === "help"}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                <HelpCircle className="w-4 h-4" />
                Help
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </button>

              <AnimatePresence>
                {activeDropdown === "help" && (
                  <motion.div
                    className="absolute left-0 top-full mt-0 w-48 bg-background border border-border rounded-xl shadow-2xl p-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="space-y-1">
                      <Link
                        to="/help"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <HelpCircle className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" />
                        <div className="font-medium text-sm text-foreground">Help Center</div>
                      </Link>
                      <Link
                        to="/help/documentation"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <FileText className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" />
                        <div className="font-medium text-sm text-foreground">Documentation</div>
                      </Link>
                      <Link
                        to="/contact"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <Phone className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" />
                        <div className="font-medium text-sm text-foreground">Contact Support</div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Section */}
          <motion.div
            className="hidden lg:flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Search Bar */}
            <div className="relative hidden xl:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search features..."
                aria-label="Search features"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="pl-10 pr-4 py-2 rounded-lg bg-accent border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors group">
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              )}
            </button>

            {/* Language Selector */}
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              <Globe className="w-4 h-4" />
              EN
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Auth Section */}
            {!user && (
              <Button size="sm" asChild className="gap-2">
                <Link to="/auth">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            aria-label="Toggle mobile menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              role="navigation"
              aria-label="Mobile Navigation"
              className="lg:hidden pb-6 border-t border-border/50 bg-gradient-to-b from-background to-background/95"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="space-y-3 mt-4">
                {/* Mobile Search */}
                <div className="px-2 relative">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-accent border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Mobile Feature Links */}
                {featureNavigation.map((section) => (
                  <div key={section.title} className="px-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {section.title}
                    </h4>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Mobile Navigation Hubs */}
                <div className="px-2 border-t border-border/50 pt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Navigation
                  </h4>
                  <div className="space-y-1">
                    {platformLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.icon}
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile User Menu */}
                {user && (
                  <div className="px-2 border-t border-border/50 pt-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Account
                    </h4>
                    <div className="space-y-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Account Settings
                      </Link>
                      <button
                        onClick={async () => {
                          await signOut();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile Settings */}
                <div className="px-2 border-t border-border/50 pt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Settings
                  </h4>
                  <div className="space-y-1">
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      General
                    </Link>
                    <Link
                      to="/settings/security"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      Security
                    </Link>
                    <Link
                      to="/settings/notifications"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <BellRing className="w-4 h-4" />
                      Notifications
                    </Link>
                  </div>
                </div>

                {/* Mobile Help */}
                <div className="px-2 border-t border-border/50 pt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Help & Support
                  </h4>
                  <div className="space-y-1">
                    <Link
                      to="/help"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <HelpCircle className="w-4 h-4" />
                      Help Center
                    </Link>
                    <Link
                      to="/help/documentation"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <FileText className="w-4 h-4" />
                      Documentation
                    </Link>
                    <Link
                      to="/contact"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <Phone className="w-4 h-4" />
                      Contact Support
                    </Link>
                  </div>
                </div>

                {/* Mobile Auth */}
                {!user && (
                  <div className="px-2 border-t border-border/50 pt-4">
                    <Button size="sm" asChild className="w-full justify-center gap-2">
                      <Link to="/auth">
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;

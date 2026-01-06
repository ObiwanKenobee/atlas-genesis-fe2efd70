import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Leaf, Globe, Shield, Users, TrendingUp, Award, Mail, Phone, MapPin,
  Twitter, Linkedin, Github, Youtube, Instagram, Facebook, ExternalLink,
  Zap, Heart, BookOpen, HelpCircle, Building, Factory, Sprout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CivilizationalFooter = () => {
  const platformLinks = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Bioregions', href: '/bioregions' },
    { label: 'Measurements', href: '/measurements' },
    { label: 'Valuation', href: '/valuation' },
    { label: 'Dashboard', href: '/dashboard' }
  ];

  const solutionLinks = [
    { label: 'Enterprise', href: '/enterprise' },
    { label: 'SMB Solutions', href: '/smb' },
    { label: 'Agriculture', href: '/agriculture' },
    { label: 'Renewable Energy', href: '/renewable-energy' },
    { label: 'Compliance', href: '/compliance' },
    { label: 'Investment', href: '/investment' }
  ];

  const impactLinks = [
    { label: 'Regenerative Agriculture', href: '/regenerative-agriculture' },
    { label: 'Governance', href: '/governance' },
    { label: 'Security & Trust', href: '/security' },
    { label: 'Health Integration', href: '/health' },
    { label: 'Global Adoption', href: '/adoption' },
    { label: 'Education Hub', href: '/education' }
  ];

  const resourceLinks = [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api' },
    { label: 'Help Center', href: '/help' },
    { label: 'Certifications', href: '/certifications' },
    { label: 'Contact Sales', href: '/contact' },
    { label: 'Support', href: '/support' }
  ];

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/atlassanctum', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com/company/atlassanctum', label: 'LinkedIn' },
    { icon: Github, href: 'https://github.com/atlassanctum', label: 'GitHub' },
    { icon: Youtube, href: 'https://youtube.com/@atlassanctum', label: 'YouTube' },
    { icon: Instagram, href: 'https://instagram.com/atlassanctum', label: 'Instagram' }
  ];

  const stats = [
    { label: 'RIUs Traded', value: '24.5M+', icon: TrendingUp },
    { label: 'Trading Volume', value: '$1.84B', icon: Globe },
    { label: 'Active Projects', value: '2,847', icon: Leaf },
    { label: 'Global Users', value: '850K+', icon: Users }
  ];

  const certifications = [
    { label: 'ISO 14001', icon: Award },
    { label: 'Verra VCS', icon: Shield },
    { label: 'Gold Standard', icon: Award },
    { label: 'Climate Action Reserve', icon: Globe }
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-muted/20 border-t border-border/50">
      {/* Stats Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 rounded-xl bg-card/50 border border-border/30"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-ocean to-emerald-500 flex items-center justify-center shadow-glow">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-display text-xl font-bold text-foreground">
                  Atlas <span className="text-gradient">Sanctum</span>
                </div>
                <div className="text-xs text-muted-foreground">Civilizational OS</div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Building the regenerative future through verified carbon credits, 
              ecosystem restoration, and community-driven climate action.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                Global Operations
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                hello@atlassanctum.com
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </div>
            </div>

            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Platform
            </h3>
            <ul className="space-y-3">
              {platformLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Solutions
            </h3>
            <ul className="space-y-3">
              {solutionLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Impact Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Impact
            </h3>
            <ul className="space-y-3">
              {impactLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Resources
            </h3>
            <ul className="space-y-3">
              {resourceLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-12">
          <h3 className="font-semibold text-foreground mb-4 text-center">Certifications & Standards</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {certifications.map((cert, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-4 py-2 bg-muted/30 border-border/50"
              >
                <cert.icon className="w-4 h-4 mr-2" />
                {cert.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-primary/5 to-ocean/5 rounded-2xl p-8 mb-12 text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Join the Regenerative Revolution
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get updates on new projects, market insights, and platform features.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button variant="hero">
              Subscribe
              <Mail className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
            <span>© 2026 Atlas Sanctum. All rights reserved.</span>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <Globe className="w-3 h-3 mr-1" />
              Carbon Neutral
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Shield className="w-3 h-3 mr-1" />
              SOC 2 Compliant
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CivilizationalFooter;
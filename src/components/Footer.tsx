import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Instagram,
  Send,
  ArrowRight,
  Globe,
  Shield,
  BookOpen,
  Users,
  Zap,
  Heart,
  Lock,
  Map,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ApiStatus from "@/components/ApiStatus";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [ussdMode, setUssdMode] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeStatus("loading");
    setTimeout(() => {
      setSubscribeStatus("success");
      setEmail("");
      setTimeout(() => setSubscribeStatus("idle"), 3000);
    }, 1000);
  };

  const featureLinks = [
    { name: "Measurements", href: "/measurements", icon: <Zap className="w-4 h-4" /> },
    { name: "Bioregions", href: "/bioregions", icon: <Map className="w-4 h-4" /> },
    { name: "Regeneration", href: "/regenerative-agriculture", icon: <Sprout className="w-4 h-4" /> },
    { name: "Valuation", href: "/valuation", icon: <TrendingUp className="w-4 h-4" /> },
    { name: "Governance", href: "/governance", icon: <Users className="w-4 h-4" /> },
    { name: "Health", href: "/health", icon: <Heart className="w-4 h-4" /> },
    { name: "Outreach", href: "/outreach", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Security", href: "/security", icon: <Shield className="w-4 h-4" /> },
  ];

  const platformLinks = [
    { name: "Marketplace", href: "/marketplace" },
    { name: "Adoption", href: "/adoption" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Portfolio", href: "/portfolio" },
  ];

  const resourceLinks = [
    { name: "API Documentation", href: "/help/documentation" },
    { name: "Impact Guides", href: "#" },
    { name: "Community Forum", href: "#" },
    { name: "Case Studies", href: "#" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "/help" },
    { name: "Contact Support", href: "/contact" },
    { name: "Documentation", href: "/help/documentation" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Cookie Policy", href: "#" },
    { name: "Accessibility Statement", href: "#" },
  ];

  const companyLinks = [
    { name: "About Atlas", href: "#" },
    { name: "Join Our Team", href: "#" },
    { name: "Media Kit", href: "#" },
    { name: "Get in Touch", href: "#" },
  ];

  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, href: "https://x.com/Atlasanctum", label: "Twitter" },
    { icon: <Facebook className="w-5 h-5" />, href: "https://web.facebook.com/atlasanctum", label: "Facebook" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" },
    { icon: <Github className="w-5 h-5" />, href: "https://github.com/atlasanctum", label: "GitHub" },
    { icon: <Instagram className="w-5 h-5" />, href: "", label: "https://www.instagram.com/atlasanctum/" },
  ];

  return (
    <footer className="bg-regenerative border-t border-border/30 relative glass-panel">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-border/30">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold text-foreground mb-2">Stay Updated</h3>
            <p className="text-muted-foreground mb-6">Get the latest regenerative impact updates delivered to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-3 flex-col sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address for newsletter subscription"
                className="flex-1 px-4 py-3 rounded-lg bg-slate-900/50 border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <Button
                type="submit"
                disabled={subscribeStatus === "loading"}
                className="gap-2 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                aria-label="Subscribe to newsletter"
              >
                {subscribeStatus === "loading" ? (
                  <span aria-live="polite">Subscribing...</span>
                ) : subscribeStatus === "success" ? (
                  <span aria-live="polite">✓ Subscribed!</span>
                ) : (
                  <>
                    Subscribe <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Contact */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="font-bold text-lg text-foreground">
                  Atlas <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Sanctum</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              The world's first regenerative platform uniting ecosystems for trillion-dollar impact.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a href="mailto:hello@atlassanctum.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>hello@atlassanctum.com</span>
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>+1 (234) 567-890</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>San Francisco, CA<br />United States</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const href = social.href || "#";
                const isExternal = href && href.startsWith("http");
                const isValid = href && href !== "#";
                return isValid ? (
                  <a
                    key={`social-${social.label}-${index}`}
                    href={href}
                    aria-label={social.label}
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="p-2 rounded-lg bg-slate-900/50 text-muted-foreground hover:text-emerald-400 hover:bg-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    {social.icon}
                  </a>
                ) : null;
              })}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
              Features
            </h4>
            <ul className="space-y-3">
              {featureLinks.slice(0, 4).map((link) => (
                <li key={`feature-${link.name}`}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-400 transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <span className="text-emerald-600 group-hover:text-emerald-400 transition-colors duration-200">
                      {link.icon}
                    </span>
                    {link.name}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-200" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          {/* More Features */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">More Features</h4>
            <ul className="space-y-3">
              {featureLinks.slice(4).map((link) => (
                <li key={`feature-${link.name}`}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-400 transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <span className="text-emerald-600 group-hover:text-emerald-400 transition-colors duration-200">{link.icon}</span>
                    {link.name}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-200" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3 mb-6">
              {platformLinks.map((link) => (
                <li key={`platform-${link.name}`}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    {link.name}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-200" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Resources</h4>
             <ul className="space-y-3">
               {resourceLinks.map((link) => (
                 <li key={`resource-${link.name}`}>
                   <Link
                     to={link.href}
                     className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                   >
                     {link.name}
                     <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-200" aria-hidden="true" />
                   </Link>
                 </li>
               ))}
             </ul>

             <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider mt-6">Support</h4>
             <ul className="space-y-3">
               {supportLinks.map((link) => (
                 <li key={`support-${link.name}`}>
                   <Link
                     to={link.href}
                     className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                   >
                     {link.name}
                     <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-200" aria-hidden="true" />
                   </Link>
                 </li>
               ))}
             </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3 mb-6">
              {legalLinks.map((link) => (
                <li key={`legal-${link.name}`}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    {link.name}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-200" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={`company-${link.name}`}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    {link.name}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-200" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>© 2025 Atlas Sanctum. All rights reserved.</p>
            <p className="mt-1">Regenerating Earth's future through verified, ethical impact.</p>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ApiStatus showLabel />
            </div>
            <a href="/contact" className="hover:text-emerald-400 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
              <Globe className="w-3 h-3" aria-hidden="true" />
              Global Network
            </a>
            <a href="/security" className="hover:text-emerald-400 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
              <Lock className="w-3 h-3" aria-hidden="true" />
              Enterprise Security
            </a>
          </div>
           

          {/* Language & Theme */}
          <div className="flex items-center gap-4">
            <select 
              className="px-3 py-2 rounded-lg bg-slate-900/50 border border-border/30 text-xs text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
              aria-label="Select language"
              title="Select language"
            >
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
              <option>中文</option>
            </select>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="py-8 border-t border-border/30 text-center">
          <div className="inline-block">
            <p className="text-sm text-muted-foreground mb-3">Ready to join the regeneration?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                <Link to="/auth" className="focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                  Start Free <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                <Link to="/contact" className="focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                  Talk to Sales
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

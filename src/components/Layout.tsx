import React from "react";
import { Link } from "react-router-dom";

/* ============================
   HEADER
============================ */
const Header: React.FC = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10">
      {/* Announcement Bar */}
      <div className="bg-emerald-600 text-white text-sm text-center py-2 px-4">
        🌱 Join the regenerative revolution — Explore verified global impact projects
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg">
            🌱
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold text-white tracking-tight">
              Atlas <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Sanctum</span>
            </div>
            <div className="text-[11px] uppercase tracking-widest text-slate-400">
              Regenerative Platform
            </div>
          </div>
        </Link>

        {/* Primary Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link className="hover:text-white transition" to="/measurements">Platform</Link>
          <Link className="hover:text-white transition" to="/marketplace">Marketplace</Link>
          <Link className="hover:text-white transition" to="/business-model">Business</Link>
          <Link className="hover:text-white transition" to="/innovations">Innovations</Link>
          <Link className="hover:text-white transition" to="/engineering-architecture">Engineering</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/auth"
            className="hidden sm:inline text-sm text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>

          <Link
            to="/auth"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-400 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};

/* ============================
   FOOTER
============================ */
const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Top Grid */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="text-xl font-bold text-white mb-4">Atlas Sanctum</div>
            <p className="text-slate-400 max-w-md mb-6">
              The world’s first regenerative platform uniting ecosystems, capital,
              and communities for trillion‑dollar verified impact.
            </p>
            <div className="text-sm text-slate-400 space-y-1">
              <div>hello@atlassanctum.com</div>
              <div>San Francisco, CA • United States</div>
            </div>
          </div>

          {/* Footer Columns */}
          {[
            {
              title: "Platform",
              links: [
                ["Marketplace", "/marketplace"],
                ["Dashboard", "/dashboard"],
                ["Adoption", "/adoption"],
                ["Health", "/health"],
              ],
            },
            {
              title: "Architecture",
              links: [
                ["Ethical Governance", "/ethical-governance"],
                ["Value Exchange", "/regenerative-value-exchange"],
                ["Data Metrics", "/data-metrics-engine"],
                ["Impact Economy", "/global-impact-economy"],
              ],
            },
            {
              title: "Resources",
              links: [
                ["Business Model", "/business-model"],
                ["Innovations", "/innovations"],
                ["Azure Strategy", "/azure-strategy"],
                ["User Experience", "/end-to-end-experience"],
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
                {section.title}
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                {section.links.map(([label, href]) => (
                  <li key={href}>
                    <Link to={href} className="hover:text-white transition">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-400">
            © 2025 Atlas Sanctum. All rights reserved.
          </div>
          <div className="text-sm text-slate-400">
            Regenerating Earth’s future through verified ethical impact.
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ============================
   LAYOUT
============================ */
interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed top-2 left-2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-md"
      >
        Skip to content
      </a>

      <Header />

      <main id="main-content" className="pt-28">
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;

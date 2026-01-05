import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Leaf } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-white">
                Atlas <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Sanctum</span>
              </div>
              <div className="text-xs text-slate-400">Regenerative Platform</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Platform</Link>
            <Link to="/marketplace" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Solutions</Link>
            <Link to="/measurements" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Impact</Link>
            <Link to="/outreach" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Resources</Link>
            <Link to="/profile" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Dashboard</Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Sign In</Link>
            <Link to="/marketplace" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-700/50">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-slate-300 hover:text-emerald-400 transition-colors py-2" onClick={() => setIsOpen(false)}>Platform</Link>
              <Link to="/marketplace" className="text-slate-300 hover:text-emerald-400 transition-colors py-2" onClick={() => setIsOpen(false)}>Solutions</Link>
              <Link to="/measurements" className="text-slate-300 hover:text-emerald-400 transition-colors py-2" onClick={() => setIsOpen(false)}>Impact</Link>
              <Link to="/outreach" className="text-slate-300 hover:text-emerald-400 transition-colors py-2" onClick={() => setIsOpen(false)}>Resources</Link>
              <Link to="/profile" className="text-slate-300 hover:text-emerald-400 transition-colors py-2" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <div className="pt-4 border-t border-slate-700/50">
                <Link to="/auth" className="block text-slate-300 hover:text-emerald-400 transition-colors py-2 mb-3" onClick={() => setIsOpen(false)}>Sign In</Link>
                <Link to="/marketplace" className="block px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-center" onClick={() => setIsOpen(false)}>
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 py-2 text-center">
          <span className="text-sm text-slate-300">Regenerative Value Exchange • Powered by AI & Blockchain</span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

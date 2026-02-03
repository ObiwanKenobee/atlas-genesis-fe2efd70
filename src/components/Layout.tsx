import React from 'react';
import EnterpriseHeader from './EnterpriseHeader';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => (
  <div className="font-display bg-slate-900 text-white">
    <EnterpriseHeader />
    <main className="pt-24">
      {children}
    </main>
    {showFooter && <Footer />}
  </div>
);

export default Layout;
import React from 'react';
import { Helmet } from 'react-helmet-async';

const SimplePage = ({ title, description }: { title: string; description: string }) => (
  <>
    <Helmet><title>{title} - Atlas Sanctum</title></Helmet>
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  </>
);

export const Settings = () => <SimplePage title="Settings" description="Manage your account settings and preferences." />;
export const Profile = () => <SimplePage title="Profile" description="View and edit your profile information." />;
export const HelpCenter = () => <SimplePage title="Help Center" description="Find answers to frequently asked questions." />;
export const Contact = () => <SimplePage title="Contact" description="Get in touch with our support team." />;
export const ReportsAnalytics = () => <SimplePage title="Reports & Analytics" description="Detailed reports and analytics dashboard." />;
export const DashboardOverview = () => <SimplePage title="Dashboard Overview" description="Overview of your Atlas Sanctum activity." />;
export const PrivacyPolicy = () => <SimplePage title="Privacy Policy" description="Our commitment to protecting your privacy." />;
export const TermsOfService = () => <SimplePage title="Terms of Service" description="Terms and conditions for using Atlas Sanctum." />;

export default Settings;
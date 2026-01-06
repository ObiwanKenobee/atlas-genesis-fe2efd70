import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminPage = ({ title, description }: { title: string; description: string }) => (
  <div className="min-h-screen bg-background pt-24">
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

export const AdminLayout = () => (
  <div className="min-h-screen bg-background pt-24">
    <div className="container mx-auto px-4">
      <Outlet />
    </div>
  </div>
);

export const AdminOverview = () => <AdminPage title="Admin Overview" description="Administrative dashboard and system overview." />;
export const AdminProjects = () => <AdminPage title="Project Management" description="Manage and review carbon credit projects." />;
export const AdminTransactions = () => <AdminPage title="Transaction Management" description="Monitor and manage platform transactions." />;
export const AdminAnalytics = () => <AdminPage title="Analytics Dashboard" description="Platform analytics and performance metrics." />;
export const UserManagement = () => <AdminPage title="User Management" description="Manage user accounts and permissions." />;

export default AdminLayout;
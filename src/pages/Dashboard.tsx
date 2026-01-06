import React from 'react';
import { Helmet } from 'react-helmet-async';

const Dashboard = () => (
  <>
    <Helmet><title>Dashboard - Atlas Sanctum</title></Helmet>
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Atlas Sanctum dashboard.</p>
      </div>
    </div>
  </>
);

export default Dashboard;
import React from 'react';
import { Helmet } from 'react-helmet-async';

export const Onboarding = () => (
  <>
    <Helmet><title>Onboarding - Atlas Sanctum</title></Helmet>
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Welcome to Atlas Sanctum</h1>
        <p className="text-muted-foreground">Let's get you started with regenerative impact.</p>
      </div>
    </div>
  </>
);

export const Marketplace = () => (
  <>
    <Helmet><title>Marketplace - Atlas Sanctum</title></Helmet>
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Carbon Credit Marketplace</h1>
        <p className="text-muted-foreground">Discover verified regenerative projects.</p>
      </div>
    </div>
  </>
);

export const ProjectDetail = () => (
  <>
    <Helmet><title>Project Details - Atlas Sanctum</title></Helmet>
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Project Details</h1>
        <p className="text-muted-foreground">Detailed project information and verification.</p>
      </div>
    </div>
  </>
);

export const Portfolio = () => (
  <>
    <Helmet><title>Portfolio - Atlas Sanctum</title></Helmet>
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Your Portfolio</h1>
        <p className="text-muted-foreground">Track your regenerative impact investments.</p>
      </div>
    </div>
  </>
);

export const Pricing = () => (
  <>
    <Helmet><title>Pricing - Atlas Sanctum</title></Helmet>
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Pricing Plans</h1>
        <p className="text-muted-foreground">Choose the right plan for your impact goals.</p>
      </div>
    </div>
  </>
);

export const NotFound = () => (
  <>
    <Helmet><title>Page Not Found - Atlas Sanctum</title></Helmet>
    <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-muted-foreground mb-8">Page not found</p>
        <a href="/" className="text-primary hover:underline">Return Home</a>
      </div>
    </div>
  </>
);

export default Onboarding;
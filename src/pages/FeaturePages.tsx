import React from 'react';
import { Helmet } from 'react-helmet-async';

const FeaturePage = ({ title, description }: { title: string; description: string }) => (
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

export const Transactions = () => <FeaturePage title="Transactions" description="View your transaction history and carbon credit purchases." />;
export const Measurements = () => <FeaturePage title="Measurements" description="Real-time environmental data and satellite verification." />;
export const Bioregions = () => <FeaturePage title="Bioregions" description="Explore geographic impact zones and ecosystem health." />;
export const RegenerativeAgriculture = () => <FeaturePage title="Regenerative Agriculture" description="Soil carbon sequestration and biodiversity projects." />;
export const Valuation = () => <FeaturePage title="Valuation" description="Credit pricing and market analysis tools." />;
export const Governance = () => <FeaturePage title="Governance" description="Community-driven decision making and proposals." />;
export const Health = () => <FeaturePage title="Health" description="Human and planetary health integration." />;
export const Outreach = () => <FeaturePage title="Outreach" description="Education and global adoption initiatives." />;
export const Security = () => <FeaturePage title="Security" description="Blockchain verification and trust systems." />;
export const Adoption = () => <FeaturePage title="Adoption" description="Global scaling and adoption pathways." />;

export default Transactions;
import React from 'react';
import { Helmet } from 'react-helmet-async';

const InfraPage = ({ title, description }: { title: string; description: string }) => (
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

export const CarbonOffsetting = () => <InfraPage title="Carbon Offsetting" description="Neutralize your carbon footprint with verified credits." />;
export const ImpactInvestment = () => <InfraPage title="Impact Investment" description="Generate returns while creating positive impact." />;
export const RegulatoryCompliance = () => <InfraPage title="Regulatory Compliance" description="Meet sustainability requirements and standards." />;
export const EnterpriseSolutions = () => <InfraPage title="Enterprise Solutions" description="Large-scale carbon programs for enterprises." />;
export const SMBSolutions = () => <InfraPage title="SMB Solutions" description="Accessible sustainability solutions for small businesses." />;
export const AgricultureSolutions = () => <InfraPage title="Agriculture Solutions" description="Regenerative farming and soil carbon credits." />;
export const RenewableEnergy = () => <InfraPage title="Renewable Energy" description="Clean energy transition projects and credits." />;
export const EducationHub = () => <InfraPage title="Education Hub" description="Learn about carbon markets and sustainability." />;
export const Certifications = () => <InfraPage title="Certifications" description="Standards and methodologies for carbon credits." />;

export default CarbonOffsetting;
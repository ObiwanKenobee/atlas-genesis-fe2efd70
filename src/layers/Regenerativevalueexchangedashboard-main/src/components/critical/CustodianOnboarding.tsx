import { useState } from 'react';
import { Users, Shield, FileCheck, Award, Building, Globe, Upload, CheckCircle2 } from 'lucide-react';

type OnboardingStep = 'type' | 'organization' | 'verification' | 'expertise' | 'commitment';

interface CustodianData {
  type: 'indigenous' | 'cooperative' | 'ngo' | 'research' | 'government';
  orgName: string;
  legalName: string;
  registrationNumber: string;
  country: string;
  region: string;
  founded: string;
  website: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  expertise: string[];
  pastProjects: string;
  teamSize: string;
  certifications: string[];
  references: string;
}

export function CustodianOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('type');
  const [formData, setFormData] = useState<CustodianData>({
    type: 'indigenous',
    orgName: '',
    legalName: '',
    registrationNumber: '',
    country: '',
    region: '',
    founded: '',
    website: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    expertise: [],
    pastProjects: '',
    teamSize: '',
    certifications: [],
    references: ''
  });

  const custodianTypes = [
    {
      id: 'indigenous' as const,
      label: 'Indigenous Community',
      icon: Users,
      description: 'Traditional land stewards and cultural knowledge holders',
      color: 'emerald'
    },
    {
      id: 'cooperative' as const,
      label: 'Community Cooperative',
      icon: Building,
      description: 'Locally-owned collective organizations',
      color: 'blue'
    },
    {
      id: 'ngo' as const,
      label: 'Conservation NGO',
      icon: Globe,
      description: 'Non-profit environmental organizations',
      color: 'amber'
    },
    {
      id: 'research' as const,
      label: 'Research Institution',
      icon: Award,
      description: 'Academic and scientific organizations',
      color: 'purple'
    },
    {
      id: 'government' as const,
      label: 'Government Agency',
      icon: Shield,
      description: 'Public sector environmental bodies',
      color: 'cyan'
    }
  ];

  const expertiseAreas = [
    'Forest Restoration',
    'Wetland Conservation',
    'Soil Regeneration',
    'Marine Protection',
    'Biodiversity Monitoring',
    'Carbon Sequestration',
    'Water Management',
    'Traditional Ecological Knowledge',
    'Community Development',
    'Indigenous Rights',
    'Agroforestry',
    'Wildlife Protection'
  ];

  const handleExpertiseToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(area)
        ? prev.expertise.filter(e => e !== area)
        : [...prev.expertise, area]
    }));
  };

  const handleSubmit = () => {
    console.log('Submitting custodian application:', formData);
    alert('Application submitted! Our verification team will review your submission within 5-7 business days.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white">Become a Verified Custodian</h2>
            <p className="text-emerald-300/80">Join the network of trusted regenerative stewards</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-emerald-300/70 text-sm">Application Progress</span>
          <span className="text-emerald-400">
            {currentStep === 'type' ? '20%' : currentStep === 'organization' ? '40%' : currentStep === 'verification' ? '60%' : currentStep === 'expertise' ? '80%' : '100%'}
          </span>
        </div>
        <div className="h-2 bg-emerald-900/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ 
              width: currentStep === 'type' ? '20%' : currentStep === 'organization' ? '40%' : currentStep === 'verification' ? '60%' : currentStep === 'expertise' ? '80%' : '100%' 
            }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        {/* Step 1: Custodian Type */}
        {currentStep === 'type' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white mb-2">Select Custodian Type</h3>
              <p className="text-emerald-300/70 text-sm">Choose the category that best describes your organization</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {custodianTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-emerald-500/20 bg-emerald-900/10 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br from-${type.color}-500 to-${type.color}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white mb-1">{type.label}</h4>
                        <p className="text-emerald-300/70 text-sm">{type.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Organization Information */}
        {currentStep === 'organization' && (
          <div className="space-y-6">
            <h3 className="text-white mb-4">Organization Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-emerald-300/70 text-sm mb-2 block">Organization Name *</label>
                <input
                  type="text"
                  value={formData.orgName}
                  onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                  placeholder="Common name of your organization"
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Legal/Registered Name *</label>
                <input
                  type="text"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  placeholder="Official registered name"
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Registration Number</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="Legal registration ID"
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Country *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Country of operation"
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Primary Region *</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="State/Province/Territory"
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Year Founded</label>
                <input
                  type="text"
                  value={formData.founded}
                  onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                  placeholder="e.g., 2015"
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourwebsite.org"
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-500/20">
              <h4 className="text-white mb-4">Primary Contact Person</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-emerald-300/70 text-sm mb-2 block">Full Name *</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Contact person name"
                    className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="text-emerald-300/70 text-sm mb-2 block">Email *</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="contact@organization.org"
                    className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="text-emerald-300/70 text-sm mb-2 block">Phone *</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Verification Documents */}
        {currentStep === 'verification' && (
          <div className="space-y-6">
            <h3 className="text-white mb-4">Verification Documents</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-900/20 border-2 border-dashed border-emerald-500/30 rounded-lg p-6 text-center hover:border-emerald-500/50 transition-all cursor-pointer">
                <FileCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-white mb-1">Legal Registration</p>
                <p className="text-emerald-300/70 text-sm mb-3">Upload incorporation docs</p>
                <button className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-all">
                  Choose File
                </button>
              </div>

              <div className="bg-emerald-900/20 border-2 border-dashed border-emerald-500/30 rounded-lg p-6 text-center hover:border-emerald-500/50 transition-all cursor-pointer">
                <Shield className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-white mb-1">Identity Verification</p>
                <p className="text-emerald-300/70 text-sm mb-3">Director/Leader ID</p>
                <button className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-all">
                  Choose File
                </button>
              </div>

              <div className="bg-emerald-900/20 border-2 border-dashed border-emerald-500/30 rounded-lg p-6 text-center hover:border-emerald-500/50 transition-all cursor-pointer">
                <Award className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-white mb-1">Certifications</p>
                <p className="text-emerald-300/70 text-sm mb-3">Relevant credentials</p>
                <button className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-all">
                  Choose Files
                </button>
              </div>

              <div className="bg-emerald-900/20 border-2 border-dashed border-emerald-500/30 rounded-lg p-6 text-center hover:border-emerald-500/50 transition-all cursor-pointer">
                <Upload className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-white mb-1">Supporting Documents</p>
                <p className="text-emerald-300/70 text-sm mb-3">Additional materials</p>
                <button className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-all">
                  Choose Files
                </button>
              </div>
            </div>

            <div>
              <label className="text-emerald-300/70 text-sm mb-2 block">Team Size</label>
              <select 
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/40"
              >
                <option value="">Select team size</option>
                <option>1-5 members</option>
                <option>6-20 members</option>
                <option>21-50 members</option>
                <option>51-200 members</option>
                <option>200+ members</option>
              </select>
            </div>

            <div>
              <label className="text-emerald-300/70 text-sm mb-2 block">Professional References</label>
              <textarea
                value={formData.references}
                onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                placeholder="List contact information for 2-3 professional references who can vouch for your organization's work"
                rows={4}
                className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
              />
            </div>
          </div>
        )}

        {/* Step 4: Expertise & Experience */}
        {currentStep === 'expertise' && (
          <div className="space-y-6">
            <h3 className="text-white mb-4">Expertise & Experience</h3>
            
            <div>
              <label className="text-emerald-300/70 text-sm mb-3 block">Areas of Expertise (Select all that apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {expertiseAreas.map((area) => (
                  <label
                    key={area}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.expertise.includes(area)
                        ? 'bg-emerald-500/20 border-emerald-500/50'
                        : 'bg-emerald-900/10 border-emerald-500/20 hover:border-emerald-500/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.expertise.includes(area)}
                      onChange={() => handleExpertiseToggle(area)}
                      className="w-4 h-4 text-emerald-500 bg-emerald-900/20 border-emerald-500/30 rounded focus:ring-emerald-500"
                    />
                    <span className="text-white text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-emerald-300/70 text-sm mb-2 block">Past Projects & Achievements</label>
              <textarea
                value={formData.pastProjects}
                onChange={(e) => setFormData({ ...formData, pastProjects: e.target.value })}
                placeholder="Describe your organization's most significant past projects, achievements, and impact metrics. Include quantifiable results where possible."
                rows={6}
                className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
              />
            </div>
          </div>
        )}

        {/* Step 5: Commitment */}
        {currentStep === 'commitment' && (
          <div className="space-y-6">
            <h3 className="text-white mb-4">Custodian Commitment</h3>
            
            <div className="bg-emerald-900/20 rounded-lg p-6 space-y-4">
              <h4 className="text-white mb-3">As a Verified Custodian, you agree to:</h4>
              
              {[
                'Uphold the highest standards of environmental and social stewardship',
                'Provide accurate and timely impact reporting through approved verification methods',
                'Maintain transparency in all operations and financial dealings',
                'Respect indigenous rights and traditional knowledge',
                'Participate actively in RVE governance and community initiatives',
                'Comply with all applicable environmental and social regulations',
                'Submit to regular third-party audits and verification processes'
              ].map((commitment, idx) => (
                <label key={idx} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-emerald-500 bg-emerald-900/20 border-emerald-500/30 rounded focus:ring-emerald-500 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-emerald-300/80 text-sm">{commitment}</span>
                </label>
              ))}
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-amber-400 mb-1">Code of Conduct</h4>
                  <p className="text-emerald-300/80 text-sm mb-3">
                    All custodians must adhere to the RVE Code of Conduct, which prioritizes ecological 
                    integrity, social justice, and regenerative practices above profit.
                  </p>
                  <button className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
                    Read Full Code of Conduct →
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900/20 rounded-lg p-6">
              <h4 className="text-white mb-4">Application Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-emerald-300/70 mb-1">Organization</div>
                  <div className="text-white">{formData.orgName || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 mb-1">Type</div>
                  <div className="text-white capitalize">{formData.type.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 mb-1">Location</div>
                  <div className="text-white">{formData.region}, {formData.country || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 mb-1">Expertise Areas</div>
                  <div className="text-white">{formData.expertise.length} selected</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-emerald-500/20">
          {currentStep !== 'type' && (
            <button
              onClick={() => {
                const steps: OnboardingStep[] = ['type', 'organization', 'verification', 'expertise', 'commitment'];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex > 0) setCurrentStep(steps[currentIndex - 1]);
              }}
              className="px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all"
            >
              Previous
            </button>
          )}
          
          {currentStep === 'commitment' ? (
            <button
              onClick={handleSubmit}
              className="ml-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all"
            >
              Submit Application
            </button>
          ) : (
            <button
              onClick={() => {
                const steps: OnboardingStep[] = ['type', 'organization', 'verification', 'expertise', 'commitment'];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex < steps.length - 1) setCurrentStep(steps[currentIndex + 1]);
              }}
              className="ml-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

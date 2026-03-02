import { useState } from 'react';
import { Plus, Upload, MapPin, Calendar, DollarSign, Check, AlertCircle, FileText, Image } from 'lucide-react';

type AssetCategory = 'environmental' | 'health' | 'cultural' | 'ecosystem';
type IssuanceStep = 'details' | 'documentation' | 'verification' | 'pricing' | 'review';

interface AssetFormData {
  name: string;
  category: AssetCategory;
  description: string;
  location: string;
  size: string;
  expectedImpact: string;
  duration: string;
  custodianId: string;
  totalSupply: string;
  pricePerUnit: string;
  documents: File[];
  images: File[];
}

export function AssetIssuance() {
  const [currentStep, setCurrentStep] = useState<IssuanceStep>('details');
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    category: 'environmental',
    description: '',
    location: '',
    size: '',
    expectedImpact: '',
    duration: '',
    custodianId: '',
    totalSupply: '',
    pricePerUnit: '',
    documents: [],
    images: []
  });

  const steps: { id: IssuanceStep; label: string; icon: any }[] = [
    { id: 'details', label: 'Project Details', icon: FileText },
    { id: 'documentation', label: 'Documentation', icon: Upload },
    { id: 'verification', label: 'Verification Plan', icon: Check },
    { id: 'pricing', label: 'Pricing & Supply', icon: DollarSign },
    { id: 'review', label: 'Review & Submit', icon: AlertCircle },
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const handleSubmit = () => {
    console.log('Submitting asset:', formData);
    // API call would go here
    alert('Asset submitted for verification! You will receive updates on the review process.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white">Issue New Regenerative Asset</h2>
            <p className="text-emerald-300/80">Create tokenized assets backed by verified regenerative impact</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < getCurrentStepIndex();
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30' 
                      : isCompleted
                      ? 'bg-emerald-500/30 text-emerald-400'
                      : 'bg-emerald-900/20 text-emerald-400/50'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`mt-2 text-sm ${
                    isActive ? 'text-emerald-400' : isCompleted ? 'text-emerald-400/70' : 'text-emerald-400/50'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-emerald-500/20'
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-emerald-900/10 rounded-lg p-6 min-h-[400px]">
          {/* Step 1: Project Details */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              <h3 className="text-white mb-4">Project Details</h3>
              
              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Asset Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Amazon Rainforest Carbon Credits 2025"
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Asset Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/40"
                >
                  <option value="environmental">Environmental Assets</option>
                  <option value="health">Health & Social Assets</option>
                  <option value="cultural">Cultural Assets</option>
                  <option value="ecosystem">Ecosystem Services</option>
                </select>
              </div>

              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the regenerative project, its goals, and expected impact..."
                  rows={4}
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-emerald-300/70 text-sm mb-2 block">Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400/50" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Region, Country"
                      className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-emerald-300/70 text-sm mb-2 block">Project Size *</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g., 50,000 hectares"
                    className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-emerald-300/70 text-sm mb-2 block">Expected Impact *</label>
                  <input
                    type="text"
                    value={formData.expectedImpact}
                    onChange={(e) => setFormData({ ...formData, expectedImpact: e.target.value })}
                    placeholder="e.g., 5M tons CO₂/year"
                    className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>

                <div>
                  <label className="text-emerald-300/70 text-sm mb-2 block">Duration *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400/50" />
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 10 years"
                      className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Documentation */}
          {currentStep === 'documentation' && (
            <div className="space-y-6">
              <h3 className="text-white mb-4">Upload Documentation</h3>
              
              <div className="bg-emerald-900/20 border-2 border-dashed border-emerald-500/30 rounded-lg p-8 text-center hover:border-emerald-500/50 transition-all cursor-pointer">
                <Upload className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <p className="text-white mb-2">Upload Project Documents</p>
                <p className="text-emerald-300/70 text-sm mb-4">
                  PDF, DOC, or DOCX files (max 10MB each)
                </p>
                <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all">
                  Choose Files
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-4">
                  <FileText className="w-8 h-8 text-emerald-400 mb-3" />
                  <h4 className="text-white mb-2">Required Documents</h4>
                  <ul className="text-emerald-300/70 text-sm space-y-1">
                    <li>• Project proposal</li>
                    <li>• Environmental impact assessment</li>
                    <li>• Land ownership verification</li>
                    <li>• Baseline measurements</li>
                  </ul>
                </div>

                <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-4">
                  <Image className="w-8 h-8 text-emerald-400 mb-3" />
                  <h4 className="text-white mb-2">Supporting Media</h4>
                  <ul className="text-emerald-300/70 text-sm space-y-1">
                    <li>• Satellite imagery</li>
                    <li>• Site photographs</li>
                    <li>• Video documentation</li>
                    <li>• Drone footage</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-amber-400 mb-1">Documentation Guidelines</h4>
                    <p className="text-emerald-300/80 text-sm">
                      All documents must be certified by recognized authorities. Third-party verification 
                      reports are highly recommended and will expedite the review process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Verification Plan */}
          {currentStep === 'verification' && (
            <div className="space-y-6">
              <h3 className="text-white mb-4">Verification & Monitoring Plan</h3>
              
              <div className="bg-emerald-900/20 rounded-lg p-4">
                <h4 className="text-white mb-3">Select Verification Methods</h4>
                <div className="space-y-3">
                  {[
                    { id: 'satellite', label: 'Satellite Monitoring', desc: 'AI-powered remote sensing analysis' },
                    { id: 'iot', label: 'IoT Sensors', desc: 'Ground-based sensor network' },
                    { id: 'drone', label: 'Drone Surveys', desc: 'Periodic aerial verification' },
                    { id: 'manual', label: 'Manual Audits', desc: 'On-site inspections by certified auditors' },
                    { id: 'community', label: 'Community Reporting', desc: 'Local stakeholder verification' }
                  ].map((method) => (
                    <label key={method.id} className="flex items-center gap-3 p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-lg cursor-pointer hover:border-emerald-500/40 transition-all">
                      <input type="checkbox" className="w-5 h-5 text-emerald-500 bg-emerald-900/20 border-emerald-500/30 rounded focus:ring-emerald-500" />
                      <div className="flex-1">
                        <div className="text-white mb-1">{method.label}</div>
                        <div className="text-emerald-300/70 text-sm">{method.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Verification Frequency</label>
                <select className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/40">
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Semi-annually</option>
                  <option>Annually</option>
                </select>
              </div>

              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Assigned Oracle Network</label>
                <select className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/40">
                  <option>RVE Primary Oracle Network</option>
                  <option>Environmental Oracle Consortium</option>
                  <option>Community-Verified Oracle Pool</option>
                  <option>Custom Oracle Configuration</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Pricing & Supply */}
          {currentStep === 'pricing' && (
            <div className="space-y-6">
              <h3 className="text-white mb-4">Asset Economics</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-emerald-300/70 text-sm mb-2 block">Total Supply (Units) *</label>
                  <input
                    type="number"
                    value={formData.totalSupply}
                    onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                    placeholder="1000000"
                    className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                  />
                  <p className="text-emerald-300/50 text-sm mt-2">
                    Number of credits/tokens to be issued
                  </p>
                </div>

                <div>
                  <label className="text-emerald-300/70 text-sm mb-2 block">Initial Price per Unit (USD) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400/50" />
                    <input
                      type="number"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                      placeholder="50.00"
                      step="0.01"
                      className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                    />
                  </div>
                  <p className="text-emerald-300/50 text-sm mt-2">
                    Market-determined price per credit
                  </p>
                </div>
              </div>

              <div className="bg-emerald-900/20 rounded-lg p-6">
                <h4 className="text-white mb-4">Projected Economics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-emerald-900/30 rounded-lg p-4">
                    <div className="text-emerald-300/70 text-sm mb-1">Total Raise</div>
                    <div className="text-white">
                      ${formData.totalSupply && formData.pricePerUnit 
                        ? (parseFloat(formData.totalSupply) * parseFloat(formData.pricePerUnit)).toLocaleString()
                        : '0'}
                    </div>
                  </div>
                  <div className="bg-emerald-900/30 rounded-lg p-4">
                    <div className="text-emerald-300/70 text-sm mb-1">Platform Fee (2%)</div>
                    <div className="text-white">
                      ${formData.totalSupply && formData.pricePerUnit 
                        ? ((parseFloat(formData.totalSupply) * parseFloat(formData.pricePerUnit)) * 0.02).toLocaleString()
                        : '0'}
                    </div>
                  </div>
                  <div className="bg-emerald-900/30 rounded-lg p-4">
                    <div className="text-emerald-300/70 text-sm mb-1">Net to Project</div>
                    <div className="text-white">
                      ${formData.totalSupply && formData.pricePerUnit 
                        ? ((parseFloat(formData.totalSupply) * parseFloat(formData.pricePerUnit)) * 0.98).toLocaleString()
                        : '0'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Vesting Schedule (Optional)</label>
                <select className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/40">
                  <option>No vesting - Immediate tradability</option>
                  <option>6 months linear vesting</option>
                  <option>12 months linear vesting</option>
                  <option>Custom vesting schedule</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <h3 className="text-white mb-4">Review Your Submission</h3>
              
              <div className="space-y-4">
                <div className="bg-emerald-900/20 rounded-lg p-4">
                  <div className="text-emerald-300/70 text-sm mb-2">Asset Name</div>
                  <div className="text-white">{formData.name || 'Not specified'}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-900/20 rounded-lg p-4">
                    <div className="text-emerald-300/70 text-sm mb-2">Category</div>
                    <div className="text-white capitalize">{formData.category}</div>
                  </div>
                  <div className="bg-emerald-900/20 rounded-lg p-4">
                    <div className="text-emerald-300/70 text-sm mb-2">Location</div>
                    <div className="text-white">{formData.location || 'Not specified'}</div>
                  </div>
                </div>

                <div className="bg-emerald-900/20 rounded-lg p-4">
                  <div className="text-emerald-300/70 text-sm mb-2">Description</div>
                  <div className="text-white">{formData.description || 'Not specified'}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-900/20 rounded-lg p-4">
                    <div className="text-emerald-300/70 text-sm mb-2">Total Supply</div>
                    <div className="text-white">{formData.totalSupply ? parseInt(formData.totalSupply).toLocaleString() : '0'} units</div>
                  </div>
                  <div className="bg-emerald-900/20 rounded-lg p-4">
                    <div className="text-emerald-300/70 text-sm mb-2">Price per Unit</div>
                    <div className="text-white">${formData.pricePerUnit || '0.00'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-amber-400 mb-1">Submission Review Process</h4>
                    <p className="text-emerald-300/80 text-sm">
                      Your asset will undergo a comprehensive review by our verification team. 
                      This typically takes 7-14 business days. You'll receive updates via email and 
                      can track progress in your dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
                <input type="checkbox" className="w-5 h-5 text-emerald-500 bg-emerald-900/20 border-emerald-500/30 rounded focus:ring-emerald-500 mt-0.5" />
                <div className="text-emerald-300/80 text-sm">
                  I confirm that all information provided is accurate and that I have the authority to 
                  issue these assets. I understand that false information may result in permanent suspension 
                  from the RVE platform.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={getCurrentStepIndex() === 0}
            className="px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep === 'review' ? (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all"
            >
              Submit for Review
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all"
            >
              Next Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

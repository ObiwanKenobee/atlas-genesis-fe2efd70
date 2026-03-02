import { useState } from 'react';
import { BarChart3, Upload, Camera, Satellite, TrendingUp, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

interface ImpactReport {
  projectId: string;
  reportingPeriod: string;
  metrics: {
    carbonSequestered?: string;
    treesPlanted?: string;
    areaRestored?: string;
    biodiversityIndex?: string;
    communityBeneficiaries?: string;
    waterQuality?: string;
  };
  verificationMethod: string[];
  evidence: File[];
  challenges: string;
  nextSteps: string;
}

export function ImpactReporting() {
  const [reportData, setReportData] = useState<ImpactReport>({
    projectId: '',
    reportingPeriod: '',
    metrics: {},
    verificationMethod: [],
    evidence: [],
    challenges: '',
    nextSteps: ''
  });

  const [activeProjects] = useState([
    { id: 'PROJ-001', name: 'Amazon Corridor Restoration', type: 'Forest Restoration', nextReport: '2025-02-15' },
    { id: 'PROJ-002', name: 'Coastal Wetland Revival', type: 'Wetland Conservation', nextReport: '2025-01-30' },
    { id: 'PROJ-003', name: 'Traditional Seeds Program', type: 'Cultural Preservation', nextReport: '2025-02-10' }
  ]);

  const metricTemplates = {
    environmental: [
      { key: 'carbonSequestered', label: 'CO₂ Sequestered', unit: 'tons', icon: '🌍' },
      { key: 'treesPlanted', label: 'Trees Planted', unit: 'count', icon: '🌳' },
      { key: 'areaRestored', label: 'Area Restored', unit: 'hectares', icon: '📏' },
      { key: 'biodiversityIndex', label: 'Biodiversity Index', unit: 'score', icon: '🦋' },
      { key: 'waterQuality', label: 'Water Quality', unit: 'index', icon: '💧' }
    ],
    social: [
      { key: 'communityBeneficiaries', label: 'Community Beneficiaries', unit: 'people', icon: '👥' }
    ]
  };

  const handleMetricChange = (key: string, value: string) => {
    setReportData(prev => ({
      ...prev,
      metrics: { ...prev.metrics, [key]: value }
    }));
  };

  const toggleVerificationMethod = (method: string) => {
    setReportData(prev => ({
      ...prev,
      verificationMethod: prev.verificationMethod.includes(method)
        ? prev.verificationMethod.filter(m => m !== method)
        : [...prev.verificationMethod, method]
    }));
  };

  const handleSubmit = () => {
    console.log('Submitting impact report:', reportData);
    alert('Impact report submitted successfully! It will be sent to the verification oracle network.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white">Submit Impact Report</h2>
            <p className="text-emerald-300/80">Document and verify your regenerative impact</p>
          </div>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Select Project</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => setReportData({ ...reportData, projectId: project.id })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                reportData.projectId === project.id
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-emerald-500/20 bg-emerald-900/10 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-white">{project.name}</div>
                {reportData.projectId === project.id && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
              </div>
              <div className="text-emerald-300/70 text-sm mb-2">{project.type}</div>
              <div className="flex items-center gap-2 text-emerald-300/50 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Due: {project.nextReport}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {reportData.projectId && (
        <>
          {/* Reporting Period */}
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-4">Reporting Period</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Period Type</label>
                <select className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/40">
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Semi-Annual</option>
                  <option>Annual</option>
                </select>
              </div>
              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Period End Date</label>
                <input
                  type="date"
                  value={reportData.reportingPeriod}
                  onChange={(e) => setReportData({ ...reportData, reportingPeriod: e.target.value })}
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/40"
                />
              </div>
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-4">Impact Metrics</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-emerald-400 mb-3">Environmental Impact</h4>
                <div className="grid grid-cols-2 gap-4">
                  {metricTemplates.environmental.map((metric) => (
                    <div key={metric.key}>
                      <label className="text-emerald-300/70 text-sm mb-2 block flex items-center gap-2">
                        <span>{metric.icon}</span>
                        <span>{metric.label}</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={reportData.metrics[metric.key as keyof typeof reportData.metrics] || ''}
                          onChange={(e) => handleMetricChange(metric.key, e.target.value)}
                          placeholder="0"
                          className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 pr-20 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300/50 text-sm">
                          {metric.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-emerald-400 mb-3">Social Impact</h4>
                <div className="grid grid-cols-2 gap-4">
                  {metricTemplates.social.map((metric) => (
                    <div key={metric.key}>
                      <label className="text-emerald-300/70 text-sm mb-2 block flex items-center gap-2">
                        <span>{metric.icon}</span>
                        <span>{metric.label}</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={reportData.metrics[metric.key as keyof typeof reportData.metrics] || ''}
                          onChange={(e) => handleMetricChange(metric.key, e.target.value)}
                          placeholder="0"
                          className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 pr-20 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300/50 text-sm">
                          {metric.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-emerald-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-white">Projected vs Actual</span>
              </div>
              <div className="text-emerald-300/70 text-sm">
                Your metrics will be automatically compared against baseline projections to calculate 
                impact achievement rate and inform future planning.
              </div>
            </div>
          </div>

          {/* Verification Evidence */}
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-4">Verification Evidence</h3>
            
            <div className="mb-6">
              <h4 className="text-emerald-300/70 text-sm mb-3">Verification Methods Used</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'satellite', label: 'Satellite Data', icon: Satellite },
                  { id: 'drone', label: 'Drone Imagery', icon: Camera },
                  { id: 'sensors', label: 'IoT Sensors', icon: BarChart3 },
                  { id: 'manual', label: 'Field Survey', icon: CheckCircle }
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        reportData.verificationMethod.includes(method.id)
                          ? 'bg-emerald-500/20 border-emerald-500/50'
                          : 'bg-emerald-900/10 border-emerald-500/20 hover:border-emerald-500/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={reportData.verificationMethod.includes(method.id)}
                        onChange={() => toggleVerificationMethod(method.id)}
                        className="w-4 h-4 text-emerald-500 bg-emerald-900/20 border-emerald-500/30 rounded focus:ring-emerald-500"
                      />
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span className="text-white text-sm">{method.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-900/20 border-2 border-dashed border-emerald-500/30 rounded-lg p-6 text-center hover:border-emerald-500/50 transition-all cursor-pointer">
                <Satellite className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-white mb-1 text-sm">Satellite Images</p>
                <p className="text-emerald-300/70 text-xs mb-3">Upload recent imagery</p>
                <button className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs transition-all">
                  Upload
                </button>
              </div>

              <div className="bg-emerald-900/20 border-2 border-dashed border-emerald-500/30 rounded-lg p-6 text-center hover:border-emerald-500/50 transition-all cursor-pointer">
                <Camera className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-white mb-1 text-sm">Site Photos</p>
                <p className="text-emerald-300/70 text-xs mb-3">Before/after images</p>
                <button className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs transition-all">
                  Upload
                </button>
              </div>

              <div className="bg-emerald-900/20 border-2 border-dashed border-emerald-500/30 rounded-lg p-6 text-center hover:border-emerald-500/50 transition-all cursor-pointer">
                <Upload className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-white mb-1 text-sm">Sensor Data</p>
                <p className="text-emerald-300/70 text-xs mb-3">CSV/JSON files</p>
                <button className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs transition-all">
                  Upload
                </button>
              </div>
            </div>
          </div>

          {/* Challenges & Next Steps */}
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-4">Narrative Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Challenges Encountered</label>
                <textarea
                  value={reportData.challenges}
                  onChange={(e) => setReportData({ ...reportData, challenges: e.target.value })}
                  placeholder="Describe any obstacles, unexpected conditions, or deviations from the plan..."
                  rows={4}
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Next Steps & Adaptations</label>
                <textarea
                  value={reportData.nextSteps}
                  onChange={(e) => setReportData({ ...reportData, nextSteps: e.target.value })}
                  placeholder="Outline planned activities for the next period and any adaptive management strategies..."
                  rows={4}
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                />
              </div>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-400 mb-1">Automated Verification</h4>
                <p className="text-emerald-300/80 text-sm">
                  This report will be automatically processed by the RVE oracle network. Satellite data, 
                  sensor readings, and uploaded evidence will be cross-verified using AI analysis. 
                  Discrepancies will trigger manual review by certified auditors.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button className="px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all">
              Save as Draft
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all"
            >
              Submit Report for Verification
            </button>
          </div>
        </>
      )}
    </div>
  );
}

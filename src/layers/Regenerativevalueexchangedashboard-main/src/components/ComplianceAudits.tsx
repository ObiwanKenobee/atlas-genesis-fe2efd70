import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Shield, FileCheck, AlertTriangle, CheckCircle, Clock, Award, Lock, Eye, FileText, Users, Globe, Gavel } from 'lucide-react';

export function ComplianceAudits() {
  const complianceStats = [
    { label: 'Compliance Score', value: '98.7%', status: 'excellent', icon: Shield },
    { label: 'Active Audits', value: '12', status: 'ongoing', icon: Eye },
    { label: 'Certifications', value: '47', status: 'valid', icon: Award },
    { label: 'Regulatory Frameworks', value: '23', status: 'compliant', icon: Gavel },
  ];

  const certifications = [
    { name: 'ISO 14001:2015', category: 'Environmental Management', status: 'valid', expiry: '2026-03-15', issuer: 'ISO' },
    { name: 'GHG Protocol', category: 'Carbon Accounting', status: 'valid', expiry: '2025-12-20', issuer: 'WRI' },
    { name: 'B Corp Certification', category: 'Social Impact', status: 'valid', expiry: '2026-06-30', issuer: 'B Lab' },
    { name: 'SOC 2 Type II', category: 'Data Security', status: 'valid', expiry: '2025-09-10', issuer: 'AICPA' },
    { name: 'UN SDG Aligned', category: 'Sustainable Development', status: 'valid', expiry: '2027-01-01', issuer: 'UN' },
    { name: 'TCFD Compliance', category: 'Climate Risk Disclosure', status: 'valid', expiry: '2025-11-15', issuer: 'TCFD' },
  ];

  const regulatoryFrameworks = [
    { framework: 'EU Taxonomy', region: 'European Union', compliance: 96, lastAudit: '2024-11-15' },
    { framework: 'SEC Climate Disclosure', region: 'United States', compliance: 94, lastAudit: '2024-10-28' },
    { framework: 'SFDR', region: 'European Union', compliance: 98, lastAudit: '2024-12-01' },
    { framework: 'CSRD', region: 'European Union', compliance: 93, lastAudit: '2024-11-22' },
    { framework: 'UK Green Finance', region: 'United Kingdom', compliance: 97, lastAudit: '2024-11-08' },
    { framework: 'MAS Green Finance', region: 'Singapore', compliance: 95, lastAudit: '2024-10-15' },
  ];

  const auditHistory = [
    { month: 'Jul', internal: 12, external: 3, findings: 2, resolved: 2 },
    { month: 'Aug', internal: 14, external: 4, findings: 3, resolved: 3 },
    { month: 'Sep', internal: 11, external: 2, findings: 1, resolved: 1 },
    { month: 'Oct', internal: 15, external: 5, findings: 4, resolved: 4 },
    { month: 'Nov', internal: 13, external: 3, findings: 2, resolved: 2 },
    { month: 'Dec', internal: 16, external: 4, findings: 3, resolved: 2 },
  ];

  const complianceScore = [
    { category: 'Environmental Standards', score: 99.2, target: 95 },
    { category: 'Data Privacy & Security', score: 98.5, target: 95 },
    { category: 'Financial Regulations', score: 97.8, target: 95 },
    { category: 'Social Impact Standards', score: 99.1, target: 95 },
    { category: 'Governance Framework', score: 98.3, target: 95 },
    { category: 'Cultural Heritage Protection', score: 96.7, target: 95 },
  ];

  const activeAudits = [
    {
      name: 'Q4 2024 Environmental Impact Verification',
      auditor: 'EcoAudit International',
      scope: 'All environmental assets',
      status: 'in-progress',
      progress: 67,
      startDate: '2024-11-01',
      expectedCompletion: '2024-12-31',
      findings: 2,
    },
    {
      name: 'Carbon Credit Verification Audit',
      auditor: 'Verra Standards',
      scope: 'Carbon sequestration projects',
      status: 'in-progress',
      progress: 82,
      startDate: '2024-10-15',
      expectedCompletion: '2024-12-15',
      findings: 1,
    },
    {
      name: 'Cultural Heritage Asset Audit',
      auditor: 'UNESCO Heritage Verification',
      scope: 'Cultural preservation projects',
      status: 'in-progress',
      progress: 45,
      startDate: '2024-11-20',
      expectedCompletion: '2025-01-20',
      findings: 0,
    },
  ];

  const riskAssessment = [
    { risk: 'Regulatory Changes', level: 'medium', probability: 45, impact: 'medium', mitigation: 'Active monitoring & adaptation' },
    { risk: 'Data Privacy Breach', level: 'low', probability: 12, impact: 'high', mitigation: 'SOC 2 compliance & encryption' },
    { risk: 'Verification Fraud', level: 'low', probability: 8, impact: 'high', mitigation: 'Multi-oracle verification' },
    { risk: 'Market Manipulation', level: 'medium', probability: 35, impact: 'medium', mitigation: 'Trading surveillance system' },
  ];

  const dataProtection = [
    { measure: 'End-to-End Encryption', implemented: true, standard: 'AES-256' },
    { measure: 'Zero-Knowledge Proofs', implemented: true, standard: 'zk-SNARKs' },
    { measure: 'GDPR Compliance', implemented: true, standard: 'EU GDPR' },
    { measure: 'Right to be Forgotten', implemented: true, standard: 'GDPR Article 17' },
    { measure: 'Data Minimization', implemented: true, standard: 'Privacy by Design' },
    { measure: 'Audit Trails', implemented: true, standard: 'Immutable Ledger' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl">Compliance & Audit Framework</h2>
          <p className="text-emerald-300/70 mt-1">Regulatory compliance, certifications, and continuous audit systems</p>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
          <Shield className="w-3 h-3 mr-1" />
          98.7% Compliance Score
        </Badge>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  {stat.status}
                </Badge>
              </div>
              <div className="text-white text-2xl mb-1">{stat.value}</div>
              <div className="text-emerald-300/70 text-sm">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Active Audits */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
        <h3 className="text-white mb-6">Active Audits</h3>
        <div className="space-y-4">
          {activeAudits.map((audit) => (
            <div key={audit.name} className="bg-black/30 rounded-lg p-4 border border-emerald-500/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-white mb-1">{audit.name}</div>
                  <div className="flex items-center gap-4 text-sm text-emerald-300/70">
                    <span>Auditor: {audit.auditor}</span>
                    <span>•</span>
                    <span>Scope: {audit.scope}</span>
                  </div>
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {audit.status}
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-emerald-300/70 text-xs mb-1">Progress</div>
                  <div className="text-white">{audit.progress}%</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs mb-1">Start Date</div>
                  <div className="text-white text-sm">{audit.startDate}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs mb-1">Expected Completion</div>
                  <div className="text-white text-sm">{audit.expectedCompletion}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs mb-1">Findings</div>
                  <div className="text-white">{audit.findings}</div>
                </div>
              </div>
              <Progress value={audit.progress} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Certifications */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
        <h3 className="text-white mb-6">Active Certifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <div key={cert.name} className="bg-black/30 rounded-lg p-4 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm">{cert.name}</div>
                    <div className="text-emerald-300/70 text-xs">{cert.category}</div>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  {cert.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-emerald-300/70">Issuer: </span>
                  <span className="text-white">{cert.issuer}</span>
                </div>
                <div>
                  <span className="text-emerald-300/70">Expires: </span>
                  <span className="text-white">{cert.expiry}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Regulatory Frameworks & Audit History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-6">Regulatory Framework Compliance</h3>
          <div className="space-y-4">
            {regulatoryFrameworks.map((item) => (
              <div key={item.framework} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm">{item.framework}</div>
                    <div className="text-emerald-300/70 text-xs">{item.region}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-300">{item.compliance}%</div>
                    <div className="text-emerald-300/50 text-xs">Last: {item.lastAudit}</div>
                  </div>
                </div>
                <Progress value={item.compliance} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Audit History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={auditHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#6ee7b7" />
              <YAxis stroke="#6ee7b7" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981' }}
                labelStyle={{ color: '#6ee7b7' }}
              />
              <Legend />
              <Bar dataKey="internal" fill="#10b981" name="Internal Audits" />
              <Bar dataKey="external" fill="#3b82f6" name="External Audits" />
              <Bar dataKey="findings" fill="#f59e0b" name="Findings" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Compliance Scores */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
        <h3 className="text-white mb-6">Compliance Scores by Category</h3>
        <div className="space-y-4">
          {complianceScore.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-300/70">{item.category}</span>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-300/70 text-sm">Target: {item.target}%</span>
                  <span className="text-white">{item.score}%</span>
                  {item.score >= item.target && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>
              </div>
              <div className="relative">
                <Progress value={item.score} className="h-3" />
                <div 
                  className="absolute top-0 w-0.5 h-3 bg-yellow-400" 
                  style={{ left: `${item.target}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Risk Assessment & Data Protection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-6">Risk Assessment</h3>
          <div className="space-y-4">
            {riskAssessment.map((risk) => (
              <div key={risk.risk} className="bg-black/30 rounded-lg p-4 border border-emerald-500/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-white text-sm mb-1">{risk.risk}</div>
                    <div className="text-emerald-300/70 text-xs">{risk.mitigation}</div>
                  </div>
                  <Badge className={`${
                    risk.level === 'low' 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  } text-xs`}>
                    {risk.level}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-emerald-300/70 text-xs mb-2">Probability</div>
                    <Progress value={risk.probability} className="h-2" />
                    <div className="text-white text-xs mt-1">{risk.probability}%</div>
                  </div>
                  <div>
                    <div className="text-emerald-300/70 text-xs mb-1">Impact</div>
                    <div className="text-white text-sm">{risk.impact}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-6">Data Protection Measures</h3>
          <div className="space-y-3">
            {dataProtection.map((measure) => (
              <div key={measure.measure} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-emerald-500/10">
                <div className="flex items-center gap-3">
                  {measure.implemented ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-400" />
                  )}
                  <div>
                    <div className="text-white text-sm">{measure.measure}</div>
                    <div className="text-emerald-300/70 text-xs">{measure.standard}</div>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  Active
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Audit Trail */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Recent Audit Trail Events</h3>
        <div className="space-y-2">
          {[
            { event: 'External Audit Initiated', auditor: 'EcoAudit International', scope: 'Environmental Assets', timestamp: '2024-12-09 14:32:18', status: 'info' },
            { event: 'Compliance Check Passed', framework: 'EU Taxonomy', score: '96%', timestamp: '2024-12-09 13:15:42', status: 'success' },
            { event: 'Certification Renewed', cert: 'ISO 14001:2015', issuer: 'ISO', timestamp: '2024-12-09 11:28:53', status: 'success' },
            { event: 'Minor Finding Resolved', audit: 'Carbon Credit Verification', finding: 'Documentation gap', timestamp: '2024-12-09 09:47:21', status: 'warning' },
            { event: 'Risk Assessment Updated', risk: 'Market Manipulation', level: 'Medium', timestamp: '2024-12-09 08:12:05', status: 'info' },
          ].map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  log.status === 'success' ? 'bg-emerald-400' : 
                  log.status === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                }`}></div>
                <div>
                  <div className="text-white text-sm">{log.event}</div>
                  <div className="text-emerald-300/70 text-xs">
                    {Object.entries(log).filter(([key]) => !['event', 'timestamp', 'status'].includes(key)).map(([key, value]) => `${key}: ${value}`).join(' • ')}
                  </div>
                </div>
              </div>
              <div className="text-emerald-300/50 text-xs">{log.timestamp}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

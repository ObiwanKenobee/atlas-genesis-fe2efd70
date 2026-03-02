import { Users, Vote, Shield, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const councilMembers = [
  { name: 'Dr. Elena Martinez', role: 'Climate Scientist', org: 'IPCC', votes: 2847 },
  { name: 'Chief Makasa Mburu', role: 'Indigenous Leader', org: 'Maasai Council', votes: 3421 },
  { name: 'James Chen', role: 'Impact Investor', org: 'Regenerative Capital', votes: 2156 },
  { name: 'Dr. Amara Okafor', role: 'Public Health Expert', org: 'WHO', votes: 2934 },
  { name: 'Minister Sofia Larsson', role: 'Government Representative', org: 'Swedish Ministry of Environment', votes: 2567 },
  { name: 'Prof. Raj Patel', role: 'Economist', org: 'Global Regenerative Institute', votes: 2789 },
];

const activeProposals = [
  {
    id: 1,
    title: 'Increase Biodiversity Restoration Multiplier',
    description: 'Adjust the value calculation for biodiversity projects to reflect new research on ecosystem interdependencies',
    status: 'active',
    votesFor: 12847,
    votesAgainst: 3421,
    timeLeft: '3 days',
    category: 'Value Calculation',
  },
  {
    id: 2,
    title: 'Add Mycorrhizal Network Health as Asset Class',
    description: 'Create a new category for underground fungal networks that support forest ecosystems',
    status: 'active',
    votesFor: 8934,
    votesAgainst: 5621,
    timeLeft: '5 days',
    category: 'Asset Classification',
  },
  {
    id: 3,
    title: 'Cultural Heritage Verification Standards Update',
    description: 'Update verification protocols to better measure intangible cultural practices',
    status: 'active',
    votesFor: 11234,
    votesAgainst: 2156,
    timeLeft: '2 days',
    category: 'Verification',
  },
];

const recentDecisions = [
  {
    id: 1,
    title: 'Indigenous-Led Projects Priority Funding',
    passed: true,
    votesFor: 15234,
    votesAgainst: 3421,
    implemented: '2 weeks ago',
  },
  {
    id: 2,
    title: 'AI Verification Model v3.2 Deployment',
    passed: true,
    votesFor: 13567,
    votesAgainst: 4892,
    implemented: '1 month ago',
  },
  {
    id: 3,
    title: 'Soil Carbon Sequestration Rate Adjustment',
    passed: true,
    votesFor: 14123,
    votesAgainst: 5234,
    implemented: '6 weeks ago',
  },
];

export function Governance() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <h2 className="text-white mb-2">Living Smart Contracts & Multi-Stakeholder Governance</h2>
        <p className="text-emerald-300/80">
          Democratic decision-making through blockchain transparency — contracts that evolve with environmental conditions, 
          community needs, and scientific updates.
        </p>
      </div>

      {/* Governance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-emerald-300/70 text-sm">Council Members</div>
              <div className="text-white">{councilMembers.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Vote className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-emerald-300/70 text-sm">Active Proposals</div>
              <div className="text-white">{activeProposals.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-emerald-300/70 text-sm">Total Voters</div>
              <div className="text-white">47,823</div>
            </div>
          </div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-emerald-300/70 text-sm">Smart Contracts</div>
              <div className="text-white">1,247</div>
            </div>
          </div>
        </div>
      </div>

      {/* Council Members */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-6">Multi-Stakeholder Council</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {councilMembers.map((member, idx) => (
            <div key={idx} className="bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-4 hover:border-emerald-500/30 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h4 className="text-white mb-1">{member.name}</h4>
                  <div className="text-emerald-300/70 text-sm">{member.role}</div>
                  <div className="text-emerald-300/50 text-sm">{member.org}</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-emerald-500/10">
                <span className="text-emerald-300/70 text-sm">Voting Power</span>
                <span className="text-emerald-400">{member.votes.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Proposals */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-6">Active Governance Proposals</h3>
        <div className="space-y-4">
          {activeProposals.map((proposal) => {
            const totalVotes = proposal.votesFor + proposal.votesAgainst;
            const forPercentage = (proposal.votesFor / totalVotes) * 100;
            const againstPercentage = (proposal.votesAgainst / totalVotes) * 100;

            return (
              <div key={proposal.id} className="bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-6 hover:border-emerald-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white">{proposal.title}</h4>
                      <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                        {proposal.category}
                      </div>
                    </div>
                    <p className="text-emerald-300/70 text-sm">{proposal.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 ml-6">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{proposal.timeLeft}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-emerald-300/70">Voting Progress</span>
                    <span className="text-white">{totalVotes.toLocaleString()} votes cast</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className="flex h-full">
                      <div 
                        className="bg-emerald-500 h-full" 
                        style={{ width: `${forPercentage}%` }}
                      ></div>
                      <div 
                        className="bg-red-500 h-full" 
                        style={{ width: `${againstPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-emerald-300/70">For: {forPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-emerald-300/70">Against: {againstPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Vote For
                  </button>
                  <button className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Vote Against
                  </button>
                  <button className="px-4 py-2 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Decisions */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-6">Recent Governance Decisions</h3>
        <div className="space-y-3">
          {recentDecisions.map((decision) => (
            <div key={decision.id} className="bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  decision.passed ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}>
                  {decision.passed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-white mb-1">{decision.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-emerald-300/70">
                    <span>For: {decision.votesFor.toLocaleString()}</span>
                    <span>Against: {decision.votesAgainst.toLocaleString()}</span>
                    <span>Implemented {decision.implemented}</span>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                decision.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {decision.passed ? 'Passed' : 'Rejected'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Governance Principles */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <h3 className="text-white mb-4">Governance Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-emerald-400 mb-2">Living Smart Contracts</h4>
            <p className="text-emerald-300/70 text-sm">
              Contracts automatically adjust based on real-time environmental conditions, scientific updates, 
              and community feedback — ensuring the system stays responsive to planetary needs.
            </p>
          </div>
          <div>
            <h4 className="text-emerald-400 mb-2">Multi-Stakeholder Council</h4>
            <p className="text-emerald-300/70 text-sm">
              Scientists, indigenous leaders, investors, and governments collaborate with equal voice, 
              ensuring decisions balance ecological health, cultural wisdom, and economic viability.
            </p>
          </div>
          <div>
            <h4 className="text-emerald-400 mb-2">Blockchain Transparency</h4>
            <p className="text-emerald-300/70 text-sm">
              Every vote, decision, and contract change is recorded immutably on the blockchain, 
              creating an auditable trail of governance that builds trust across all stakeholders.
            </p>
          </div>
          <div>
            <h4 className="text-emerald-400 mb-2">Dynamic Rules</h4>
            <p className="text-emerald-300/70 text-sm">
              Asset values and verification standards evolve as ecosystems heal or degrade, 
              ensuring the market reflects real-time planetary health rather than static models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Vote, TrendingUp, Users, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'protocol' | 'treasury' | 'verification' | 'community';
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  deadline: string;
  proposer: string;
  details: string;
}

export function GovernanceParticipation() {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [voteChoice, setVoteChoice] = useState<'for' | 'against' | 'abstain' | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');

  const proposals: Proposal[] = [
    {
      id: 'PROP-023',
      title: 'Increase Oracle Verification Frequency for High-Value Assets',
      description: 'Mandate monthly instead of quarterly verification for assets >$10M',
      category: 'protocol',
      status: 'active',
      votesFor: 12847000,
      votesAgainst: 3421000,
      votesAbstain: 892000,
      quorum: 15000000,
      deadline: '2025-01-20T23:59:59',
      proposer: '0x7f3a...b8c2',
      details: 'This proposal aims to increase transparency and accuracy for high-value regenerative assets by requiring more frequent oracle verification cycles.'
    },
    {
      id: 'PROP-024',
      title: 'Community Treasury Allocation: Pacific Island Heritage Program',
      description: 'Allocate $5M from treasury for cultural preservation in Oceania',
      category: 'treasury',
      status: 'active',
      votesFor: 8923000,
      votesAgainst: 5421000,
      votesAbstain: 1234000,
      quorum: 15000000,
      deadline: '2025-01-25T23:59:59',
      proposer: '0x4b2e...d9f1',
      details: 'Funding will support 23 language preservation programs and traditional knowledge documentation across Pacific Island communities.'
    },
    {
      id: 'PROP-022',
      title: 'New Verification Standard for Soil Carbon Measurement',
      description: 'Adopt ISO-compliant soil carbon measurement protocols',
      category: 'verification',
      status: 'passed',
      votesFor: 18234000,
      votesAgainst: 2891000,
      votesAbstain: 567000,
      quorum: 15000000,
      deadline: '2025-01-10T23:59:59',
      proposer: '0x9a1c...e4f7',
      details: 'Implements internationally recognized standards for measuring soil organic carbon, improving credibility and interoperability.'
    },
    {
      id: 'PROP-021',
      title: 'Reduce Platform Trading Fees from 0.3% to 0.2%',
      description: 'Lower transaction costs to increase market liquidity',
      category: 'protocol',
      status: 'rejected',
      votesFor: 6234000,
      votesAgainst: 14567000,
      votesAbstain: 892000,
      quorum: 15000000,
      deadline: '2025-01-05T23:59:59',
      proposer: '0x2d5f...a8b3',
      details: 'Community voted to maintain current fee structure to ensure adequate funding for platform development and oracle network.'
    }
  ];

  const [userVotingPower] = useState(25000); // Example user's voting power

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/20';
      case 'passed': return 'text-blue-400 bg-blue-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/20';
      default: return 'text-emerald-400 bg-emerald-500/20';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'protocol': return 'bg-purple-500/20 text-purple-400';
      case 'treasury': return 'bg-amber-500/20 text-amber-400';
      case 'verification': return 'bg-blue-500/20 text-blue-400';
      case 'community': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-emerald-500/20 text-emerald-400';
    }
  };

  const calculatePercentage = (votes: number, total: number) => {
    return total > 0 ? ((votes / total) * 100).toFixed(1) : '0.0';
  };

  const getTotalVotes = (proposal: Proposal) => {
    return proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  };

  const getQuorumProgress = (proposal: Proposal) => {
    return ((getTotalVotes(proposal) / proposal.quorum) * 100).toFixed(1);
  };

  const handleVote = () => {
    if (!selectedProposal || !voteChoice) return;
    console.log('Voting:', { proposal: selectedProposal.id, choice: voteChoice, power: userVotingPower });
    alert(`Vote cast: ${voteChoice.toUpperCase()} on ${selectedProposal.title}`);
  };

  const handleStake = () => {
    if (!stakeAmount) return;
    console.log('Staking:', stakeAmount);
    alert(`Successfully staked ${stakeAmount} RVE tokens. Your voting power has increased!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white">Governance Participation</h2>
              <p className="text-emerald-300/80">Shape the future of regenerative value exchange</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-emerald-300/70 text-sm">Your Voting Power</div>
            <div className="text-white">{userVotingPower.toLocaleString()} RVE</div>
          </div>
        </div>
      </div>

      {/* Voting Power Management */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Increase Your Voting Power</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div>
              <label className="text-emerald-300/70 text-sm mb-2 block">Stake RVE Tokens</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Amount to stake"
                  className="flex-1 bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
                />
                <button
                  onClick={handleStake}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all"
                >
                  Stake
                </button>
              </div>
              <p className="text-emerald-300/60 text-sm mt-2">
                Staked tokens are locked for 30 days but earn 1:1 voting power
              </p>
            </div>
          </div>

          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-white">Staking Benefits</span>
            </div>
            <ul className="text-emerald-300/70 text-sm space-y-2">
              <li>• Governance voting rights</li>
              <li>• Platform fee discounts</li>
              <li>• Priority access to new assets</li>
              <li>• Staking rewards (5% APY)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Active Proposals */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Active Proposals</h3>
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const totalVotes = getTotalVotes(proposal);
            const quorumProgress = parseFloat(getQuorumProgress(proposal));
            
            return (
              <div
                key={proposal.id}
                onClick={() => setSelectedProposal(proposal)}
                className={`p-5 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedProposal?.id === proposal.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-emerald-500/20 bg-emerald-900/10 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${getCategoryColor(proposal.category)}`}>
                        {proposal.category}
                      </span>
                      <span className="text-emerald-300/50 text-xs">{proposal.id}</span>
                    </div>
                    <h4 className="text-white mb-2">{proposal.title}</h4>
                    <p className="text-emerald-300/70 text-sm">{proposal.description}</p>
                  </div>
                </div>

                {/* Voting Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className="text-emerald-300/70 text-xs mb-1">For</div>
                    <div className="text-emerald-400">{calculatePercentage(proposal.votesFor, totalVotes)}%</div>
                  </div>
                  <div>
                    <div className="text-emerald-300/70 text-xs mb-1">Against</div>
                    <div className="text-red-400">{calculatePercentage(proposal.votesAgainst, totalVotes)}%</div>
                  </div>
                  <div>
                    <div className="text-emerald-300/70 text-xs mb-1">Abstain</div>
                    <div className="text-amber-400">{calculatePercentage(proposal.votesAbstain, totalVotes)}%</div>
                  </div>
                  <div>
                    <div className="text-emerald-300/70 text-xs mb-1">Quorum</div>
                    <div className={quorumProgress >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
                      {quorumProgress}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="h-2 bg-emerald-900/20 rounded-full overflow-hidden">
                    <div className="h-full flex">
                      <div 
                        className="bg-emerald-500" 
                        style={{ width: `${calculatePercentage(proposal.votesFor, totalVotes)}%` }}
                      ></div>
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${calculatePercentage(proposal.votesAgainst, totalVotes)}%` }}
                      ></div>
                      <div 
                        className="bg-amber-500" 
                        style={{ width: `${calculatePercentage(proposal.votesAbstain, totalVotes)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-emerald-300/70 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{totalVotes.toLocaleString()} votes</span>
                  </div>
                  {proposal.status === 'active' && (
                    <div className="flex items-center gap-2 text-emerald-300/70 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Ends {new Date(proposal.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Voting Interface */}
      {selectedProposal && selectedProposal.status === 'active' && (
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-white mb-4">Cast Your Vote</h3>
          
          <div className="bg-emerald-900/20 rounded-lg p-4 mb-6">
            <h4 className="text-white mb-2">{selectedProposal.title}</h4>
            <p className="text-emerald-300/70 text-sm mb-3">{selectedProposal.details}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-emerald-300/70">Proposed by: {selectedProposal.proposer}</span>
              <span className="text-emerald-300/70">•</span>
              <span className="text-emerald-300/70">Category: {selectedProposal.category}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setVoteChoice('for')}
              className={`p-6 rounded-lg border-2 transition-all ${
                voteChoice === 'for'
                  ? 'border-emerald-500 bg-emerald-500/20'
                  : 'border-emerald-500/20 bg-emerald-900/10 hover:border-emerald-500/40'
              }`}
            >
              <CheckCircle className={`w-8 h-8 mx-auto mb-3 ${
                voteChoice === 'for' ? 'text-emerald-400' : 'text-emerald-400/50'
              }`} />
              <div className="text-white mb-1">Vote For</div>
              <div className="text-emerald-300/70 text-sm">Support this proposal</div>
            </button>

            <button
              onClick={() => setVoteChoice('against')}
              className={`p-6 rounded-lg border-2 transition-all ${
                voteChoice === 'against'
                  ? 'border-red-500 bg-red-500/20'
                  : 'border-emerald-500/20 bg-emerald-900/10 hover:border-emerald-500/40'
              }`}
            >
              <XCircle className={`w-8 h-8 mx-auto mb-3 ${
                voteChoice === 'against' ? 'text-red-400' : 'text-emerald-400/50'
              }`} />
              <div className="text-white mb-1">Vote Against</div>
              <div className="text-emerald-300/70 text-sm">Oppose this proposal</div>
            </button>

            <button
              onClick={() => setVoteChoice('abstain')}
              className={`p-6 rounded-lg border-2 transition-all ${
                voteChoice === 'abstain'
                  ? 'border-amber-500 bg-amber-500/20'
                  : 'border-emerald-500/20 bg-emerald-900/10 hover:border-emerald-500/40'
              }`}
            >
              <AlertCircle className={`w-8 h-8 mx-auto mb-3 ${
                voteChoice === 'abstain' ? 'text-amber-400' : 'text-emerald-400/50'
              }`} />
              <div className="text-white mb-1">Abstain</div>
              <div className="text-emerald-300/70 text-sm">Neutral position</div>
            </button>
          </div>

          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-400 mb-1">Optional: Add Comment (Public)</h4>
                <textarea
                  placeholder="Explain your vote reasoning to help inform the community..."
                  rows={3}
                  className="w-full bg-amber-900/20 border border-amber-500/20 rounded-lg px-4 py-3 text-white placeholder:text-amber-300/30 focus:outline-none focus:border-amber-500/40 mt-2"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-emerald-300/70 text-sm">
              Your vote will count for {userVotingPower.toLocaleString()} voting power
            </div>
            <button
              onClick={handleVote}
              disabled={!voteChoice}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Vote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

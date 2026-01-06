import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Wallet, Coins, Vote, Shield, ExternalLink } from 'lucide-react';

interface CarbonToken {
  tokenId: string;
  carbonCredits: number;
  projectId: string;
  retired: boolean;
  metadata: any;
}

interface DAOProposal {
  id: string;
  title: string;
  description: string;
  yesVotes: number;
  noVotes: number;
  status: string;
  timeLeft: string;
}

export function Web3Dashboard() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [tokens, setTokens] = useState<CarbonToken[]>([]);
  const [proposals, setProposals] = useState<DAOProposal[]>([
    {
      id: 'prop_1',
      title: 'Fund Mangrove Restoration',
      description: 'Allocate $500K for 200 hectares of mangrove restoration',
      yesVotes: 1250,
      noVotes: 340,
      status: 'active',
      timeLeft: '3 days'
    }
  ]);

  const connectWallet = async () => {
    // Simulate wallet connection
    setConnected(true);
    setAddress('0x742d35Cc6634C0532925a3b8D');
    setTokens([
      {
        tokenId: 'ct_001',
        carbonCredits: 100,
        projectId: 'proj_forest_001',
        retired: false,
        metadata: { projectType: 'reforestation', location: 'Brazil' }
      }
    ]);
  };

  const voteOnProposal = async (proposalId: string, support: boolean) => {
    // Simulate voting
    console.log(`Voting ${support ? 'YES' : 'NO'} on proposal ${proposalId}`);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Web3 Wallet</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!connected ? (
            <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
              Connect Wallet
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-green-400">✓ Connected</p>
              <p className="text-sm text-slate-400 font-mono">{address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {connected && (
        <>
          {/* Carbon Tokens */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Coins className="w-5 h-5 text-green-400" />
                <span>Carbon Tokens</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tokens.map((token) => (
                  <div key={token.tokenId} className="p-3 bg-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{token.carbonCredits} Credits</p>
                      <p className="text-sm text-slate-400">{token.metadata.projectType} • {token.metadata.location}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={token.retired ? "outline" : "default"}>
                        {token.retired ? 'Retired' : 'Active'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* DAO Proposals */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Vote className="w-5 h-5 text-purple-400" />
                <span>DAO Governance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="p-4 bg-slate-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white">{proposal.title}</h4>
                      <Badge variant="outline" className="border-blue-500 text-blue-500">
                        {proposal.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{proposal.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex space-x-4">
                        <span className="text-green-400">Yes: {proposal.yesVotes}</span>
                        <span className="text-red-400">No: {proposal.noVotes}</span>
                      </div>
                      <span className="text-slate-400 text-sm">{proposal.timeLeft}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => voteOnProposal(proposal.id, true)}
                      >
                        Vote Yes
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-500 text-red-500"
                        onClick={() => voteOnProposal(proposal.id, false)}
                      >
                        Vote No
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Coins, TrendingUp, Lock, Zap, Users, Percent, DollarSign, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon } from 'lucide-react';

export function TokenEconomics() {
  const tokenStats = [
    { label: 'RVE Token Price', value: '$42.87', change: '+12.4%', icon: DollarSign, trend: 'up' },
    { label: 'Market Cap', value: '$847.3B', change: '+8.2%', icon: TrendingUp, trend: 'up' },
    { label: 'Circulating Supply', value: '19.8B RVE', change: '+0.3%', icon: Coins, trend: 'up' },
    { label: 'Total Staked', value: '8.4B RVE', change: '+2.1%', icon: Lock, trend: 'up' },
  ];

  const stakingPools = [
    { name: 'Environmental Assets Pool', staked: 3420000000, apy: 12.4, rewards: 425000000, participants: 18923 },
    { name: 'Cultural Heritage Pool', staked: 1890000000, apy: 15.2, rewards: 287000000, participants: 12847 },
    { name: 'Health & Social Pool', staked: 2140000000, apy: 11.8, rewards: 252000000, participants: 15621 },
    { name: 'Governance Pool', staked: 950000000, apy: 18.5, rewards: 176000000, participants: 8934 },
  ];

  const tokenDistribution = [
    { name: 'Staking Rewards', value: 35, amount: 6930000000 },
    { name: 'Ecosystem Development', value: 25, amount: 4950000000 },
    { name: 'Community Treasury', value: 20, amount: 3960000000 },
    { name: 'Oracle Incentives', value: 12, amount: 2376000000 },
    { name: 'Team & Advisors', value: 8, amount: 1584000000 },
  ];

  const priceHistory = [
    { date: 'Jan', price: 28.45, volume: 124000000, mcap: 563000000000 },
    { date: 'Feb', price: 31.23, volume: 145000000, mcap: 618000000000 },
    { date: 'Mar', price: 29.87, volume: 132000000, mcap: 591000000000 },
    { date: 'Apr', price: 34.56, volume: 178000000, mcap: 684000000000 },
    { date: 'May', price: 37.92, volume: 198000000, mcap: 751000000000 },
    { date: 'Jun', price: 39.34, volume: 212000000, mcap: 779000000000 },
    { date: 'Jul', price: 42.87, volume: 234000000, mcap: 847000000000 },
  ];

  const rewardDistribution = [
    { month: 'Jan', environmental: 142000000, cultural: 98000000, health: 87000000, governance: 45000000 },
    { month: 'Feb', environmental: 156000000, cultural: 112000000, health: 94000000, governance: 52000000 },
    { month: 'Mar', environmental: 168000000, cultural: 124000000, health: 103000000, governance: 58000000 },
    { month: 'Apr', environmental: 187000000, cultural: 138000000, health: 117000000, governance: 67000000 },
    { month: 'May', environmental: 203000000, cultural: 152000000, health: 128000000, governance: 74000000 },
    { month: 'Jun', environmental: 221000000, cultural: 167000000, health: 142000000, governance: 83000000 },
    { month: 'Jul', environmental: 245000000, cultural: 189000000, health: 158000000, governance: 94000000 },
  ];

  const burnMechanics = [
    { mechanism: 'Transaction Fees', amount: 12400000, percentage: 0.062 },
    { mechanism: 'Failed Verifications', amount: 3200000, percentage: 0.016 },
    { mechanism: 'Governance Penalties', amount: 1800000, percentage: 0.009 },
    { mechanism: 'Oracle Slashing', amount: 2100000, percentage: 0.011 },
  ];

  const vestingSchedule = [
    { quarter: 'Q1 2025', team: 5, ecosystem: 15, community: 20 },
    { quarter: 'Q2 2025', team: 7, ecosystem: 18, community: 25 },
    { quarter: 'Q3 2025', team: 10, ecosystem: 22, community: 30 },
    { quarter: 'Q4 2025', team: 15, ecosystem: 28, community: 40 },
    { quarter: 'Q1 2026', team: 20, ecosystem: 35, community: 50 },
    { quarter: 'Q2 2026', team: 25, ecosystem: 42, community: 65 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl">Token Economics & Incentive Design</h2>
          <p className="text-emerald-300/70 mt-1">RVE tokenomics, staking mechanisms, and reward distribution</p>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
          <Zap className="w-3 h-3 mr-1" />
          Deflationary Model
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tokenStats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';
          return (
            <Card key={stat.label} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-white text-2xl mb-1">{stat.value}</div>
              <div className="text-emerald-300/70 text-sm">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Price & Volume History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">RVE Token Price History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" stroke="#6ee7b7" />
              <YAxis stroke="#6ee7b7" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981' }}
                labelStyle={{ color: '#6ee7b7' }}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Legend />
              <Area type="monotone" dataKey="price" stroke="#10b981" fill="#10b98130" name="Price (USD)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Trading Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" stroke="#6ee7b7" />
              <YAxis stroke="#6ee7b7" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981' }}
                labelStyle={{ color: '#6ee7b7' }}
                formatter={(value: number) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Legend />
              <Bar dataKey="volume" fill="#3b82f6" name="Volume (USD)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Staking Pools */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
        <h3 className="text-white mb-6">Staking Pools Overview</h3>
        <div className="space-y-4">
          {stakingPools.map((pool) => (
            <div key={pool.name} className="bg-black/30 rounded-lg p-4 border border-emerald-500/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white">{pool.name}</div>
                  <div className="text-emerald-300/70 text-sm">{pool.participants.toLocaleString()} participants</div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  {pool.apy}% APY
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-emerald-300/70 text-xs mb-1">Total Staked</div>
                  <div className="text-white">{(pool.staked / 1000000000).toFixed(2)}B RVE</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs mb-1">Rewards Distributed</div>
                  <div className="text-white">{(pool.rewards / 1000000).toFixed(1)}M RVE</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs mb-1">Staking Ratio</div>
                  <div className="text-white">{((pool.staked / 19800000000) * 100).toFixed(1)}%</div>
                </div>
              </div>
              <Progress value={(pool.staked / 19800000000) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Token Distribution & Rewards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Token Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tokenDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {tokenDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981' }}
                formatter={(value: number, name: string, props: any) => [
                  `${value}% (${(props.payload.amount / 1000000000).toFixed(2)}B RVE)`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {tokenDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-emerald-300/70">{item.name}</span>
                </div>
                <span className="text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Monthly Reward Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={rewardDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#6ee7b7" />
              <YAxis stroke="#6ee7b7" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981' }}
                labelStyle={{ color: '#6ee7b7' }}
                formatter={(value: number) => `${(value / 1000000).toFixed(1)}M RVE`}
              />
              <Legend />
              <Area type="monotone" dataKey="environmental" stackId="1" stroke="#10b981" fill="#10b981" name="Environmental" />
              <Area type="monotone" dataKey="cultural" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Cultural" />
              <Area type="monotone" dataKey="health" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Health & Social" />
              <Area type="monotone" dataKey="governance" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Governance" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Burn Mechanics & Vesting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Deflationary Burn Mechanics</h3>
          <div className="space-y-4 mb-6">
            {burnMechanics.map((item) => (
              <div key={item.mechanism} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-300/70">{item.mechanism}</span>
                  <div className="text-right">
                    <div className="text-white">{(item.amount / 1000000).toFixed(2)}M RVE</div>
                    <div className="text-emerald-300/50 text-xs">{item.percentage}% of supply</div>
                  </div>
                </div>
                <Progress value={item.percentage * 10} className="h-2" />
              </div>
            ))}
          </div>
          <div className="bg-black/30 rounded-lg p-4 border border-emerald-500/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-emerald-300/70 text-sm">Total Burned (30 days)</div>
                <div className="text-white text-2xl mt-1">19.5M RVE</div>
              </div>
              <div className="text-right">
                <div className="text-emerald-300/70 text-sm">Burn Rate</div>
                <div className="text-emerald-400 text-xl mt-1">0.098%</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Vesting Schedule</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vestingSchedule}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="quarter" stroke="#6ee7b7" />
              <YAxis stroke="#6ee7b7" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981' }}
                labelStyle={{ color: '#6ee7b7' }}
                formatter={(value: number) => `${value}% unlocked`}
              />
              <Legend />
              <Line type="monotone" dataKey="team" stroke="#f59e0b" strokeWidth={2} name="Team & Advisors" dot={{ fill: '#f59e0b' }} />
              <Line type="monotone" dataKey="ecosystem" stroke="#8b5cf6" strokeWidth={2} name="Ecosystem" dot={{ fill: '#8b5cf6' }} />
              <Line type="monotone" dataKey="community" stroke="#10b981" strokeWidth={2} name="Community" dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Incentive Mechanisms */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
        <h3 className="text-white mb-6">Active Incentive Mechanisms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Staking Rewards', description: 'Earn RVE by staking in asset pools', rate: '12-18% APY', participants: 56325 },
            { name: 'Liquidity Mining', description: 'Provide liquidity for trading pairs', rate: '24-36% APY', participants: 12847 },
            { name: 'Oracle Node Operation', description: 'Run verification nodes', rate: '8-15% APY', participants: 2847 },
            { name: 'Governance Participation', description: 'Vote on proposals and earn rewards', rate: '5-10% APY', participants: 34521 },
            { name: 'Impact Verification', description: 'Verify environmental impact data', rate: 'Per verification', participants: 8934 },
            { name: 'Custodian Services', description: 'Manage ecosystem assets', rate: '10-20% APY', participants: 1823 },
          ].map((incentive) => (
            <div key={incentive.name} className="bg-black/30 rounded-lg p-4 border border-emerald-500/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-white text-sm mb-1">{incentive.name}</div>
                  <div className="text-emerald-300/70 text-xs">{incentive.description}</div>
                </div>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="text-emerald-300/70 text-xs">Rate</div>
                  <div className="text-emerald-300">{incentive.rate}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-300/70 text-xs">Participants</div>
                  <div className="text-white">{incentive.participants.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

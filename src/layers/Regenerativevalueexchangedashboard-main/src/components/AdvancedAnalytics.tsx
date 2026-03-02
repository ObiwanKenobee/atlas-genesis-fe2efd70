import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  DollarSign,
  Target,
  Zap,
  Globe,
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Data for various analytics
const userGrowthData = [
  { month: 'Aug', users: 1200, activeUsers: 850, transactions: 3400 },
  { month: 'Sep', users: 1850, activeUsers: 1300, transactions: 5200 },
  { month: 'Oct', users: 2600, activeUsers: 1950, transactions: 7800 },
  { month: 'Nov', users: 3800, activeUsers: 2850, transactions: 11200 },
  { month: 'Dec', users: 5200, activeUsers: 3900, transactions: 15600 },
  { month: 'Jan', users: 7100, activeUsers: 5400, transactions: 21400 }
];

const assetPerformanceData = [
  { asset: 'RVE', roi: 245, volume: 12.5, trades: 8900 },
  { asset: 'CARBON', roi: 178, volume: 8.3, trades: 5400 },
  { asset: 'BIO', roi: 312, volume: 6.7, trades: 4200 },
  { asset: 'CULTURE', roi: 156, volume: 4.2, trades: 2800 },
  { asset: 'ECOSYSTEM', roi: 198, volume: 5.8, trades: 3600 }
];

const impactMetricsData = [
  { category: 'Carbon Sequestration', value: 92, baseline: 100 },
  { category: 'Biodiversity', value: 85, baseline: 100 },
  { category: 'Community Health', value: 78, baseline: 100 },
  { category: 'Cultural Preservation', value: 88, baseline: 100 },
  { category: 'Economic Impact', value: 95, baseline: 100 }
];

const geographicData = [
  { region: 'North America', users: 3200, volume: 24.5, color: '#10b981' },
  { region: 'Europe', users: 2800, volume: 21.3, color: '#06b6d4' },
  { region: 'Asia Pacific', users: 4100, volume: 31.2, color: '#8b5cf6' },
  { region: 'Latin America', users: 1900, volume: 14.8, color: '#f59e0b' },
  { region: 'Africa', users: 1100, volume: 8.2, color: '#ec4899' }
];

const cohortRetentionData = [
  { week: 'Week 1', retention: 100 },
  { week: 'Week 2', retention: 78 },
  { week: 'Week 3', retention: 65 },
  { week: 'Week 4', retention: 58 },
  { week: 'Week 8', retention: 52 },
  { week: 'Week 12', retention: 48 }
];

const tvlHistoryData = [
  { date: '2025-08-01', tvl: 18.5, inflows: 2.3, outflows: 1.1 },
  { date: '2025-09-01', tvl: 24.2, inflows: 6.8, outflows: 1.1 },
  { date: '2025-10-01', tvl: 31.7, inflows: 8.5, outflows: 1.0 },
  { date: '2025-11-01', tvl: 42.3, inflows: 11.6, outflows: 1.0 },
  { date: '2025-12-01', tvl: 56.8, inflows: 15.5, outflows: 1.0 },
  { date: '2026-01-01', tvl: 74.2, inflows: 18.4, outflows: 1.0 }
];

export function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('6m');
  const [selectedMetric, setSelectedMetric] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white mb-2">Advanced Analytics</h2>
          <p className="text-emerald-300/70">
            Comprehensive platform metrics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-emerald-900/20 border-emerald-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            icon: Users, 
            label: 'Total Users', 
            value: '7,100', 
            change: '+36.5%',
            trend: 'up',
            color: 'emerald'
          },
          { 
            icon: DollarSign, 
            label: 'Total Volume', 
            value: '$74.2M', 
            change: '+28.3%',
            trend: 'up',
            color: 'blue'
          },
          { 
            icon: Activity, 
            label: 'Transactions', 
            value: '21,400', 
            change: '+37.2%',
            trend: 'up',
            color: 'purple'
          },
          { 
            icon: Target, 
            label: 'Avg. ROI', 
            value: '237.8%', 
            change: '+15.4%',
            trend: 'up',
            color: 'amber'
          }
        ].map((metric, idx) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === 'up';
          return (
            <Card key={idx} className="bg-emerald-900/20 border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-${metric.color}-400/10 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${metric.color}-400`} />
                  </div>
                  <Badge className={`${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} border-0`}>
                    {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {metric.change}
                  </Badge>
                </div>
                <div className="text-sm text-emerald-300/70 mb-1">{metric.label}</div>
                <div className="text-white text-2xl">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="growth" className="space-y-6">
        <TabsList className="bg-emerald-900/20 border border-emerald-500/20">
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        {/* Growth Analytics */}
        <TabsContent value="growth" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth */}
            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white">User Growth Trends</CardTitle>
                <CardDescription className="text-emerald-300/70">
                  Total and active users over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" />
                    <XAxis dataKey="month" stroke="#6ee7b7" />
                    <YAxis stroke="#6ee7b7" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="users" stroke="#10b981" fill="url(#colorUsers)" name="Total Users" />
                    <Area type="monotone" dataKey="activeUsers" stroke="#06b6d4" fill="url(#colorActive)" name="Active Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Transaction Volume */}
            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white">Transaction Volume</CardTitle>
                <CardDescription className="text-emerald-300/70">
                  Monthly transaction activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" />
                    <XAxis dataKey="month" stroke="#6ee7b7" />
                    <YAxis stroke="#6ee7b7" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981' }}
                    />
                    <Legend />
                    <Bar dataKey="transactions" fill="#8b5cf6" name="Transactions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* TVL History */}
          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white">Total Value Locked (TVL) History</CardTitle>
              <CardDescription className="text-emerald-300/70">
                TVL growth with inflows and outflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={tvlHistoryData}>
                  <defs>
                    <linearGradient id="colorTVL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" />
                  <XAxis dataKey="date" stroke="#6ee7b7" />
                  <YAxis stroke="#6ee7b7" label={{ value: 'Million USD', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981' }}
                    formatter={(value: number) => `$${value}M`}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="tvl" stroke="#10b981" fill="url(#colorTVL)" name="TVL" />
                  <Bar dataKey="inflows" fill="#06b6d4" name="Inflows" />
                  <Bar dataKey="outflows" fill="#ef4444" name="Outflows" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asset Performance */}
        <TabsContent value="assets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROI Comparison */}
            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white">Asset ROI Comparison</CardTitle>
                <CardDescription className="text-emerald-300/70">
                  Return on investment by asset class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={assetPerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" />
                    <XAxis type="number" stroke="#6ee7b7" />
                    <YAxis dataKey="asset" type="category" stroke="#6ee7b7" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981' }}
                      formatter={(value: number) => `${value}%`}
                    />
                    <Bar dataKey="roi" fill="#10b981" name="ROI %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Trading Volume */}
            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white">Trading Volume by Asset</CardTitle>
                <CardDescription className="text-emerald-300/70">
                  24h volume in millions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetPerformanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ asset, volume }) => `${asset}: $${volume}M`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="volume"
                    >
                      {assetPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'][index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981' }}
                      formatter={(value: number) => `$${value}M`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Asset Performance Table */}
          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white">Detailed Asset Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assetPerformanceData.map((asset, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white">{asset.asset}</div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                        +{asset.roi}% ROI
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-emerald-300/50 mb-1">24h Volume</div>
                        <div className="text-white">${asset.volume}M</div>
                      </div>
                      <div>
                        <div className="text-emerald-300/50 mb-1">Total Trades</div>
                        <div className="text-white">{asset.trades.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-emerald-300/50 mb-1">Avg. Trade Size</div>
                        <div className="text-white">${((asset.volume * 1000000) / asset.trades).toFixed(0)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impact Analytics */}
        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Impact Radar Chart */}
            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white">Impact Performance Radar</CardTitle>
                <CardDescription className="text-emerald-300/70">
                  Multi-dimensional impact assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={impactMetricsData}>
                    <PolarGrid stroke="#064e3b" />
                    <PolarAngleAxis dataKey="category" stroke="#6ee7b7" />
                    <PolarRadiusAxis stroke="#6ee7b7" />
                    <Radar name="Current" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Radar name="Baseline" dataKey="baseline" stroke="#6b7280" fill="#6b7280" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Impact Metrics Breakdown */}
            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white">Impact Metrics Breakdown</CardTitle>
                <CardDescription className="text-emerald-300/70">
                  Detailed performance by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {impactMetricsData.map((metric, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-emerald-300/90">{metric.category}</span>
                        <span className="text-white">{metric.value}%</span>
                      </div>
                      <div className="w-full bg-emerald-950/50 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-emerald-300/70 text-sm">Overall Impact Score</div>
                      <div className="text-white text-2xl mt-1">
                        {(impactMetricsData.reduce((sum, m) => sum + m.value, 0) / impactMetricsData.length).toFixed(1)}%
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geographic Analytics */}
        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regional Distribution */}
            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white">User Distribution by Region</CardTitle>
                <CardDescription className="text-emerald-300/70">
                  Global user base breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={geographicData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ region, users }) => `${region}: ${users.toLocaleString()}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="users"
                    >
                      {geographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Volume by Region */}
            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white">Trading Volume by Region</CardTitle>
                <CardDescription className="text-emerald-300/70">
                  Regional trading activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={geographicData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" />
                    <XAxis dataKey="region" stroke="#6ee7b7" angle={-15} textAnchor="end" height={80} />
                    <YAxis stroke="#6ee7b7" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981' }}
                      formatter={(value: number) => `$${value}M`}
                    />
                    <Bar dataKey="volume" name="Volume (M USD)">
                      {geographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Regional Details */}
          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white">Regional Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {geographicData.map((region, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: region.color }} />
                        <span className="text-white">{region.region}</span>
                      </div>
                      <Globe className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-emerald-300/50 mb-1">Users</div>
                        <div className="text-white">{region.users.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-emerald-300/50 mb-1">Volume</div>
                        <div className="text-white">${region.volume}M</div>
                      </div>
                      <div>
                        <div className="text-emerald-300/50 mb-1">Avg per User</div>
                        <div className="text-white">${((region.volume * 1000000) / region.users).toFixed(0)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retention Analytics */}
        <TabsContent value="retention" className="space-y-6">
          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white">User Retention Analysis</CardTitle>
              <CardDescription className="text-emerald-300/70">
                Cohort retention over 12 weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={cohortRetentionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" />
                  <XAxis dataKey="week" stroke="#6ee7b7" />
                  <YAxis stroke="#6ee7b7" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #10b981' }}
                    formatter={(value: number) => `${value}%`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="retention" stroke="#10b981" strokeWidth={3} name="Retention %" />
                </LineChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { label: 'Day 1 Retention', value: '78%', color: 'emerald' },
                  { label: 'Week 1 Retention', value: '65%', color: 'blue' },
                  { label: 'Month 1 Retention', value: '52%', color: 'purple' },
                  { label: '3-Month Retention', value: '48%', color: 'amber' }
                ].map((stat, idx) => (
                  <div key={idx} className="p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/20">
                    <div className="text-emerald-300/70 text-sm mb-1">{stat.label}</div>
                    <div className={`text-${stat.color}-400 text-2xl`}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

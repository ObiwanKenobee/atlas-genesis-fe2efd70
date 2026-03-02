import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wifi, Database, Cpu, Satellite, Thermometer, Droplet, Wind, Cloud, MapPin, Activity, CheckCircle, AlertTriangle, Radio } from 'lucide-react';

export function OracleNetwork() {
  const oracleStats = [
    { name: 'AI Verification Nodes', value: 2847, status: 'active', icon: Cpu, color: 'emerald' },
    { name: 'Planetary Sensors', value: 15234, status: 'active', icon: Satellite, color: 'blue' },
    { name: 'IoT Edge Devices', value: 48912, status: 'active', icon: Wifi, color: 'purple' },
    { name: 'Data Feeds/sec', value: 127843, status: 'streaming', icon: Database, color: 'teal' },
  ];

  const sensorTypes = [
    { type: 'Carbon Sequestration', active: 3421, accuracy: 99.4, icon: Cloud, color: '#10b981' },
    { type: 'Soil Health', active: 2847, accuracy: 98.7, icon: MapPin, color: '#8b5cf6' },
    { type: 'Water Quality', active: 4129, accuracy: 99.1, icon: Droplet, color: '#3b82f6' },
    { type: 'Air Quality', active: 2314, accuracy: 98.9, icon: Wind, color: '#06b6d4' },
    { type: 'Temperature', active: 5892, accuracy: 99.8, icon: Thermometer, color: '#f59e0b' },
    { type: 'Biodiversity', active: 1823, accuracy: 97.2, icon: Activity, color: '#ec4899' },
  ];

  const oraclePerformance = [
    { time: '00:00', throughput: 98234, latency: 12, accuracy: 99.2 },
    { time: '04:00', throughput: 87421, latency: 15, accuracy: 99.1 },
    { time: '08:00', throughput: 134521, latency: 18, accuracy: 99.4 },
    { time: '12:00', throughput: 156782, latency: 14, accuracy: 99.5 },
    { time: '16:00', throughput: 178234, latency: 16, accuracy: 99.3 },
    { time: '20:00', throughput: 145892, latency: 13, accuracy: 99.6 },
    { time: 'Now', throughput: 127843, latency: 11, accuracy: 99.7 },
  ];

  const verificationDistribution = [
    { name: 'Environmental Assets', value: 42, count: 12847 },
    { name: 'Health & Social', value: 28, count: 8532 },
    { name: 'Cultural Assets', value: 18, count: 5493 },
    { name: 'Ecosystem Services', value: 12, count: 3661 },
  ];

  const nodeDistribution = [
    { region: 'North America', nodes: 847, uptime: 99.8 },
    { region: 'South America', nodes: 623, uptime: 99.4 },
    { region: 'Europe', nodes: 729, uptime: 99.7 },
    { region: 'Africa', nodes: 412, uptime: 98.9 },
    { region: 'Asia', nodes: 934, uptime: 99.6 },
    { region: 'Oceania', nodes: 302, uptime: 99.5 },
  ];

  const dataQuality = [
    { metric: 'Accuracy', score: 99.4, trend: '+0.3%' },
    { metric: 'Completeness', score: 98.7, trend: '+0.5%' },
    { metric: 'Timeliness', score: 99.1, trend: '+0.2%' },
    { metric: 'Consistency', score: 98.9, trend: '+0.4%' },
    { metric: 'Validity', score: 99.6, trend: '+0.1%' },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl">Oracle Network & Planetary Sensors</h2>
          <p className="text-emerald-300/70 mt-1">AI-driven verification infrastructure and real-time environmental monitoring</p>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
          <Radio className="w-3 h-3 mr-1" />
          All Systems Operational
        </Badge>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {oracleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  {stat.status}
                </Badge>
              </div>
              <div className="text-white text-2xl mb-1">{stat.value.toLocaleString()}</div>
              <div className="text-emerald-300/70 text-sm">{stat.name}</div>
            </Card>
          );
        })}
      </div>

      {/* Oracle Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Oracle Throughput & Latency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={oraclePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#6ee7b7" />
              <YAxis stroke="#6ee7b7" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981' }}
                labelStyle={{ color: '#6ee7b7' }}
              />
              <Legend />
              <Area type="monotone" dataKey="throughput" stroke="#10b981" fill="#10b98120" name="Throughput (tx/s)" />
              <Area type="monotone" dataKey="latency" stroke="#3b82f6" fill="#3b82f620" name="Latency (ms)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Verification Accuracy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={oraclePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#6ee7b7" />
              <YAxis domain={[98, 100]} stroke="#6ee7b7" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981' }}
                labelStyle={{ color: '#6ee7b7' }}
              />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} name="Accuracy %" dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Sensor Network */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
        <h3 className="text-white mb-6">Planetary Sensor Network</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensorTypes.map((sensor) => {
            const Icon = sensor.icon;
            return (
              <div key={sensor.type} className="bg-black/30 rounded-lg p-4 border border-emerald-500/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div style={{ backgroundColor: `${sensor.color}20` }} className="w-10 h-10 rounded-lg flex items-center justify-center">
                      <Icon style={{ color: sensor.color }} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-white text-sm">{sensor.type}</div>
                      <div className="text-emerald-300/70 text-xs">{sensor.active.toLocaleString()} active</div>
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-300/70">Accuracy</span>
                    <span className="text-emerald-300">{sensor.accuracy}%</span>
                  </div>
                  <Progress value={sensor.accuracy} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Verification Distribution & Node Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Verification Distribution by Asset Class</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={verificationDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {verificationDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {verificationDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-emerald-300/70">{item.name}</span>
                </div>
                <span className="text-white">{item.count.toLocaleString()} verifications/day</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Oracle Node Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={nodeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="region" stroke="#6ee7b7" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6ee7b7" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981' }}
                labelStyle={{ color: '#6ee7b7' }}
              />
              <Legend />
              <Bar dataKey="nodes" fill="#10b981" name="Active Nodes" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Data Quality Metrics */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
        <h3 className="text-white mb-6">Data Quality Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {dataQuality.map((item) => (
            <div key={item.metric} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-emerald-300/70 text-sm">{item.metric}</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  {item.trend}
                </Badge>
              </div>
              <div className="text-white text-3xl">{item.score}%</div>
              <Progress value={item.score} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Verifications */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Recent Verifications (Live Stream)</h3>
        <div className="space-y-2">
          {[
            { asset: 'Amazon Rainforest Restoration #4821', type: 'Carbon Sequestration', oracle: 'Oracle-NA-427', status: 'verified', time: '2s ago' },
            { asset: 'Maasai Community Wellness Program', type: 'Health & Social', oracle: 'Oracle-AF-189', status: 'verified', time: '5s ago' },
            { asset: 'Quechua Language Preservation', type: 'Cultural Heritage', oracle: 'Oracle-SA-334', status: 'verified', time: '8s ago' },
            { asset: 'Great Barrier Reef Coral Health', type: 'Ecosystem Service', oracle: 'Oracle-OC-112', status: 'verified', time: '12s ago' },
            { asset: 'Kenyan Soil Regeneration #2341', type: 'Environmental', oracle: 'Oracle-AF-201', status: 'pending', time: '15s ago' },
          ].map((verification, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${verification.status === 'verified' ? 'bg-emerald-400' : 'bg-yellow-400'} animate-pulse`}></div>
                <div>
                  <div className="text-white text-sm">{verification.asset}</div>
                  <div className="text-emerald-300/50 text-xs">{verification.type} • {verification.oracle}</div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={verification.status === 'verified' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}>
                  {verification.status}
                </Badge>
                <div className="text-emerald-300/50 text-xs mt-1">{verification.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

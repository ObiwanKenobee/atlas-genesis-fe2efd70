import { Satellite, Cpu, Radio, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const sensorData = [
  { time: '00:00', iot: 234, satellite: 89, ai: 156 },
  { time: '04:00', iot: 267, satellite: 92, ai: 178 },
  { time: '08:00', iot: 312, satellite: 98, ai: 201 },
  { time: '12:00', iot: 345, satellite: 105, ai: 223 },
  { time: '16:00', iot: 389, satellite: 112, ai: 245 },
  { time: '20:00', iot: 421, satellite: 118, ai: 267 },
];

const verificationProjects = [
  {
    id: 1,
    name: 'Amazon Rainforest Restoration - Sector 47B',
    location: 'Brazil',
    status: 'verified',
    confidence: 98,
    sensors: 142,
    lastUpdate: '2 hours ago',
  },
  {
    id: 2,
    name: 'Maasai Cultural Heritage Program',
    location: 'Kenya',
    status: 'verified',
    confidence: 95,
    sensors: 67,
    lastUpdate: '4 hours ago',
  },
  {
    id: 3,
    name: 'Great Barrier Reef Coral Recovery',
    location: 'Australia',
    status: 'processing',
    confidence: 87,
    sensors: 234,
    lastUpdate: '1 hour ago',
  },
  {
    id: 4,
    name: 'Himalayan Watershed Protection',
    location: 'Nepal',
    status: 'verified',
    confidence: 93,
    sensors: 89,
    lastUpdate: '3 hours ago',
  },
  {
    id: 5,
    name: 'Indigenous Language Revitalization - Quechua',
    location: 'Peru',
    status: 'verified',
    confidence: 91,
    sensors: 34,
    lastUpdate: '6 hours ago',
  },
];

export function VerificationLayer() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <h2 className="text-white mb-2">AI-Driven Verification & Planetary Sensors</h2>
        <p className="text-emerald-300/80">
          Real-time tracking of ecosystems, cultural continuity, and human well-being through IoT devices, 
          satellite imagery, and AI-powered outcome calculations.
        </p>
      </div>

      {/* Verification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-emerald-300/70 text-sm">Active IoT Devices</div>
              <div className="text-white">47,823</div>
            </div>
          </div>
          <div className="text-emerald-300/60 text-sm">Capturing real-time environmental data</div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Satellite className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-emerald-300/70 text-sm">Satellite Imagery Scans</div>
              <div className="text-white">12,456/day</div>
            </div>
          </div>
          <div className="text-emerald-300/60 text-sm">Land-use and restoration verification</div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-emerald-300/70 text-sm">AI Models Running</div>
              <div className="text-white">234</div>
            </div>
          </div>
          <div className="text-emerald-300/60 text-sm">Calculating regenerative outcomes</div>
        </div>
      </div>

      {/* Real-time Data Flow */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-6">Real-Time Data Flow (Last 24 Hours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sensorData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#10b981" opacity={0.1} />
            <XAxis dataKey="time" stroke="#6ee7b7" />
            <YAxis stroke="#6ee7b7" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#064e3b', 
                border: '1px solid #10b981',
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Line type="monotone" dataKey="iot" stroke="#3b82f6" strokeWidth={2} name="IoT Sensors" />
            <Line type="monotone" dataKey="satellite" stroke="#8b5cf6" strokeWidth={2} name="Satellite Scans" />
            <Line type="monotone" dataKey="ai" stroke="#10b981" strokeWidth={2} name="AI Verifications" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-emerald-300/70 text-sm">IoT Sensors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-emerald-300/70 text-sm">Satellite Scans</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-emerald-300/70 text-sm">AI Verifications</span>
          </div>
        </div>
      </div>

      {/* Recent Verifications */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-6">Recent Project Verifications</h3>
        <div className="space-y-4">
          {verificationProjects.map((project) => (
            <div 
              key={project.id}
              className="bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-4 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white">{project.name}</h4>
                    {project.status === 'verified' ? (
                      <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm">
                        <Activity className="w-3 h-3" />
                        <span>Processing</span>
                      </div>
                    )}
                  </div>
                  <div className="text-emerald-300/70 text-sm">{project.location}</div>
                </div>
                <div className="text-right">
                  <div className="text-white mb-1">{project.confidence}%</div>
                  <div className="text-emerald-300/50 text-sm">Confidence</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300/70">{project.sensors} sensors</span>
                  </div>
                  <div className="text-emerald-300/50">Updated {project.lastUpdate}</div>
                </div>
                <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Process */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-6">How Verification Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Radio className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-white mb-2">1. Data Collection</h4>
            <p className="text-emerald-300/70 text-sm">
              IoT sensors gather real-time environmental and social metrics
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Satellite className="w-8 h-8 text-purple-400" />
            </div>
            <h4 className="text-white mb-2">2. Satellite Verification</h4>
            <p className="text-emerald-300/70 text-sm">
              Satellite imagery confirms land-use changes and restoration progress
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="text-white mb-2">3. AI Analysis</h4>
            <p className="text-emerald-300/70 text-sm">
              Machine learning models calculate regenerative outcomes and impact
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="text-white mb-2">4. Blockchain Recording</h4>
            <p className="text-emerald-300/70 text-sm">
              Verified data is immutably recorded on the blockchain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

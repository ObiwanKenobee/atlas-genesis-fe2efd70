import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Command, 
  Cpu, 
  Database, 
  Globe, 
  Lock, 
  Network, 
  RefreshCw, 
  Server, 
  Shield, 
  Terminal, 
  TrendingUp, 
  Users, 
  Zap 
} from 'lucide-react';

interface CommandLog {
  id: string;
  timestamp: Date;
  command: string;
  status: 'success' | 'error' | 'pending';
  duration: number;
  user?: string;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  threshold?: number;
}

interface ActiveSession {
  id: string;
  user: string;
  ip: string;
  startTime: Date;
  lastActivity: Date;
  commands: number;
}

const AdminCommandCenter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [commandLogs, setCommandLogs] = useState<CommandLog[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<CommandLog | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadCommandLogs();
      loadSystemMetrics();
      loadActiveSessions();
      
      // Set up real-time updates
      const interval = setInterval(() => {
        loadSystemMetrics();
        loadActiveSessions();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadCommandLogs = async () => {
    // Simulate loading command logs
    const logs: CommandLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        command: 'UPDATE user_permissions SET role = "admin" WHERE id = 123',
        status: 'success',
        duration: 245,
        user: 'admin@atlas.org'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        command: 'SELECT * FROM audit_logs WHERE action = "DELETE"',
        status: 'success',
        duration: 89,
        user: 'admin@atlas.org'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        command: 'DELETE FROM temp_sessions WHERE expired = true',
        status: 'error',
        duration: 1200,
        user: 'system'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        command: 'INSERT INTO system_events (type, message) VALUES ("INFO", "System backup completed")',
        status: 'success',
        duration: 156,
        user: 'system'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        command: 'UPDATE metrics SET cpu_usage = 45.2 WHERE server_id = "prod-01"',
        status: 'pending',
        duration: 0,
        user: 'monitor'
      }
    ];
    setCommandLogs(logs);
  };

  const loadSystemMetrics = async () => {
    // Simulate loading system metrics
    const metrics: SystemMetric[] = [
      { name: 'CPU Usage', value: Math.random() * 30 + 40, unit: '%', trend: 'stable', threshold: 80 },
      { name: 'Memory Usage', value: Math.random() * 20 + 60, unit: '%', trend: 'up', threshold: 85 },
      { name: 'Disk I/O', value: Math.random() * 100 + 50, unit: 'MB/s', trend: 'stable' },
      { name: 'Network Traffic', value: Math.random() * 500 + 200, unit: 'Mbps', trend: 'up' },
      { name: 'Active Connections', value: Math.floor(Math.random() * 50 + 100), unit: '', trend: 'stable' },
      { name: 'Response Time', value: Math.random() * 100 + 50, unit: 'ms', trend: 'down', threshold: 500 },
      { name: 'Error Rate', value: Math.random() * 0.5, unit: '%', trend: 'stable', threshold: 1 },
      { name: 'Cache Hit Rate', value: Math.random() * 10 + 85, unit: '%', trend: 'up' }
    ];
    setSystemMetrics(metrics);
  };

  const loadActiveSessions = async () => {
    // Simulate loading active sessions
    const sessions: ActiveSession[] = [
      {
        id: 'sess-001',
        user: 'admin@atlas.org',
        ip: '192.168.1.100',
        startTime: new Date(Date.now() - 1000 * 60 * 60),
        lastActivity: new Date(Date.now() - 1000 * 30),
        commands: 45
      },
      {
        id: 'sess-002',
        user: 'user@example.com',
        ip: '192.168.1.101',
        startTime: new Date(Date.now() - 1000 * 60 * 30),
        lastActivity: new Date(Date.now() - 1000 * 60 * 2),
        commands: 12
      },
      {
        id: 'sess-003',
        user: 'monitor@atlas.org',
        ip: '192.168.1.102',
        startTime: new Date(Date.now() - 1000 * 60 * 120),
        lastActivity: new Date(Date.now() - 1000 * 10),
        commands: 89
      }
    ];
    setActiveSessions(sessions);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadCommandLogs(),
      loadSystemMetrics(),
      loadActiveSessions()
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getStatusIcon = (status: CommandLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTrendIcon = (trend: SystemMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      case 'stable':
        return <div className="w-4 h-4 border-t-2 border-gray-400" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Admin Command Center...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">Access Denied. Admin authentication required.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl">
              <Command className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Admin Command Center
              </h1>
              <p className="text-gray-400 mt-1">Real-Time Command Intelligence</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {systemMetrics.map((metric) => (
          <div
            key={metric.name}
            className={`bg-gray-800 rounded-xl p-4 border ${
              metric.threshold && metric.value > metric.threshold
                ? 'border-red-500'
                : 'border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">{metric.name}</span>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{metric.value.toFixed(1)}</span>
              <span className="text-gray-400 text-sm mb-1">{metric.unit}</span>
            </div>
            {metric.threshold && (
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    metric.value > metric.threshold ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Command Logs */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold">Command Logs</h2>
            </div>
            <span className="text-sm text-gray-400">{commandLogs.length} entries</span>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {commandLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedLog?.id === log.id
                    ? 'border-blue-500 bg-gray-700'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <code className="text-sm text-blue-300 font-mono">{log.command}</code>
                  </div>
                  <span className="text-xs text-gray-400">{formatTimeAgo(log.timestamp)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {log.user || 'system'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(log.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold">Active Sessions</h2>
            </div>
            <span className="text-sm text-gray-400">{activeSessions.length} active</span>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{session.user}</span>
                  <div className="flex items-center gap-1 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs">Active</span>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    {session.ip}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Last activity: {formatTimeAgo(session.lastActivity)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    {session.commands} commands executed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6 bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold">System Status</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
            <Database className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-sm text-gray-400">Database</div>
              <div className="font-semibold text-green-400">Connected</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
            <Network className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-sm text-gray-400">Network</div>
              <div className="font-semibold text-green-400">Stable</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
            <Shield className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-sm text-gray-400">Security</div>
              <div className="font-semibold text-green-400">Protected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button className="flex items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh Cache</span>
          </button>
          <button className="flex items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <Activity className="w-4 h-4" />
            <span className="text-sm">View Logs</span>
          </button>
          <button className="flex items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <Cpu className="w-4 h-4" />
            <span className="text-sm">System Diagnostics</span>
          </button>
          <button className="flex items-center gap-2 p-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Emergency Lockdown</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCommandCenter;

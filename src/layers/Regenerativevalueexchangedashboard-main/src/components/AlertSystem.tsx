import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, Bell, CheckCircle, Info, XCircle, TrendingDown, TrendingUp, Shield, Activity, Clock, Filter } from 'lucide-react';

export function AlertSystem() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const alertStats = [
    { label: 'Critical Alerts', value: 3, icon: XCircle, color: 'red' },
    { label: 'Warnings', value: 12, icon: AlertTriangle, color: 'yellow' },
    { label: 'Info', value: 28, icon: Info, color: 'blue' },
    { label: 'Resolved (24h)', value: 47, icon: CheckCircle, color: 'emerald' },
  ];

  const alerts = [
    {
      id: 1,
      type: 'critical',
      category: 'Verification',
      title: 'Oracle Verification Failure',
      description: 'Carbon sequestration verification failed for Amazon Rainforest Project #4821',
      asset: 'Environmental Asset #4821',
      timestamp: '2 minutes ago',
      priority: 'high',
      actionRequired: true,
      details: 'Multiple oracle nodes reported inconsistent data. Manual review required.',
    },
    {
      id: 2,
      type: 'critical',
      category: 'Trading',
      title: 'Abnormal Trading Volume',
      description: 'Trading volume spike detected on Cultural Heritage asset pool',
      asset: 'Cultural Heritage Pool',
      timestamp: '8 minutes ago',
      priority: 'high',
      actionRequired: true,
      details: 'Volume increased by 347% in the last hour. Possible market manipulation.',
    },
    {
      id: 3,
      type: 'critical',
      category: 'Governance',
      title: 'Quorum Not Reached',
      description: 'Critical governance proposal expiring in 2 hours without quorum',
      asset: 'Proposal #892 - Treasury Allocation',
      timestamp: '15 minutes ago',
      priority: 'high',
      actionRequired: true,
      details: 'Only 62% of required votes received. Proposal will fail if quorum not met.',
    },
    {
      id: 4,
      type: 'warning',
      category: 'Custodian',
      title: 'Custodian Node Performance',
      description: 'Custodian node CUS-AF-089 showing degraded performance',
      asset: 'Kenyan Ecosystem Network',
      timestamp: '23 minutes ago',
      priority: 'medium',
      actionRequired: false,
      details: 'Response time increased by 45%. Auto-failover ready if performance degrades further.',
    },
    {
      id: 5,
      type: 'warning',
      category: 'Compliance',
      title: 'Certification Expiring Soon',
      description: 'GHG Protocol certification expires in 11 days',
      asset: 'Carbon Assets Certification',
      timestamp: '1 hour ago',
      priority: 'medium',
      actionRequired: true,
      details: 'Renewal process should be initiated. Contact issuer for renewal.',
    },
    {
      id: 6,
      type: 'warning',
      category: 'Token',
      title: 'Staking Pool Imbalance',
      description: 'Environmental Assets pool exceeding target allocation',
      asset: 'Environmental Staking Pool',
      timestamp: '1 hour ago',
      priority: 'medium',
      actionRequired: false,
      details: 'Pool at 127% of target allocation. Consider incentivizing other pools.',
    },
    {
      id: 7,
      type: 'warning',
      category: 'Oracle',
      title: 'Sensor Network Latency',
      description: 'Increased latency detected in South American sensor network',
      asset: 'Planetary Sensors - SA Region',
      timestamp: '2 hours ago',
      priority: 'medium',
      actionRequired: false,
      details: 'Average latency increased from 12ms to 45ms. Network congestion suspected.',
    },
    {
      id: 8,
      type: 'info',
      category: 'Impact',
      title: 'Milestone Achievement',
      description: 'Total carbon sequestration exceeded 1 billion tons',
      asset: 'Global Environmental Impact',
      timestamp: '3 hours ago',
      priority: 'low',
      actionRequired: false,
      details: 'Cumulative verified carbon sequestration reached 1.02B tons CO2e.',
    },
    {
      id: 9,
      type: 'info',
      category: 'Trading',
      title: 'New Trading Pair Listed',
      description: 'Indigenous Knowledge Assets now tradeable',
      asset: 'Cultural Assets Trading',
      timestamp: '4 hours ago',
      priority: 'low',
      actionRequired: false,
      details: 'New trading pair: IKA/RVE launched with initial liquidity of $12.4M.',
    },
    {
      id: 10,
      type: 'info',
      category: 'Governance',
      title: 'Proposal Passed',
      description: 'Ecosystem restoration fund allocation approved',
      asset: 'Proposal #891',
      timestamp: '5 hours ago',
      priority: 'low',
      actionRequired: false,
      details: 'Passed with 87.3% approval. 150M RVE allocated to restoration projects.',
    },
  ];

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filter);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return XCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'critical': 
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/10',
          text: 'text-red-300',
          badge: 'bg-red-500/20 text-red-300 border-red-500/30',
          dot: 'bg-red-400',
        };
      case 'warning':
        return {
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-300',
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          dot: 'bg-yellow-400',
        };
      case 'info':
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          text: 'text-blue-300',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          dot: 'bg-blue-400',
        };
      default:
        return {
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl">Real-time Alert System</h2>
          <p className="text-emerald-300/70 mt-1">System-wide notifications, critical alerts, and monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-slate-900/90 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
            <Bell className="w-4 h-4 mr-2" />
            Configure Alerts
          </Button>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {alertStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
              </div>
              <div className="text-white text-3xl mb-1">{stat.value}</div>
              <div className="text-emerald-300/70 text-sm">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Filter Bar */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-300/70" />
            <span className="text-emerald-300/70 text-sm">Filter by:</span>
            <div className="flex gap-2">
              {['all', 'critical', 'warning', 'info'].map((filterType) => (
                <Button
                  key={filterType}
                  size="sm"
                  variant="outline"
                  onClick={() => setFilter(filterType as any)}
                  className={`${
                    filter === filterType
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900/50 border-emerald-500/20 text-emerald-300/70'
                  } hover:bg-emerald-500/10`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <div className="text-emerald-300/70 text-sm">
            {filteredAlerts.length} alerts
          </div>
        </div>
      </Card>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const colors = getAlertColors(alert.type);
          
          return (
            <Card key={alert.id} className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 border ${colors.border} p-6 hover:scale-[1.01] transition-transform`}>
              <div className="flex items-start gap-4">
                {/* Alert Icon */}
                <div className={`${colors.bg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>

                {/* Alert Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-white">{alert.title}</h4>
                        {alert.actionRequired && (
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-emerald-300/70 text-sm mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-emerald-300/50">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp}
                        </span>
                        <span>•</span>
                        <span>{alert.category}</span>
                        <span>•</span>
                        <span>{alert.asset}</span>
                      </div>
                    </div>
                    <Badge className={colors.badge}>
                      {alert.type}
                    </Badge>
                  </div>

                  {/* Alert Details */}
                  <div className={`${colors.bg} rounded-lg p-3 mb-3 border ${colors.border}`}>
                    <p className="text-emerald-300/70 text-sm">{alert.details}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {alert.actionRequired ? (
                      <>
                        <Button size="sm" className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30">
                          <Activity className="w-3 h-3 mr-1" />
                          Take Action
                        </Button>
                        <Button size="sm" variant="outline" className="bg-slate-900/50 border-emerald-500/20 text-emerald-300/70 hover:bg-slate-900/70">
                          View Details
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" className="bg-slate-900/50 border-emerald-500/20 text-emerald-300/70 hover:bg-slate-900/70">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Mark as Read
                        </Button>
                        <Button size="sm" variant="outline" className="bg-slate-900/50 border-emerald-500/20 text-emerald-300/70 hover:bg-slate-900/70">
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Alert Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-6">Alert Channels</h3>
          <div className="space-y-3">
            {[
              { channel: 'In-App Notifications', enabled: true, count: 43 },
              { channel: 'Email Alerts', enabled: true, count: 28 },
              { channel: 'SMS (Critical Only)', enabled: true, count: 3 },
              { channel: 'Webhook Integration', enabled: true, count: 43 },
              { channel: 'Slack Integration', enabled: false, count: 0 },
              { channel: 'Discord Notifications', enabled: false, count: 0 },
            ].map((channel) => (
              <div key={channel.channel} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-emerald-500/10">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${channel.enabled ? 'bg-emerald-400' : 'bg-gray-500'}`}></div>
                  <div>
                    <div className="text-white text-sm">{channel.channel}</div>
                    <div className="text-emerald-300/70 text-xs">{channel.count} alerts sent today</div>
                  </div>
                </div>
                <Badge className={channel.enabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-gray-500/20 text-gray-300 border-gray-500/30'}>
                  {channel.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
          <h3 className="text-white mb-6">Alert Thresholds</h3>
          <div className="space-y-4">
            {[
              { metric: 'Oracle Verification Failure', threshold: 3, current: 1, unit: 'failures/hour' },
              { metric: 'Trading Volume Spike', threshold: 200, current: 347, unit: '% increase' },
              { metric: 'Governance Quorum Risk', threshold: 75, current: 62, unit: '% of votes' },
              { metric: 'Custodian Node Latency', threshold: 100, current: 45, unit: 'ms' },
              { metric: 'Sensor Network Uptime', threshold: 99, current: 99.4, unit: '%' },
            ].map((threshold) => {
              const isWarning = threshold.metric === 'Trading Volume Spike' || threshold.metric === 'Governance Quorum Risk';
              return (
                <div key={threshold.metric} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-300/70">{threshold.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className={isWarning ? 'text-yellow-300' : 'text-emerald-300'}>
                        {threshold.current} {threshold.unit}
                      </span>
                      {isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-300/50">
                    <span>Threshold: {threshold.threshold} {threshold.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Alert History Summary */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Alert Activity (Last 24 Hours)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-red-300 text-3xl mb-2">3</div>
            <div className="text-emerald-300/70 text-sm">Critical Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-300 text-3xl mb-2">12</div>
            <div className="text-emerald-300/70 text-sm">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-blue-300 text-3xl mb-2">28</div>
            <div className="text-emerald-300/70 text-sm">Info Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-emerald-300 text-3xl mb-2">47</div>
            <div className="text-emerald-300/70 text-sm">Resolved</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

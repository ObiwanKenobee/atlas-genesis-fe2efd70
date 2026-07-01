import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  DollarSign,
  TreePine,
  Globe,
  Calendar,
  Download,
  ArrowUpRight,
  Award,
  Target,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardMetricCard, DashboardChart, DashboardTable, type TableColumn } from '@/components/dashboard/shared';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

interface Donation {
  id: string;
  date: string;
  amount: number;
  project: string;
  impact: string;
  status: 'completed' | 'pending' | 'processing';
}

interface ImpactMetric {
  category: string;
  value: number;
  unit: string;
  change: number;
}

const DonorDashboard = () => {
  const { user, loading } = useAuth();
  const { user: enhancedUser, loading: enhancedLoading } = useEnhancedAuth();
  const navigate = useNavigate();
  
  // Use enhanced auth for demo mode, fallback to regular auth
  const currentUser = enhancedUser || user;
  const isLoading = enhancedLoading || loading;
  const [donations, setDonations] = useState<Donation[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [totalImpact, setTotalImpact] = useState(0);
  const [projectsSupported, setProjectsSupported] = useState(0);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/auth');
      return;
    }

    // Mock data for demo
    const mockDonations: Donation[] = [
      {
        id: '1',
        date: '2025-01-28',
        amount: 5000,
        project: 'Amazon Rainforest Protection',
        impact: '1250 tons CO2',
        status: 'completed',
      },
      {
        id: '2',
        date: '2025-01-25',
        amount: 2500,
        project: 'Ocean Restoration Initiative',
        impact: '500 tons CO2',
        status: 'completed',
      },
      {
        id: '3',
        date: '2025-01-20',
        amount: 10000,
        project: 'Reforestation Project Kenya',
        impact: '2500 tons CO2',
        status: 'completed',
      },
      {
        id: '4',
        date: '2025-01-15',
        amount: 7500,
        project: 'Sustainable Agriculture Program',
        impact: '1875 tons CO2',
        status: 'completed',
      },
      {
        id: '5',
        date: '2025-01-10',
        amount: 3000,
        project: 'Clean Water Initiative',
        impact: '750 tons CO2',
        status: 'processing',
      },
    ];

    const mockImpactMetrics: ImpactMetric[] = [
      { category: 'Carbon Offset', value: 6875, unit: 'tons', change: 12.5 },
      { category: 'Trees Planted', value: 137500, unit: 'trees', change: 8.3 },
      { category: 'Lives Impacted', value: 25000, unit: 'people', change: 15.2 },
      { category: 'Hectares Protected', value: 12500, unit: 'ha', change: 10.1 },
    ];

    setDonations(mockDonations);
    setImpactMetrics(mockImpactMetrics);
    setTotalDonated(28000);
    setTotalImpact(6875);
    setProjectsSupported(5);
  }, [user, loading, navigate]);

  const donationColumns: TableColumn<Donation>[] = [
    {
      key: 'date',
      title: 'Date',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'project',
      title: 'Project',
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      key: 'impact',
      title: 'Impact',
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge
          variant={value === 'completed' ? 'default' : 'secondary'}
          className={
            value === 'completed'
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-amber-500/10 text-amber-500'
          }
        >
          {value}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceLayout
      title="Donor Dashboard"
      subtitle="Track your donations and measure your regenerative impact"
      userType="donor"
    >
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardMetricCard
              title="Total Donated"
              value={`$${totalDonated.toLocaleString()}`}
              change={15.2}
              icon={DollarSign}
              iconColor="text-emerald-500"
              trend="up"
              description="Lifetime contribution to regenerative projects"
            />
            <DashboardMetricCard
              title="Total Impact"
              value={`${totalImpact.toLocaleString()} tons`}
              change={12.5}
              icon={TreePine}
              iconColor="text-green-500"
              trend="up"
              description="CO2 offset through your donations"
            />
            <DashboardMetricCard
              title="Projects Supported"
              value={projectsSupported}
              change={8.3}
              icon={Target}
              iconColor="text-blue-500"
              trend="up"
              description="Number of regenerative projects funded"
            />
            <DashboardMetricCard
              title="Impact Score"
              value="94.2"
              change={5.1}
              icon={Award}
              iconColor="text-purple-500"
              trend="up"
              description="Your overall impact rating"
            />
          </div>

          {/* Impact Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DashboardChart
              title="Impact Breakdown"
              icon={Heart}
              iconColor="text-emerald-500"
              description="Your regenerative impact across different categories"
            >
              <div className="space-y-4">
                {impactMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {metric.value.toLocaleString()} {metric.unit}
                      </span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress toward goal</span>
                      <span className={metric.change > 0 ? 'text-emerald-500' : 'text-red-500'}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardChart>

            <DashboardChart
              title="Recent Activity"
              icon={Calendar}
              iconColor="text-blue-500"
              description="Your donation history over time"
            >
              <div className="space-y-4">
                {donations.slice(0, 5).map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{donation.project}</p>
                        <p className="text-xs text-muted-foreground">{donation.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${donation.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{donation.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardChart>
          </div>

          {/* Donation History */}
          <DashboardTable
            title="Donation History"
            icon={DollarSign}
            iconColor="text-emerald-500"
            columns={donationColumns}
            data={donations}
            onRowClick={(donation) => console.log('View donation:', donation.id)}
            emptyMessage="No donations yet. Start making an impact today!"
          />

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                asChild
                size="lg"
                className="gap-2 h-auto py-6 flex-col"
              >
                <a href="/marketplace" className="flex items-center gap-2">
                  <Heart className="w-6 h-6" />
                  <span>Make a Donation</span>
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 h-auto py-6 flex-col"
              >
                <a href="/portfolio" className="flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  <span>View Portfolio</span>
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 h-auto py-6 flex-col"
              >
                <a href="#" className="flex items-center gap-2">
                  <Download className="w-6 h-6" />
                  <span>Download Report</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Impact Stories */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Your Impact Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <TreePine className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Amazon Rainforest</h3>
                      <p className="text-sm text-muted-foreground">Brazil</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your donation helped protect 1,250 hectares of pristine rainforest,
                    preserving biodiversity and sequestering carbon.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-500/10 text-emerald-500">
                      Active
                    </Badge>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View Details <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Ocean Restoration</h3>
                      <p className="text-sm text-muted-foreground">Pacific Ocean</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supporting coral reef restoration and marine ecosystem recovery
                    through sustainable fishing practices.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-500/10 text-blue-500">
                      Active
                    </Badge>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View Details <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Community Support</h3>
                      <p className="text-sm text-muted-foreground">Kenya</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Empowering local communities with sustainable agriculture
                    training and resources.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-purple-500/10 text-purple-500">
                      Active
                    </Badge>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View Details <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </WorkspaceLayout>
    );
  };

  export default DonorDashboard;

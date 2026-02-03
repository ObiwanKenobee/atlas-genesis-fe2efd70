import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  TrendingUp,
  Target,
  Users,
  CheckCircle,
  AlertTriangle,
  Globe,
  FileText,
  ArrowUpRight,
  MapPin,
  Calendar,
  Plus,
  BarChart3,
  Shield,
  Activity,
  Database,
  Clock,
  XCircle,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardMetricCard, DashboardChart, DashboardTable, type TableColumn } from '@/components/dashboard/shared';
import Header from '@/components/EnterpriseHeader';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';

interface RegionalMetric {
  region: string;
  projects: number;
  funding: number;
  impact: number;
  progress: number;
}

interface FundingRequest {
  id: string;
  project: string;
  region: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  submittedDate: string;
}

const GovernmentDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [regionalMetrics, setRegionalMetrics] = useState<RegionalMetric[]>([]);
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [totalFunding, setTotalFunding] = useState(0);
  const [approvedFunding, setApprovedFunding] = useState(0);
  const [activeRegions, setActiveRegions] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    // Mock data for demo
    const mockRegionalMetrics: RegionalMetric[] = [
      { region: 'North America', projects: 245, funding: 45000000, impact: 125000, progress: 78 },
      { region: 'Europe', projects: 189, funding: 32000000, impact: 98000, progress: 85 },
      { region: 'Asia Pacific', projects: 312, funding: 58000000, impact: 156000, progress: 72 },
      { region: 'Africa', projects: 156, funding: 24000000, impact: 78000, progress: 65 },
      { region: 'South America', projects: 98, funding: 18000000, impact: 54000, progress: 82 },
    ];

    const mockFundingRequests: FundingRequest[] = [
      {
        id: '1',
        project: 'Amazon Rainforest Protection Phase 2',
        region: 'South America',
        amount: 15000000,
        status: 'approved',
        submittedDate: '2025-01-28',
      },
      {
        id: '2',
        project: 'Sahel Green Belt Initiative',
        region: 'Africa',
        amount: 8500000,
        status: 'disbursed',
        submittedDate: '2025-01-25',
      },
      {
        id: '3',
        project: 'Southeast Asia Reforestation',
        region: 'Asia Pacific',
        amount: 12000000,
        status: 'pending',
        submittedDate: '2025-01-30',
      },
      {
        id: '4',
        project: 'European Wetland Restoration',
        region: 'Europe',
        amount: 9500000,
        status: 'approved',
        submittedDate: '2025-01-20',
      },
      {
        id: '5',
        project: 'North American Urban Forestry',
        region: 'North America',
        amount: 5000000,
        status: 'rejected',
        submittedDate: '2025-01-15',
      },
    ];

    setRegionalMetrics(mockRegionalMetrics);
    setFundingRequests(mockFundingRequests);
    setTotalFunding(178000000);
    setApprovedFunding(24500000);
    setActiveRegions(5);
  }, [user, loading, navigate]);

  const regionalColumns: TableColumn<RegionalMetric>[] = [
    {
      key: 'region',
      title: 'Region',
      render: (value) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'projects',
      title: 'Projects',
      render: (value) => `${value} active`,
    },
    {
      key: 'funding',
      title: 'Funding',
      render: (value) => `$${(Number(value) / 1000000).toFixed(1)}M`,
    },
    {
      key: 'impact',
      title: 'Impact',
      render: (value) => `${(Number(value) / 1000).toFixed(0)}K tons`,
    },
    {
      key: 'progress',
      title: 'Progress',
      render: (value) => (
        <div className="w-24">
          <Progress value={value as number} className="h-2" />
          <span className="text-xs text-muted-foreground mt-1">{value}%</span>
        </div>
      ),
    },
  ];

  const fundingColumns: TableColumn<FundingRequest>[] = [
    {
      key: 'project',
      title: 'Project',
    },
    {
      key: 'region',
      title: 'Region',
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const statusConfig = {
          pending: { color: 'bg-amber-500/10 text-amber-500', icon: Clock },
          approved: { color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle },
          disbursed: { color: 'bg-blue-500/10 text-blue-500', icon: CheckCircle },
          rejected: { color: 'bg-red-500/10 text-red-500', icon: XCircle },
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        const Icon = config.icon;
        return (
          <Badge className={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {value}
          </Badge>
        );
      },
    },
    {
      key: 'submittedDate',
      title: 'Submitted',
      render: (value) => new Date(value).toLocaleDateString(),
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Government Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
                National/regional oversight and outcome-based funding
              </p>
            </motion.div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardMetricCard
              title="Total Funding"
              value={`$${(totalFunding / 1000000).toFixed(1)}M`}
              change={12.5}
              icon={Target}
              iconColor="text-emerald-500"
              trend="up"
              description="Allocated across all regions"
            />
            <DashboardMetricCard
              title="Approved Funding"
              value={`$${(approvedFunding / 1000000).toFixed(1)}M`}
              change={8.3}
              icon={CheckCircle}
              iconColor="text-blue-500"
              trend="up"
              description="Funding approved for disbursement"
            />
            <DashboardMetricCard
              title="Active Regions"
              value={activeRegions}
              change={5.2}
              icon={Globe}
              iconColor="text-purple-500"
              trend="up"
              description="Regions with active projects"
            />
            <DashboardMetricCard
              title="Total Impact"
              value="506K"
              change={15.7}
              icon={TrendingUp}
              iconColor="text-green-500"
              trend="up"
              description="Tons CO2 offset this year"
            />
          </div>

          {/* Regional Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DashboardTable
              title="Regional Performance"
              icon={Globe}
              iconColor="text-emerald-500"
              columns={regionalColumns}
              data={regionalMetrics}
              onRowClick={(region) => console.log('View region:', region.region)}
              emptyMessage="No regional data available."
            />

            <DashboardTable
              title="Funding Requests"
              icon={Target}
              iconColor="text-blue-500"
              columns={fundingColumns}
              data={fundingRequests}
              onRowClick={(request) => console.log('View request:', request.id)}
              emptyMessage="No funding requests found."
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                asChild
                size="lg"
                className="gap-2 h-auto py-6 flex-col"
              >
                <a href="#" className="flex items-center gap-2">
                  <Plus className="w-6 h-6" />
                  <span>New Funding Request</span>
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 h-auto py-6 flex-col"
              >
                <a href="#" className="flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  <span>View Reports</span>
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 h-auto py-6 flex-col"
              >
                <a href="#" className="flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  <span>Policy Simulation</span>
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 h-auto py-6 flex-col"
              >
                <a href="#" className="flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  <span>Audit Trail</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Funding Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Funding Distribution</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardChart
                title="Funding by Region"
                icon={Globe}
                iconColor="text-emerald-500"
                description="Regional funding allocation breakdown"
              >
                <div className="space-y-4">
                  {regionalMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.region}</span>
                        <span className="text-sm text-muted-foreground">
                          ${(metric.funding / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <Progress value={metric.progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{metric.projects} projects</span>
                        <span>{(metric.impact / 1000).toFixed(0)}K tons impact</span>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardChart>

              <DashboardChart
                title="Funding Status"
                icon={Target}
                iconColor="text-blue-500"
                description="Current funding request status breakdown"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                      <div>
                        <p className="font-semibold">Approved</p>
                        <p className="text-sm text-muted-foreground">Funding approved for disbursement</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-emerald-500">2</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-8 h-8 text-amber-500" />
                      <div>
                        <p className="font-semibold">Pending</p>
                        <p className="text-sm text-muted-foreground">Awaiting review</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-amber-500">1</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-semibold">Disbursed</p>
                        <p className="text-sm text-muted-foreground">Funds transferred</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-500">1</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-8 h-8 text-red-500" />
                      <div>
                        <p className="font-semibold">Rejected</p>
                        <p className="text-sm text-muted-foreground">Request denied</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-red-500">1</span>
                  </div>
                </div>
              </DashboardChart>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GovernmentDashboard;

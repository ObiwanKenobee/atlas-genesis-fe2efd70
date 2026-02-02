import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  BookOpen,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  FileText,
  Award,
  Globe,
  Heart,
  ArrowUpRight,
  BarChart3,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardMetricCard, DashboardChart, DashboardTable, type TableColumn } from '@/components/dashboard/shared';
import Header from '@/components/EnterpriseHeader';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';

interface Program {
  id: string;
  name: string;
  type: string;
  participants: number;
  status: 'active' | 'completed' | 'upcoming';
  startDate: string;
  progress: number;
}

interface Resource {
  id: string;
  title: string;
  type: string;
  downloads: number;
  lastUpdated: string;
}

const CommunityDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activePrograms, setActivePrograms] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [completedPrograms, setCompletedPrograms] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    // Mock data for demo
    const mockPrograms: Program[] = [
      {
        id: '1',
        name: 'Regenerative Agriculture Training',
        type: 'Education',
        participants: 245,
        status: 'active',
        startDate: '2025-01-15',
        progress: 75,
      },
      {
        id: '2',
        name: 'Youth Environmental Stewardship',
        type: 'Community',
        participants: 189,
        status: 'active',
        startDate: '2025-01-20',
        progress: 60,
      },
      {
        id: '3',
        name: 'Sustainable Fishing Practices',
        type: 'Training',
        participants: 156,
        status: 'completed',
        startDate: '2025-01-10',
        progress: 100,
      },
      {
        id: '4',
        name: 'Community Garden Initiative',
        type: 'Project',
        participants: 312,
        status: 'active',
        startDate: '2025-01-25',
        progress: 45,
      },
      {
        id: '5',
        name: 'Water Conservation Workshop',
        type: 'Workshop',
        participants: 87,
        status: 'upcoming',
        startDate: '2025-02-05',
        progress: 0,
      },
    ];

    const mockResources: Resource[] = [
      {
        id: '1',
        title: 'Regenerative Farming Guide',
        type: 'PDF',
        downloads: 1247,
        lastUpdated: '2025-01-28',
      },
      {
        id: '2',
        title: 'Community Engagement Toolkit',
        type: 'PDF',
        downloads: 892,
        lastUpdated: '2025-01-25',
      },
      {
        id: '3',
        title: 'Impact Measurement Handbook',
        type: 'PDF',
        downloads: 654,
        lastUpdated: '2025-01-20',
      },
      {
        id: '4',
        title: 'Educational Videos Series',
        type: 'Video',
        downloads: 2341,
        lastUpdated: '2025-01-30',
      },
    ];

    setPrograms(mockPrograms);
    setResources(mockResources);
    setActivePrograms(2);
    setTotalParticipants(989);
    setCompletedPrograms(1);
  }, [user, loading, navigate]);

  const programColumns: TableColumn<Program>[] = [
    {
      key: 'name',
      title: 'Program Name',
    },
    {
      key: 'type',
      title: 'Type',
      render: (value) => (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">
          {value}
        </Badge>
      ),
    },
    {
      key: 'participants',
      title: 'Participants',
      render: (value) => `${value} enrolled`,
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const statusConfig = {
          active: { color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle },
          completed: { color: 'bg-blue-500/10 text-blue-500', icon: CheckCircle },
          upcoming: { color: 'bg-purple-500/10 text-purple-500', icon: Calendar },
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
      key: 'progress',
      title: 'Progress',
      render: (value) => (
        <div className="w-24">
          <Progress value={value} className="h-2" />
          <span className="text-xs text-muted-foreground mt-1">{value}%</span>
        </div>
      ),
    },
    {
      key: 'startDate',
      title: 'Start Date',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const resourceColumns: TableColumn<Resource>[] = [
    {
      key: 'title',
      title: 'Resource Title',
    },
    {
      key: 'type',
      title: 'Type',
      render: (value) => (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500">
          {value}
        </Badge>
      ),
    },
    {
      key: 'downloads',
      title: 'Downloads',
      render: (value) => `${value.toLocaleString()}`,
    },
    {
      key: 'lastUpdated',
      title: 'Last Updated',
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
                Community Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage educational programs and community initiatives
              </p>
            </motion.div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardMetricCard
              title="Active Programs"
              value={activePrograms}
              change={12.5}
              icon={GraduationCap}
              iconColor="text-emerald-500"
              trend="up"
              description="Programs currently running"
            />
            <DashboardMetricCard
              title="Total Participants"
              value={totalParticipants}
              change={8.3}
              icon={Users}
              iconColor="text-blue-500"
              trend="up"
              description="People engaged in programs"
            />
            <DashboardMetricCard
              title="Completed Programs"
              value={completedPrograms}
              change={15.2}
              icon={Award}
              iconColor="text-purple-500"
              trend="up"
              description="Programs successfully finished"
            />
            <DashboardMetricCard
              title="Resource Downloads"
              value={5134}
              change={22.1}
              icon={BookOpen}
              iconColor="text-amber-500"
              trend="up"
              description="Educational materials accessed"
            />
          </div>

          {/* Programs Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DashboardTable
              title="Active Programs"
              icon={GraduationCap}
              iconColor="text-emerald-500"
              columns={programColumns}
              data={programs}
              onRowClick={(program) => console.log('View program:', program.id)}
              emptyMessage="No active programs. Start a new program today!"
            />

            <DashboardTable
              title="Educational Resources"
              icon={BookOpen}
              iconColor="text-purple-500"
              columns={resourceColumns}
              data={resources}
              onRowClick={(resource) => console.log('View resource:', resource.id)}
              emptyMessage="No resources available."
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
                  <span>New Program</span>
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
                  <span>Add Resource</span>
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 h-auto py-6 flex-col"
              >
                <a href="#" className="flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  <span>Send Announcement</span>
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 h-auto py-6 flex-col"
              >
                <a href="#" className="flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  <span>View Community</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Program Categories */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Program Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Education</h3>
                      <p className="text-sm text-muted-foreground">3 active programs</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    School programs, youth education, and community workshops
                  </p>
                  <Progress value={75} className="h-2 mb-2" />
                  <Button variant="ghost" size="sm" className="gap-1 w-full">
                    View Programs <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Community</h3>
                      <p className="text-sm text-muted-foreground">2 active programs</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Community engagement, local initiatives, and cooperative projects
                  </p>
                  <Progress value={60} className="h-2 mb-2" />
                  <Button variant="ghost" size="sm" className="gap-1 w-full">
                    View Programs <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Training</h3>
                      <p className="text-sm text-muted-foreground">4 active programs</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Skill development, capacity building, and technical training
                  </p>
                  <Progress value={45} className="h-2 mb-2" />
                  <Button variant="ghost" size="sm" className="gap-1 w-full">
                    View Programs <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Community Meeting</h3>
                      <p className="text-sm text-muted-foreground">Feb 5, 2025</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Monthly community gathering to discuss regenerative initiatives
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-500/10 text-emerald-500">
                      45 attending
                    </Badge>
                    <Button variant="ghost" size="sm" className="gap-1">
                      Details <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Training Workshop</h3>
                      <p className="text-sm text-muted-foreground">Feb 10, 2025</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sustainable farming techniques for local producers
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-500/10 text-blue-500">
                      30 spots
                    </Badge>
                    <Button variant="ghost" size="sm" className="gap-1">
                      Register <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Impact Showcase</h3>
                      <p className="text-sm text-muted-foreground">Feb 15, 2025</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Present community achievements and success stories
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-purple-500/10 text-purple-500">
                      Open to all
                    </Badge>
                    <Button variant="ghost" size="sm" className="gap-1">
                      Details <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityDashboard;

import { useState } from 'react';
import { PageLayout } from '../components/PageLayout';
import { ResponsiveLayout, ResponsiveGrid, ResponsiveStack } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Leaf, TrendingUp, Award, Users, BarChart3, 
  Globe, Zap, Shield, Bell, Settings, Menu, X,
  ArrowUp, ArrowDown, Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { isMobile, isTablet } = useResponsive();
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Mock data
  const stats = {
    totalCredits: 1250,
    portfolioValue: 31250.75,
    co2Offset: 1875.5,
    trustScore: 0.82,
    activeProjects: 12,
    monthlyGrowth: 15.3
  };

  const chartData = [
    { month: 'Jan', credits: 100, value: 2500 },
    { month: 'Feb', credits: 150, value: 3750 },
    { month: 'Mar', credits: 200, value: 5000 },
    { month: 'Apr', credits: 180, value: 4500 },
    { month: 'May', credits: 220, value: 5500 },
    { month: 'Jun', credits: 250, value: 6250 }
  ];

  const pieData = [
    { name: 'Reforestation', value: 45, color: '#10B981' },
    { name: 'Renewable Energy', value: 30, color: '#3B82F6' },
    { name: 'Marine', value: 15, color: '#8B5CF6' },
    { name: 'Agriculture', value: 10, color: '#F59E0B' }
  ];

  const recentActivity = [
    { type: 'purchase', project: 'Amazon Conservation', amount: 100, time: '2 hours ago' },
    { type: 'retirement', project: 'Solar Farm Kenya', amount: 50, time: '1 day ago' },
    { type: 'purchase', project: 'Mangrove Restoration', amount: 75, time: '3 days ago' }
  ];

  return (
    <PageLayout>
      <ResponsiveLayout maxWidth="xl" padding="md">
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back!</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Track your carbon impact and portfolio performance.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <ResponsiveGrid 
          cols={{ mobile: 2, tablet: 3, desktop: 3, largeDesktop: 6 }}
          gap="md"
          className="mb-8"
        >
          {[
            { 
              icon: Leaf, 
              label: 'Total Credits', 
              value: stats.totalCredits.toLocaleString(), 
              change: '+12%',
              positive: true,
              color: 'text-green-500' 
            },
            { 
              icon: TrendingUp, 
              label: 'Portfolio Value', 
              value: `$${stats.portfolioValue.toLocaleString()}`, 
              change: '+15.3%',
              positive: true,
              color: 'text-blue-500' 
            },
            { 
              icon: Globe, 
              label: 'CO₂ Offset', 
              value: `${stats.co2Offset.toFixed(1)}t`, 
              change: '+8%',
              positive: true,
              color: 'text-purple-500' 
            },
            { 
              icon: Shield, 
              label: 'Trust Score', 
              value: `${(stats.trustScore * 100).toFixed(0)}%`, 
              change: '+2%',
              positive: true,
              color: 'text-yellow-500' 
            },
            { 
              icon: Award, 
              label: 'Active Projects', 
              value: stats.activeProjects.toString(), 
              change: '+3',
              positive: true,
              color: 'text-indigo-500' 
            },
            { 
              icon: Activity, 
              label: 'Monthly Growth', 
              value: `${stats.monthlyGrowth}%`, 
              change: '+5.2%',
              positive: true,
              color: 'text-emerald-500' 
            }
          ].map((stat, index) => (
            <Card key={stat.label} className="bg-card-gradient border-border/50">
              <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <stat.icon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ${stat.color}`} />
                    <div className={`flex items-center text-xs ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.positive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>
                      {stat.value}
                    </div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`${isMobile ? 'w-full grid grid-cols-3' : 'bg-muted/50'}`}>
            <TabsTrigger 
              value="overview" 
              className={`${isMobile ? 'text-xs px-2' : 'flex items-center space-x-2'}`}
            >
              <BarChart3 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && <span>Overview</span>}
              {isMobile && <span className="ml-1">Overview</span>}
            </TabsTrigger>
            <TabsTrigger 
              value="portfolio" 
              className={`${isMobile ? 'text-xs px-2' : 'flex items-center space-x-2'}`}
            >
              <Award className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && <span>Portfolio</span>}
              {isMobile && <span className="ml-1">Portfolio</span>}
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className={`${isMobile ? 'text-xs px-2' : 'flex items-center space-x-2'}`}
            >
              <Activity className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && <span>Activity</span>}
              {isMobile && <span className="ml-1">Activity</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ResponsiveGrid 
              cols={{ mobile: 1, tablet: 1, desktop: 2, largeDesktop: 2 }}
              gap="lg"
            >
              {/* Portfolio Growth Chart */}
              <Card className="bg-card-gradient border-border/50">
                <CardHeader>
                  <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
                    Portfolio Growth
                  </CardTitle>
                  <CardDescription>Credits and value over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Line 
                        type="monotone" 
                        dataKey="credits" 
                        stroke="#10B981" 
                        strokeWidth={2} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Portfolio Distribution */}
              <Card className="bg-card-gradient border-border/50">
                <CardHeader>
                  <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
                    Portfolio Distribution
                  </CardTitle>
                  <CardDescription>Credits by project type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`${isMobile ? 'space-y-4' : 'flex items-center space-x-6'}`}>
                    <ResponsiveContainer width={isMobile ? "100%" : "60%"} height={isMobile ? 150 : 200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 30 : 40}
                          outerRadius={isMobile ? 60 : 80}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'space-y-2'}`}>
                      {pieData.map((item) => (
                        <div key={item.name} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                            {item.name} ({item.value}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card className="bg-card-gradient border-border/50">
              <CardHeader>
                <CardTitle>Portfolio Summary</CardTitle>
                <CardDescription>Your carbon credit investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`${isMobile ? 'h-64' : 'h-96'} flex items-center justify-center bg-muted/20 rounded-lg`}>
                  <div className="text-center">
                    <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Detailed portfolio view coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-card-gradient border-border/50">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest transactions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 border border-border/50 rounded-lg ${isMobile ? 'flex-col space-y-2' : ''}`}>
                      <div className={`flex items-center space-x-3 ${isMobile ? 'w-full' : ''}`}>
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'purchase' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div className={isMobile ? 'flex-1' : ''}>
                          <div className={`font-medium text-foreground ${isMobile ? 'text-sm' : ''}`}>
                            {activity.type === 'purchase' ? 'Purchased' : 'Retired'} {activity.amount} credits
                          </div>
                          <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {activity.project}
                          </div>
                        </div>
                      </div>
                      <div className={`text-muted-foreground ${isMobile ? 'text-xs self-end' : 'text-sm'}`}>
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mobile Menu Overlay */}
        {isMobile && showMobileMenu && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-background w-full rounded-t-lg p-6 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Leaf className="w-4 h-4 mr-3" />
                  Browse Marketplace
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Award className="w-4 h-4 mr-3" />
                  View Portfolio
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        )}
      </ResponsiveLayout>
    </PageLayout>
  );
};

export default Dashboard;
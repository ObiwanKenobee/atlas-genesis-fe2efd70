import { PageLayout } from '../components/PageLayout';
import { ResponsiveLayout, ResponsiveGrid, ResponsiveStack } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Leaf, TrendingUp, Award, Clock, ArrowRight, 
  CheckCircle2, ExternalLink, FileText, BarChart3,
  Menu, X
} from 'lucide-react';
import { useState } from 'react';

const Portfolio = () => {
  const { isMobile, isTablet } = useResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock data
  const stats = {
    totalCredits: 1250,
    totalOffset: 1875.5,
    totalValue: 31250.75,
    retiredCredits: 450
  };

  const holdings = [
    {
      id: '1',
      title: 'Amazon Rainforest Conservation',
      project_type: 'reforestation',
      quantity: 500,
      purchase_price: 25.50,
      purchased_at: '2024-01-15',
      retired: false,
      co2_offset_per_credit: 1.5
    },
    {
      id: '2', 
      title: 'Solar Farm Development',
      project_type: 'renewable_energy',
      quantity: 750,
      purchase_price: 22.75,
      retired: true,
      co2_offset_per_credit: 1.2,
      certificate_id: 'CERT_2024_001'
    }
  ];

  return (
    <PageLayout>
      <ResponsiveLayout maxWidth="xl" padding="md">
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Your Carbon Portfolio
            </h1>
            <p className="text-muted-foreground">
              Track your carbon credit investments and environmental impact.
            </p>
          </div>
        )}

        {/* Stats Grid - Responsive */}
        <ResponsiveGrid 
          cols={{ mobile: 2, tablet: 2, desktop: 4, largeDesktop: 4 }}
          gap="md"
          className="mb-8"
        >
          {[
            { icon: Leaf, label: 'Total Credits', value: stats.totalCredits.toLocaleString(), color: 'text-primary' },
            { icon: TrendingUp, label: 'CO₂ Offset', value: `${stats.totalOffset.toFixed(1)} tonnes`, color: 'text-accent' },
            { icon: Award, label: 'Portfolio Value', value: `$${stats.totalValue.toFixed(2)}`, color: 'text-primary' },
            { icon: CheckCircle2, label: 'Retired Credits', value: stats.retiredCredits.toLocaleString(), color: 'text-green-500' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card-gradient border-border/50">
              <CardContent className={`p-4 ${isMobile ? 'p-3' : 'p-5'}`}>
                <ResponsiveStack 
                  direction={{ mobile: 'col', tablet: 'row', desktop: 'row' }}
                  spacing="sm"
                  align="center"
                >
                  <div className={`p-2 rounded-lg bg-muted ${stat.color} ${isMobile ? 'mb-2' : ''}`}>
                    <stat.icon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  </div>
                  <div className={isMobile ? 'text-center' : ''}>
                    <div className={`text-xs text-muted-foreground ${isMobile ? 'mb-1' : ''}`}>{stat.label}</div>
                    <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>{stat.value}</div>
                  </div>
                </ResponsiveStack>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>

        {/* Main Content Tabs - Responsive */}
        <Tabs defaultValue="holdings" className="space-y-6">
          <TabsList className={`bg-muted/50 ${isMobile ? 'w-full grid grid-cols-3' : ''}`}>
            <TabsTrigger value="holdings" className={`flex items-center ${isMobile ? 'text-xs px-2' : 'space-x-2'}`}>
              <Leaf className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && <span>Holdings</span>}
              {isMobile && <span className="ml-1">Holdings</span>}
            </TabsTrigger>
            <TabsTrigger value="analytics" className={`flex items-center ${isMobile ? 'text-xs px-2' : 'space-x-2'}`}>
              <BarChart3 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && <span>Analytics</span>}
              {isMobile && <span className="ml-1">Analytics</span>}
            </TabsTrigger>
            <TabsTrigger value="transactions" className={`flex items-center ${isMobile ? 'text-xs px-2' : 'space-x-2'}`}>
              <Clock className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && <span>Transactions</span>}
              {isMobile && <span className="ml-1">History</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="holdings">
            <Card className="bg-card-gradient border-border/50">
              <CardHeader className={`${isMobile ? 'pb-4' : ''}`}>
                <ResponsiveStack 
                  direction={{ mobile: 'col', tablet: 'row', desktop: 'row' }}
                  justify="between"
                  align={isMobile ? 'start' : 'center'}
                  spacing="md"
                >
                  <CardTitle className="text-foreground">Your Holdings</CardTitle>
                  <Button asChild variant="outline" size={isMobile ? "sm" : "default"} className="border-border/50">
                    <a href="/marketplace">
                      Browse Projects <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </ResponsiveStack>
              </CardHeader>
              <CardContent>
                {/* Mobile Holdings View */}
                {isMobile ? (
                  <div className="space-y-4">
                    {holdings.map((holding) => (
                      <Card key={holding.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium text-foreground text-sm">{holding.title}</h3>
                            <Badge variant={holding.retired ? "outline" : "default"} className="text-xs">
                              {holding.retired ? 'Retired' : 'Active'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Quantity:</span>
                              <div className="font-medium">{holding.quantity.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Price:</span>
                              <div className="font-medium">${holding.purchase_price.toFixed(2)}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              CO₂: {(holding.quantity * holding.co2_offset_per_credit).toFixed(1)}t
                            </span>
                            {holding.retired ? (
                              <Button variant="ghost" size="sm" className="text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                Certificate
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="text-xs">
                                Retire
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* Desktop Table View */
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-3 px-4">Project</th>
                          <th className="text-right py-3 px-4">Quantity</th>
                          <th className="text-right py-3 px-4">Price</th>
                          <th className="text-right py-3 px-4">CO₂ Offset</th>
                          <th className="text-center py-3 px-4">Status</th>
                          <th className="text-right py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map((holding) => (
                          <tr key={holding.id} className="border-b border-border/30">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-foreground">{holding.title}</div>
                                <div className="text-sm text-muted-foreground capitalize">{holding.project_type}</div>
                              </div>
                            </td>
                            <td className="text-right py-4 px-4 font-medium">
                              {holding.quantity.toLocaleString()}
                            </td>
                            <td className="text-right py-4 px-4">
                              ${holding.purchase_price.toFixed(2)}
                            </td>
                            <td className="text-right py-4 px-4 text-primary">
                              {(holding.quantity * holding.co2_offset_per_credit).toFixed(1)} t
                            </td>
                            <td className="text-center py-4 px-4">
                              <Badge variant={holding.retired ? "outline" : "default"}>
                                {holding.retired ? 'Retired' : 'Active'}
                              </Badge>
                            </td>
                            <td className="text-right py-4 px-4">
                              {holding.retired ? (
                                <Button variant="ghost" size="sm">
                                  <FileText className="w-4 h-4 mr-1" />
                                  Certificate
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm">
                                  Retire Credits
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-card-gradient border-border/50">
              <CardHeader>
                <CardTitle>Portfolio Analytics</CardTitle>
                <CardDescription>Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`${isMobile ? 'h-64' : 'h-96'} flex items-center justify-center bg-muted/20 rounded-lg`}>
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-card-gradient border-border/50">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`${isMobile ? 'h-64' : 'h-96'} flex items-center justify-center bg-muted/20 rounded-lg`}>
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Transaction history coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ResponsiveLayout>
    </PageLayout>
  );
};

export default Portfolio;

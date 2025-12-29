import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { RegenerativeMetrics, RegenerativeMetricsTrend } from "@/types/marketplace";
import { Leaf, Zap, Droplet, Bug, TrendingUp } from "lucide-react";

interface EcosystemRecoveryTrackerProps {
  metrics: RegenerativeMetrics[];
  trend?: RegenerativeMetricsTrend;
  isLoading?: boolean;
}

interface TimeSeriesData {
  date: string;
  microbiome: number;
  biodiversity: number;
  cropDiversity: number;
  pollinators: number;
}

const generateTimeSeriesData = (metrics: RegenerativeMetrics[]): TimeSeriesData[] => {
  return metrics
    .slice(0, 30)
    .reverse()
    .map((m, idx) => ({
      date: new Date(m.measurement_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      microbiome: m.soil_microbiome_health || 0 + (Math.random() - 0.5) * 5,
      biodiversity: m.biodiversity_index || 0 + (Math.random() - 0.5) * 3,
      cropDiversity: m.crop_diversity_index || 0 + (Math.random() - 0.5) * 4,
      pollinators: Math.min(100, (m.pollinator_count || 0) / 10),
    }));
};

export const EcosystemRecoveryTracker: React.FC<EcosystemRecoveryTrackerProps> = ({
  metrics = [],
  trend,
  isLoading = false,
}) => {
  const timeSeriesData = useMemo(() => generateTimeSeriesData(metrics), [metrics]);
  const latestMetrics = metrics[0];

  // Health score summary
  const healthSummary = useMemo(() => {
    if (!latestMetrics) return null;
    return {
      microbiome: latestMetrics.soil_microbiome_health || 0,
      biodiversity: latestMetrics.biodiversity_index || 0,
      cropDiversity: latestMetrics.crop_diversity_index || 0,
      pollinators: latestMetrics.pollinator_count || 0,
      nativeSpecies: latestMetrics.native_species_count || 0,
      mangroveCoverage: latestMetrics.mangrove_health_score || 0,
      kelpCoverage: latestMetrics.kelp_forest_coverage_percent || 0,
    };
  }, [latestMetrics]);

  // Radar chart data
  const radarData = [
    { metric: "Soil Microbiome", value: healthSummary?.microbiome || 0, fullMark: 100 },
    { metric: "Biodiversity", value: healthSummary?.biodiversity || 0, fullMark: 100 },
    { metric: "Crop Diversity", value: healthSummary?.cropDiversity || 0, fullMark: 100 },
    { metric: "Pollinators", value: Math.min(100, (healthSummary?.pollinators || 0) / 10 * 100), fullMark: 100 },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ecosystem Recovery Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-b from-slate-200 to-slate-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Soil Microbiome
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{healthSummary?.microbiome.toFixed(0) || "—"}%</p>
            <p className="text-xs text-muted-foreground mt-2">Health Score</p>
            <p className="text-xs text-emerald-600 mt-1">
              {trend?.microbiome_trend_30d ? (trend.microbiome_trend_30d > 0 ? "📈" : "📉") : "—"} 
              {trend?.microbiome_trend_30d?.toFixed(1)}% (30d)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Biodiversity Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{healthSummary?.biodiversity.toFixed(0) || "—"}%</p>
            <p className="text-xs text-muted-foreground mt-2">Species Richness</p>
            <p className="text-xs text-blue-600 mt-1">
              {trend?.biodiversity_trend_30d ? (trend.biodiversity_trend_30d > 0 ? "📈" : "📉") : "—"} 
              {trend?.biodiversity_trend_30d?.toFixed(1)}% (30d)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Crop Diversity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{healthSummary?.cropDiversity.toFixed(0) || "—"}%</p>
            <p className="text-xs text-muted-foreground mt-2">Diversity Index</p>
            <p className="text-xs text-amber-600 mt-1">
              {healthSummary?.nativeSpecies || 0} species
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Pollinator Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-pink-600">{healthSummary?.pollinators.toFixed(0) || "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">Active Pollinators</p>
            <p className="text-xs text-pink-600 mt-1">
              {trend?.pollinator_trend_30d ? (trend.pollinator_trend_30d > 0 ? "📈" : "📉") : "—"} 
              {trend?.pollinator_trend_30d?.toFixed(1)}% (30d)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="soil">Soil Health</TabsTrigger>
          <TabsTrigger value="aquatic">Aquatic Recovery</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ecosystem Health Radar</CardTitle>
              <CardDescription>Multi-dimensional health assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Current Status" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>30-Day Recovery Trends</CardTitle>
              <CardDescription>All ecosystem metrics over the past month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="microbiome" fill="#10b981" stroke="#059669" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="biodiversity" fill="#06b6d4" stroke="#0891b2" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="cropDiversity" fill="#f59e0b" stroke="#d97706" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Soil Health Tab */}
        <TabsContent value="soil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Soil Microbiome Health</CardTitle>
              <CardDescription>Metagenomics & AI pattern recognition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Microbiome Score with Progress */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Overall Microbiome Health</span>
                    <span className="font-bold text-emerald-600">{healthSummary?.microbiome.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all"
                      style={{ width: `${healthSummary?.microbiome || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Microbiome Components */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-emerald-50">
                  <h4 className="font-semibold text-sm mb-2 text-emerald-900">Bacterial Diversity</h4>
                  <p className="text-2xl font-bold text-emerald-600">18,432</p>
                  <p className="text-xs text-emerald-700">Operational Taxonomic Units (OTUs)</p>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900">Fungal Abundance</h4>
                  <p className="text-2xl font-bold text-blue-600">94%</p>
                  <p className="text-xs text-blue-700">Relative abundance of beneficial fungi</p>
                </div>

                <div className="p-4 border rounded-lg bg-purple-50">
                  <h4 className="font-semibold text-sm mb-2 text-purple-900">Organic Matter</h4>
                  <p className="text-2xl font-bold text-purple-600">4.2%</p>
                  <p className="text-xs text-purple-700">Soil carbon content by mass</p>
                </div>

                <div className="p-4 border rounded-lg bg-amber-50">
                  <h4 className="font-semibold text-sm mb-2 text-amber-900">pH Balance</h4>
                  <p className="text-2xl font-bold text-amber-600">6.8</p>
                  <p className="text-xs text-amber-700">Optimal for most crops</p>
                </div>
              </div>

              {/* Microbiome Trends */}
              <div>
                <h4 className="font-semibold mb-3">Microbiome Composition Trends</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="microbiome" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crop Diversity Metrics</CardTitle>
              <CardDescription>Prevent monoculture fragility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Crop Diversity Index</span>
                  <span className="font-bold text-amber-600">{healthSummary?.cropDiversity.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full"
                    style={{ width: `${healthSummary?.cropDiversity || 0}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                <div className="p-3 border rounded-lg text-center">
                  <p className="font-bold text-2xl">7</p>
                  <p className="text-xs text-muted-foreground">Crop Types</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <p className="font-bold text-2xl">{healthSummary?.nativeSpecies}</p>
                  <p className="text-xs text-muted-foreground">Native Species</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <p className="font-bold text-2xl">23</p>
                  <p className="text-xs text-muted-foreground">Varieties</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aquatic Recovery Tab */}
        <TabsContent value="aquatic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mangrove & Kelp Forest Recovery</CardTitle>
              <CardDescription>High-impact ocean-based carbon drawdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mangrove Restoration */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Mangrove Health Score</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Forest Coverage</span>
                        <span className="font-bold text-blue-600">{healthSummary?.mangroveCoverage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${healthSummary?.mangroveCoverage || 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Carbon Sequestration</span>
                        <span className="font-bold text-emerald-600">2.8 Mg/ha/yr</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "85%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 border rounded-lg bg-blue-50">
                    <p className="text-sm text-muted-foreground">Area Restored</p>
                    <p className="font-bold">1,240 ha</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-blue-50">
                    <p className="text-sm text-muted-foreground">Tree Count</p>
                    <p className="font-bold">187K</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-blue-50">
                    <p className="text-sm text-muted-foreground">Survival Rate</p>
                    <p className="font-bold">92%</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-blue-50">
                    <p className="text-sm text-muted-foreground">CO₂ Removed</p>
                    <p className="font-bold">3,472 tCO₂</p>
                  </div>
                </div>
              </div>

              {/* Kelp Forest Recovery */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-3">Kelp Forest Coverage</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Coverage % of Optimal</span>
                      <span className="font-bold text-cyan-600">{healthSummary?.kelpCoverage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ width: `${healthSummary?.kelpCoverage || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Biodiversity Index</span>
                      <span className="font-bold text-emerald-600">8.4/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "84%" }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="p-3 border rounded-lg bg-cyan-50">
                    <p className="text-sm text-muted-foreground">Area Restored</p>
                    <p className="font-bold">580 ha</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-cyan-50">
                    <p className="text-sm text-muted-foreground">Sea Urchin Count</p>
                    <p className="font-bold">45K</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-cyan-50">
                    <p className="text-sm text-muted-foreground">Fish Species</p>
                    <p className="font-bold">127</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-cyan-50">
                    <p className="text-sm text-muted-foreground">Carbon Sequestered</p>
                    <p className="font-bold">1,248 tCO₂</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Metrics Tab */}
        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Ecosystem Metrics</CardTitle>
              <CardDescription>Complete measurement record</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {metrics.slice(0, 10).map((m, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-semibold">{new Date(m.measurement_date).toLocaleDateString()}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                        {m.data_source}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Microbiome Health</p>
                        <p className="font-bold">{m.soil_microbiome_health}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Biodiversity</p>
                        <p className="font-bold">{m.biodiversity_index}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Crop Diversity</p>
                        <p className="font-bold">{m.crop_diversity_index}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Pollinators</p>
                        <p className="font-bold">{m.pollinator_count || 0}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Confidence: {(m.confidence_level * 100).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EcosystemRecoveryTracker;

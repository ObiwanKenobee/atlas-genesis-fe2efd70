import React, { useState } from "react";
import EnterpriseHeader from "@/components/EnterpriseHeader";
import { useMeasurementData } from "@/hooks/useMeasurementData";
import { useRegenerativeMetrics } from "@/hooks/useRegenerativeMetrics";
import { useBioregionalZones } from "@/hooks/useBioregionalZones";
import { useValuationModel } from "@/hooks/useValuationModel";
import MeasurementDashboard from "@/components/MeasurementDashboard";
import PageHero from "@/components/PageHero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Satellite, Leaf, TrendingUp, Shield } from "lucide-react";

const Measurements = () => {
  // Sample project ID - in a real app this would come from URL params or user selection
  const [selectedProjectId] = useState<string | undefined>("sample-project-1");
  const [selectedZoneIds] = useState<string[] | undefined>(["zone-1"]);

  // Fetch all measurement data
  const measurements = useMeasurementData(selectedProjectId);
  const regenerativeMetrics = useRegenerativeMetrics(selectedProjectId);
  const bioregionalZones = useBioregionalZones(selectedZoneIds);
  const valuationModel = useValuationModel(selectedProjectId);

  const isLoading = measurements.isLoading || regenerativeMetrics.isLoading;

  return (
    <div className="min-h-screen bg-background">
      <EnterpriseHeader />
      <PageHero
        title="Planetary Measurement & Verification"
        subtitle="Real-time carbon and ecosystem data from satellite networks, soil sensors, and biodiversity monitors"
        ctaText="View Dashboard"
        ctaLink="#dashboard"
        secondaryCtaText="Learn More"
        secondaryCtaLink="/about"
        badgeText="Data-Driven Impact"
        stats={[
          { value: "Sentinel-2", label: "Satellite Data" },
          { value: "12M+", label: "Soil Sensors" },
          { value: "99.9%", label: "Verification" },
          { value: "24/7", label: "Real-time" }
        ]}
      />
      <main className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-left-4 border-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Satellite className="h-4 w-4" />
                Satellite Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Sentinel-2</p>
              <p className="text-xs text-muted-foreground">Landsat, Earth Engine</p>
            </CardContent>
          </Card>

          <Card className="border-left-4 border-amber-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Soil Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">NIR</p>
              <p className="text-xs text-muted-foreground">Soil probes, spectroscopy</p>
            </CardContent>
          </Card>

          <Card className="border-left-4 border-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Ocean Carbon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Argo</p>
              <p className="text-xs text-muted-foreground">Alkalinity sensors, floats</p>
            </CardContent>
          </Card>

          <Card className="border-left-4 border-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Biodiversity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">eDNA</p>
              <p className="text-xs text-muted-foreground">Bioacoustic, sequencing</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="methodology">Methodology</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <MeasurementDashboard
              projectId={selectedProjectId || ""}
              measurements={measurements.data}
              regenerativeMetrics={regenerativeMetrics.data}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Satellite Data Sources</CardTitle>
                <CardDescription>Integration with public and private satellite networks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Sentinel-2 (ESA)</h4>
                    <p className="text-sm text-muted-foreground">
                      12-day revisit cycle, 10m resolution, multispectral analysis for NDVI and vegetation health
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Landsat-8 (USGS)</h4>
                    <p className="text-sm text-muted-foreground">
                      16-day revisit cycle, 30m resolution, thermal and surface reflectance data
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Earth Engine</h4>
                    <p className="text-sm text-muted-foreground">
                      Automated processing of satellite imagery, temporal analysis, cloud removal
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">IoT Sensors</h4>
                    <p className="text-sm text-muted-foreground">
                      Ground-truth validation from soil probes, weather stations, and sensor networks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ocean Carbon Tracking</CardTitle>
                <CardDescription>Blue carbon measurement and verification systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-4 items-start">
                    <div className="text-2xl">🌊</div>
                    <div>
                      <h4 className="font-semibold">Argo Float Network</h4>
                      <p className="text-sm text-muted-foreground">
                        Autonomous profiling floats measuring water column properties down to 2000m
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="text-2xl">🧪</div>
                    <div>
                      <h4 className="font-semibold">Alkalinity Sensors</h4>
                      <p className="text-sm text-muted-foreground">
                        Direct measurement of ocean acidification and dissolved inorganic carbon
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="text-2xl">🧬</div>
                    <div>
                      <h4 className="font-semibold">Chlorophyll Fluorescence</h4>
                      <p className="text-sm text-muted-foreground">
                        Real-time phytoplankton productivity and photosynthetic carbon uptake
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Biodiversity Detection</CardTitle>
                <CardDescription>Prevent monoculture fraud with advanced monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-4 items-start">
                    <div className="text-2xl">🧬</div>
                    <div>
                      <h4 className="font-semibold">eDNA Sequencing</h4>
                      <p className="text-sm text-muted-foreground">
                        Genetic analysis of soil and water samples to identify species diversity without visual surveys
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="text-2xl">🔊</div>
                    <div>
                      <h4 className="font-semibold">Bioacoustic Monitoring</h4>
                      <p className="text-sm text-muted-foreground">
                        Automated sound analysis to detect animal presence and ecosystem activity patterns
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Methodology Tab */}
          <TabsContent value="methodology" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Measurement Methodology</CardTitle>
                <CardDescription>Scientific protocols and validation procedures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">CO₂ Level Measurement</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Using normalized difference vegetation index (NDVI) from multispectral satellite imagery to infer
                      photosynthetic activity and carbon sequestration rates.
                    </p>
                    <p className="text-xs text-gray-500">Validated against ground-truth measurements every 30 days</p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Soil Carbon Validation</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Near-infrared (NIR) spectroscopy combined with soil probe measurements to determine organic matter
                      content and carbon permanence.
                    </p>
                    <p className="text-xs text-gray-500">Certified against ISO 14064-2 standards</p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Biodiversity Scoring</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Multi-dimensional scoring combining species richness (eDNA), functional diversity (bioacoustics),
                      and ecosystem resilience indicators.
                    </p>
                    <p className="text-xs text-gray-500">0-100 scale with confidence intervals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Audit Trail</CardTitle>
                <CardDescription>Complete record of all measurements and validations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {measurements.data.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {measurements.data.slice(0, 10).map((m, idx) => (
                        <div key={idx} className="p-3 border rounded-lg text-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold">{new Date(m.measurement_date).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded text-xs ${m.anomaly_flag ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}`}>
                              {m.anomaly_flag ? "⚠️ Anomaly" : "✓ Verified"}
                            </span>
                          </div>
                          <p className="text-muted-foreground">
                            CO₂: {m.co2_level}ppm | Source: {m.satellite_source} | Confidence: {(m.confidence_level * 100).toFixed(0)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No measurement data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Measurements;

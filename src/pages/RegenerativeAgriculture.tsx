import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import EcosystemRecoveryTracker from "@/components/EcosystemRecoveryTracker";
import { useRegenerativeMetrics } from "@/hooks/useRegenerativeMetrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Droplet, Bug, TrendingUp, Award } from "lucide-react";

const RegenerativeAgriculture = () => {
  const [selectedProjectId] = useState<string | undefined>("sample-project-1");

  // Fetch regenerative metrics
  const metrics = useRegenerativeMetrics(selectedProjectId);

  // Generate sample metrics data for display
  const sampleMetrics = [
    {
      id: "m1",
      project_id: "sample-project-1",
      measurement_date: new Date(Date.now() - 0 * 86400000).toISOString(),
      soil_microbiome_health: 82,
      biodiversity_index: 78,
      pollinator_count: 450,
      native_species_count: 24,
      crop_diversity_index: 85,
      crop_types_count: 7,
      mangrove_health_score: 88,
      kelp_forest_coverage_percent: 76,
      data_source: "eDNA-Sample" as const,
      confidence_level: 0.95,
      notes: "Excellent ecosystem recovery. Native species returning.",
      created_at: new Date().toISOString(),
    },
    {
      id: "m2",
      project_id: "sample-project-1",
      measurement_date: new Date(Date.now() - 7 * 86400000).toISOString(),
      soil_microbiome_health: 79,
      biodiversity_index: 74,
      pollinator_count: 420,
      native_species_count: 22,
      crop_diversity_index: 81,
      crop_types_count: 7,
      mangrove_health_score: 85,
      kelp_forest_coverage_percent: 71,
      data_source: "Bioacoustic" as const,
      confidence_level: 0.92,
      notes: "Pollinator activity increasing. Crop yields stable.",
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "m3",
      project_id: "sample-project-1",
      measurement_date: new Date(Date.now() - 14 * 86400000).toISOString(),
      soil_microbiome_health: 76,
      biodiversity_index: 70,
      pollinator_count: 380,
      native_species_count: 20,
      crop_diversity_index: 77,
      crop_types_count: 6,
      mangrove_health_score: 80,
      kelp_forest_coverage_percent: 65,
      data_source: "eDNA-Sample" as const,
      confidence_level: 0.91,
      notes: "Early signs of ecosystem recovery.",
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
  ];

  const displayMetrics = metrics.data.length > 0 ? metrics.data : sampleMetrics;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Regenerative Agriculture & Ecosystem Recovery</h1>
          <p className="text-lg text-muted-foreground">
            Soil microbiome health, crop diversity metrics, mangrove/kelp restoration, and pollinator recovery
          </p>
        </div>

        {/* Impact Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Microbiome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">82%</p>
              <p className="text-xs text-muted-foreground">Health</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Biodiversity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">78%</p>
              <p className="text-xs text-muted-foreground">Index</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4" />
                Crop Diversity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">85%</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-pink-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Pollinators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">450</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Droplet className="h-4 w-4" />
                Water
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">88%</p>
              <p className="text-xs text-muted-foreground">Quality</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="recovery" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="recovery">Recovery Tracker</TabsTrigger>
            <TabsTrigger value="practices">Practices</TabsTrigger>
            <TabsTrigger value="income">Income Models</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
          </TabsList>

          {/* Recovery Tracker Tab */}
          <TabsContent value="recovery" className="space-y-6">
            <EcosystemRecoveryTracker
              metrics={displayMetrics}
              trend={metrics.trend || undefined}
              isLoading={metrics.isLoading}
            />
          </TabsContent>

          {/* Regenerative Practices Tab */}
          <TabsContent value="practices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regenerative Agriculture Practices</CardTitle>
                <CardDescription>Evidence-based methods for ecosystem recovery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Soil Health */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-emerald-600" />
                      Soil Regeneration
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-emerald-50">
                        <h4 className="font-semibold text-sm text-emerald-900 mb-2">Cover Cropping</h4>
                        <p className="text-sm text-emerald-800">
                          Growing non-cash crops to protect and enrich soil between growing seasons
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-emerald-50">
                        <h4 className="font-semibold text-sm text-emerald-900 mb-2">Composting</h4>
                        <p className="text-sm text-emerald-800">
                          Converting organic waste into nutrient-rich soil amendments
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-emerald-50">
                        <h4 className="font-semibold text-sm text-emerald-900 mb-2">No-Till Farming</h4>
                        <p className="text-sm text-emerald-800">
                          Minimizing soil disturbance to preserve microbiome structure and function
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-emerald-50">
                        <h4 className="font-semibold text-sm text-emerald-900 mb-2">Crop Rotation</h4>
                        <p className="text-sm text-emerald-800">
                          Varying crops to maintain soil fertility and prevent disease buildup
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Biodiversity */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Biodiversity Enhancement
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <h4 className="font-semibold text-sm text-blue-900 mb-2">Polyculture</h4>
                        <p className="text-sm text-blue-800">
                          Growing multiple crop species together to increase genetic and functional diversity
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-blue-50">
                        <h4 className="font-semibold text-sm text-blue-900 mb-2">Hedgerow Planting</h4>
                        <p className="text-sm text-blue-800">
                          Creating wildlife corridors with native trees and shrubs
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-blue-50">
                        <h4 className="font-semibold text-sm text-blue-900 mb-2">Pollinator Habitat</h4>
                        <p className="text-sm text-blue-800">
                          Establishing flowering areas to support bees, butterflies, and other pollinators
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-blue-50">
                        <h4 className="font-semibold text-sm text-blue-900 mb-2">Agroforestry</h4>
                        <p className="text-sm text-blue-800">
                          Integrating trees with crops and livestock for ecosystem services
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Water Management */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Droplet className="h-5 w-5 text-cyan-600" />
                      Water & Soil Conservation
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-cyan-50">
                        <h4 className="font-semibold text-sm text-cyan-900 mb-2">Rainwater Harvesting</h4>
                        <p className="text-sm text-cyan-800">
                          Capturing and storing rainfall to reduce irrigation needs
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-cyan-50">
                        <h4 className="font-semibold text-sm text-cyan-900 mb-2">Contour Plowing</h4>
                        <p className="text-sm text-cyan-800">
                          Plowing along elevation lines to prevent erosion and runoff
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-cyan-50">
                        <h4 className="font-semibold text-sm text-cyan-900 mb-2">Riparian Buffers</h4>
                        <p className="text-sm text-cyan-800">
                          Vegetated zones along waterways to filter runoff and protect aquatic ecosystems
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-cyan-50">
                        <h4 className="font-semibold text-sm text-cyan-900 mb-2">Mulching</h4>
                        <p className="text-sm text-cyan-800">
                          Covering soil with organic material to retain moisture and prevent erosion
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Climate Adaptation */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      Climate Adaptation
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-amber-50">
                        <h4 className="font-semibold text-sm text-amber-900 mb-2">Crop Rotation Scheduling</h4>
                        <p className="text-sm text-amber-800">
                          Planning rotations based on climate projections and seasonality
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-amber-50">
                        <h4 className="font-semibold text-sm text-amber-900 mb-2">Drought-Resistant Varieties</h4>
                        <p className="text-sm text-amber-800">
                          Selecting and breeding crops suited to changing climate patterns
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-amber-50">
                        <h4 className="font-semibold text-sm text-amber-900 mb-2">Pest Management</h4>
                        <p className="text-sm text-amber-800">
                          Using biological controls and integrated pest management to reduce inputs
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-amber-50">
                        <h4 className="font-semibold text-sm text-amber-900 mb-2">Diversity for Resilience</h4>
                        <p className="text-sm text-amber-800">
                          Multiple crops and varieties provide buffer against climate shocks
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Income Models Tab */}
          <TabsContent value="income" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recurring Regenerative Income</CardTitle>
                <CardDescription>Farmers earn steady income for ecosystem function</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Direct Income Streams</h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm text-emerald-900">Soil Health Credits</h4>
                          <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-1 rounded">Monthly</span>
                        </div>
                        <p className="text-sm text-emerald-800 mb-2">
                          Earn $50-150/acre/month based on microbiome health scores
                        </p>
                        <p className="text-xs text-emerald-700">Measured via eDNA analysis every 30 days</p>
                      </div>

                      <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm text-blue-900">Biodiversity Credits</h4>
                          <span className="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded">Quarterly</span>
                        </div>
                        <p className="text-sm text-blue-800 mb-2">
                          Earn $100-300/acre/quarter for native species recovery
                        </p>
                        <p className="text-xs text-blue-700">Verified through bioacoustic monitoring</p>
                      </div>

                      <div className="p-4 border rounded-lg bg-gradient-to-r from-pink-50 to-pink-100">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm text-pink-900">Pollinator Bonuses</h4>
                          <span className="text-xs bg-pink-200 text-pink-900 px-2 py-1 rounded">Seasonal</span>
                        </div>
                        <p className="text-sm text-pink-800 mb-2">
                          $200-500/acre/season when pollinator counts hit targets
                        </p>
                        <p className="text-xs text-pink-700">Measured via sensor networks & visual surveys</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Premium Market Access</h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-amber-100">
                        <h4 className="font-semibold text-sm text-amber-900 mb-2">Certified Regenerative Crops</h4>
                        <p className="text-sm text-amber-800 mb-2">
                          Premium pricing: 15-30% markup over conventional crops
                        </p>
                        <p className="text-xs text-amber-700">Direct access to eco-conscious buyers</p>
                      </div>

                      <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                        <h4 className="font-semibold text-sm text-purple-900 mb-2">Carbon Credit Aggregation</h4>
                        <p className="text-sm text-purple-800 mb-2">
                          Combine micro-credits with other farms to access larger buyers
                        </p>
                        <p className="text-xs text-purple-700">Pooling mechanism for farmer cooperatives</p>
                      </div>

                      <div className="p-4 border rounded-lg bg-gradient-to-r from-cyan-50 to-cyan-100">
                        <h4 className="font-semibold text-sm text-cyan-900 mb-2">Agritourism & Education</h4>
                        <p className="text-sm text-cyan-800 mb-2">
                          Partner with platforms to host farm visits, workshops, school programs
                        </p>
                        <p className="text-xs text-cyan-700">$5K-50K/year for popular destinations</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-l-4 border-l-green-600 bg-green-50 rounded-lg">
                  <p className="font-semibold text-green-900 mb-2">Annual Income Example (500-acre farm)</p>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✓ Soil health credits: $30K-90K/year</li>
                    <li>✓ Biodiversity credits: $50K-150K/year</li>
                    <li>✓ Pollinator bonuses: $100K-250K/year</li>
                    <li>✓ Premium crop sales: $25K-75K/year</li>
                    <li>✓ <strong>Total: $205K-565K/year additional income</strong></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regenerative Impact Metrics</CardTitle>
                <CardDescription>Measurable outcomes from ecosystem recovery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Carbon Sequestration</h3>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Annual CO₂ Removal Per Hectare</p>
                      <p className="text-3xl font-bold text-emerald-600">12.5</p>
                      <p className="text-xs text-muted-foreground">metric tons CO₂e/ha/year</p>
                      <p className="text-xs text-emerald-700 mt-3">
                        Equivalent to taking 2.7 cars off the road for a year
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Water Quality</h3>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Runoff Reduction</p>
                      <p className="text-3xl font-bold text-cyan-600">68%</p>
                      <p className="text-xs text-muted-foreground">compared to conventional farming</p>
                      <p className="text-xs text-cyan-700 mt-3">
                        Protects downstream water quality and aquatic ecosystems
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Soil Health</h3>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Organic Matter Increase</p>
                      <p className="text-3xl font-bold text-amber-600">+4.2%</p>
                      <p className="text-xs text-muted-foreground">per year average</p>
                      <p className="text-xs text-amber-700 mt-3">
                        Improved water-holding capacity, microbial activity, and nutrient cycling
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Biodiversity</h3>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Species Richness Recovery</p>
                      <p className="text-3xl font-bold text-blue-600">+127</p>
                      <p className="text-xs text-muted-foreground">species per hectare (5 years)</p>
                      <p className="text-xs text-blue-700 mt-3">
                        Native plants, insects, and wildlife return to managed lands
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Economic Resilience</h3>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Yield Stability</p>
                      <p className="text-3xl font-bold text-purple-600">3x</p>
                      <p className="text-xs text-muted-foreground">lower variance</p>
                      <p className="text-xs text-purple-700 mt-3">
                        Diverse crop systems weather climate shocks better
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Public Health</h3>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Pesticide Reduction</p>
                      <p className="text-3xl font-bold text-red-600">94%</p>
                      <p className="text-xs text-muted-foreground">less synthetic input</p>
                      <p className="text-xs text-red-700 mt-3">
                        Lower soil/water contamination, safer for farm workers
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default RegenerativeAgriculture;

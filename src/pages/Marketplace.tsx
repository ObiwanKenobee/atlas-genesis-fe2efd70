import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ShoppingCart, TrendingUp, Users, Zap, DollarSign, FileText } from "lucide-react";

const Marketplace = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Sample price data
  const priceHistory = [
    { date: "Jan", riu: 68.5, index: 72.3 },
    { date: "Feb", riu: 71.2, index: 75.1 },
    { date: "Mar", riu: 73.8, index: 77.6 },
    { date: "Apr", riu: 76.5, index: 80.2 },
    { date: "May", riu: 79.2, index: 83.4 },
    { date: "Jun", riu: 82.1, index: 86.7 },
  ];

  const buyers = [
    { tier: "Individual", min: "$100", max: "$10K", count: 24500, allocation: "Micro-credits, education", icon: "👤" },
    { tier: "Corporate", min: "$100K", max: "$10M", count: 450, allocation: "ESG compliance, bonds", icon: "🏢" },
    { tier: "Institutional", min: "$1M+", max: "Unlimited", count: 85, allocation: "Large portfolios, funds", icon: "🏦" },
    { tier: "Government", min: "$10M+", max: "Unlimited", count: 12, allocation: "Climate policy, NDCs", icon: "🏛️" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Marketplace & Financial Infrastructure</h1>
          <p className="text-lg text-muted-foreground">
            Regenerative Impact Units (RIUs), tiered buyer system, ESG APIs, and regeneration-backed bonds
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                RIUs in Circulation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">24.5M</p>
              <p className="text-xs text-muted-foreground">Regenerative Impact Units</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Market Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$1.84B</p>
              <p className="text-xs text-muted-foreground">Total trading value (YTD)</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">25K+</p>
              <p className="text-xs text-muted-foreground">Across all tiers</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Current Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$82.10</p>
              <p className="text-xs text-emerald-600">+19.9% YTD</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rius">RIUs</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
            <TabsTrigger value="bonds">Bonds</TabsTrigger>
            <TabsTrigger value="apis">APIs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>RIU Price & Trading Volume</CardTitle>
                <CardDescription>6-month historical data</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="riu" stroke="#10b981" strokeWidth={2} name="RIU Price ($)" />
                    <Line type="monotone" dataKey="index" stroke="#06b6d4" strokeWidth={2} name="Regen Index" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Infrastructure</CardTitle>
                <CardDescription>How RIUs are traded and settled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Trading Venues</h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-emerald-50">
                        <p className="font-semibold text-sm text-emerald-900">Primary Exchange (Regen Markets)</p>
                        <p className="text-xs text-emerald-800 mt-1">
                          24/7 trading, real-time settlement, order books for all tier buyers
                        </p>
                        <p className="text-xs text-emerald-700 mt-1">Volume: 67% of total trades</p>
                      </div>

                      <div className="p-4 border rounded-lg bg-blue-50">
                        <p className="font-semibold text-sm text-blue-900">OTC Markets</p>
                        <p className="text-xs text-blue-800 mt-1">
                          Large block trades, institutional arrangements, direct peer-to-peer sales
                        </p>
                        <p className="text-xs text-blue-700 mt-1">Volume: 28% of total trades</p>
                      </div>

                      <div className="p-4 border rounded-lg bg-purple-50">
                        <p className="font-semibold text-sm text-purple-900">Community Markets</p>
                        <p className="text-xs text-purple-800 mt-1">
                          Local exchanges, farm-to-consumer, community-level trading
                        </p>
                        <p className="text-xs text-purple-700 mt-1">Volume: 5% of total trades</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Settlement & Custody</h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <p className="font-semibold text-sm mb-1">T+0 Settlement</p>
                        <p className="text-xs text-muted-foreground">
                          Credits transferred immediately upon trade execution; blockchain-backed for permanence records
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="font-semibold text-sm mb-1">Multi-Asset Support</p>
                        <p className="text-xs text-muted-foreground">
                          RIUs traded in USD, EUR, blockchain tokens, or direct carbon retirement
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="font-semibold text-sm mb-1">Immutable Ownership</p>
                        <p className="text-xs text-muted-foreground">
                          All RIU transfers recorded on distributed ledger; no double-spending possible
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="font-semibold text-sm mb-1">Retirement Tracking</p>
                        <p className="text-xs text-muted-foreground">
                          When RIUs are retired (carbon removed from sale), marked permanently on public record
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RIUs Tab */}
          <TabsContent value="rius" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regenerative Impact Units (RIUs)</CardTitle>
                <CardDescription>Standardized asset class for regenerative carbon & ecosystem value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border-l-4 border-l-emerald-500 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-900">
                    <strong>Definition:</strong> One RIU = 1 metric ton of CO₂ equivalent removed from atmosphere + biodiversity benefits + health impacts, verified through the Valuation Engine
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">RIU Characteristics</h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <p className="font-semibold text-sm mb-1">Standardized</p>
                        <p className="text-xs text-muted-foreground">All RIUs meet minimum quality standards; cannot be issued below threshold</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="font-semibold text-sm mb-1">Fungible</p>
                        <p className="text-xs text-muted-foreground">All RIUs are interchangeable; one RIU (from Amazon) = one RIU (from Boreal Forest)</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="font-semibold text-sm mb-1">Liquid</p>
                        <p className="text-xs text-muted-foreground">Traded 24/7 on primary exchange; minimal bid-ask spreads</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="font-semibold text-sm mb-1">Permanent</p>
                        <p className="text-xs text-muted-foreground">Cannot be "un-issued"; retirement is permanent and public</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="font-semibold text-sm mb-1">Multi-Dimensional</p>
                        <p className="text-xs text-muted-foreground">Each RIU carries carbon, biodiversity, and health attributes</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">RIU Supply Dynamics</h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-emerald-50">
                        <p className="font-semibold text-sm text-emerald-900">Annual Issuance</p>
                        <p className="text-2xl font-bold text-emerald-600">450M</p>
                        <p className="text-xs text-emerald-700">RIUs issued (certified & verified)</p>
                      </div>

                      <div className="p-4 border rounded-lg bg-blue-50">
                        <p className="font-semibold text-sm text-blue-900">Annual Retirement</p>
                        <p className="text-2xl font-bold text-blue-600">320M</p>
                        <p className="text-xs text-blue-700">RIUs permanently removed from circulation</p>
                      </div>

                      <div className="p-4 border rounded-lg bg-purple-50">
                        <p className="font-semibold text-sm text-purple-900">Net Growth</p>
                        <p className="text-2xl font-bold text-purple-600">130M</p>
                        <p className="text-xs text-purple-700">Additional regeneration impact created</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buyers Tab */}
          <TabsContent value="buyers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tiered Buyer System</CardTitle>
                <CardDescription>Scale participation from individuals to nations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {buyers.map((buyer, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{buyer.icon}</span>
                            <h4 className="font-bold text-lg">{buyer.tier}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {buyer.min} - {buyer.max} per transaction
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{buyer.count.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Active participants</p>
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded">
                        <p className="text-sm font-semibold mb-1">Primary Use Case</p>
                        <p className="text-sm text-slate-700">{buyer.allocation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Individual Buyer: Micro-Credits</CardTitle>
                <CardDescription>Starting at just $100, anyone can invest in regeneration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border-l-4 border-l-emerald-500 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-800">
                    <strong>Example:</strong> Buy 1 RIU for $82 on your phone, support mangrove restoration in Indonesia, retire it to offset your carbon footprint—all within 5 minutes.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="font-semibold text-sm">Mobile App</p>
                    <p className="text-xs text-muted-foreground">iOS & Android, simple UX</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-semibold text-sm">Direct Retirement</p>
                    <p className="text-xs text-muted-foreground">Own the impact permanently</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-semibold text-sm">Community Stories</p>
                    <p className="text-xs text-muted-foreground">See impact in real-time</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-semibold text-sm">Social Features</p>
                    <p className="text-xs text-muted-foreground">Share achievements with friends</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bonds Tab */}
          <TabsContent value="bonds" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regeneration-Backed Bonds</CardTitle>
                <CardDescription>Long-term financial instruments secured by regenerative assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-l-green-500 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Regen Bond Structure</h4>
                    <p className="text-sm text-green-800">
                      Bonds backed by escrow of physical RIUs. Principal returned at maturity; interest paid quarterly. Risk-free asset backed by regenerative assets that only increase in value.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="font-semibold text-sm mb-2">5-Year Regen Bond</p>
                      <p className="text-3xl font-bold text-emerald-600">3.8%</p>
                      <p className="text-xs text-muted-foreground">Annual coupon</p>
                      <p className="text-xs text-slate-700 mt-2">$1M-$100M denominations</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <p className="font-semibold text-sm mb-2">10-Year Regen Bond</p>
                      <p className="text-3xl font-bold text-emerald-600">5.2%</p>
                      <p className="text-xs text-muted-foreground">Annual coupon</p>
                      <p className="text-xs text-slate-700 mt-2">$5M-$500M denominations</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <p className="font-semibold text-sm mb-2">Perpetual Regen Bond</p>
                      <p className="text-3xl font-bold text-emerald-600">6.5%</p>
                      <p className="text-xs text-muted-foreground">Annual coupon</p>
                      <p className="text-xs text-slate-700 mt-2">Unlimited denominations</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <p className="font-semibold text-sm mb-2">Green Impact Bond</p>
                      <p className="text-3xl font-bold text-emerald-600">4.5%</p>
                      <p className="text-xs text-muted-foreground">Annual coupon</p>
                      <p className="text-xs text-slate-700 mt-2">Proceeds fund new projects</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APIs Tab */}
          <TabsContent value="apis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ESG Integration APIs</CardTitle>
                <CardDescription>Seamless corporate accounting integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-semibold text-sm text-blue-900 mb-2">XBRL Compatibility</h4>
                    <p className="text-sm text-blue-800">
                      RIU holdings automatically export to eXtensible Business Reporting Language for SEC filings
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-purple-50">
                    <h4 className="font-semibold text-sm text-purple-900 mb-2">GRI Standards</h4>
                    <p className="text-sm text-purple-800">
                      ESG metrics pre-formatted for Global Reporting Initiative sustainability disclosures
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-emerald-50">
                    <h4 className="font-semibold text-sm text-emerald-900 mb-2">TCFD Alignment</h4>
                    <p className="text-sm text-emerald-800">
                      Climate risk data integrated with Task Force on Climate-related Financial Disclosures frameworks
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-amber-50">
                    <h4 className="font-semibold text-sm text-amber-900 mb-2">ISO 14064</h4>
                    <p className="text-sm text-amber-800">
                      Carbon accounting meets international standards for greenhouse gas quantification and reporting
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Available Endpoints</h3>
                  <div className="font-mono text-xs space-y-2 p-4 bg-slate-50 rounded-lg overflow-x-auto">
                    <p><span className="text-emerald-600">POST</span> /api/v1/riu/purchase</p>
                    <p><span className="text-blue-600">GET</span> /api/v1/portfolio/holdings</p>
                    <p><span className="text-purple-600">GET</span> /api/v1/riu/price-history</p>
                    <p><span className="text-amber-600">POST</span> /api/v1/riu/retire</p>
                    <p><span className="text-red-600">GET</span> /api/v1/esg/metrics</p>
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

export default Marketplace;

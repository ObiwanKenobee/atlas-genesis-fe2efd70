import React from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, Eye, AlertTriangle } from "lucide-react";

const Security = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Security, Transparency & Anti-Fraud</h1>
          <p className="text-lg text-muted-foreground">Tamper-proof records, sensor anomaly detection, public audits, and cross-verification systems</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Audits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-xs text-muted-foreground">Continuous monitoring</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Tamper-Proof
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-muted-foreground">Records immutable</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Anomaly Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">ML</p>
              <p className="text-xs text-muted-foreground">Real-time flagging</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Public Audits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Monthly</p>
              <p className="text-xs text-muted-foreground">Third-party verified</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cryptography" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="cryptography">Cryptography</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="anomaly">Anomaly Detection</TabsTrigger>
            <TabsTrigger value="audit">Public Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="cryptography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tamper-Proof Records (Blockchain)</CardTitle>
                <CardDescription>Cryptographic hashing ensures no modification possible</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Every RIU issuance, trade, retirement, and valuation recalculation is hashed into an immutable ledger. Change one byte, entire record is invalid.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">What Gets Recorded</h3>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 border rounded-lg bg-emerald-50">
                        <p className="font-semibold text-emerald-900">RIU Issuance</p>
                        <p className="text-xs text-emerald-800">Every credit with creation timestamp, valuation inputs, approving council</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-blue-50">
                        <p className="font-semibold text-blue-900">Trades</p>
                        <p className="text-xs text-blue-800">Buyer, seller, price, date, settlement confirmation</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-purple-50">
                        <p className="font-semibold text-purple-900">Retirements</p>
                        <p className="text-xs text-purple-800">When RIUs permanently removed, reason code, responsible party</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-pink-50">
                        <p className="font-semibold text-pink-900">Measurements</p>
                        <p className="text-xs text-pink-800">All sensor data, satellite imagery metadata, validation results</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">Cryptographic Protection</h3>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 border rounded-lg">
                        <p className="font-semibold text-sm">SHA-256 Hashing</p>
                        <p className="text-xs text-muted-foreground">
                          Each block links to previous; change invalidates entire chain
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="font-semibold text-sm">Digital Signatures</p>
                        <p className="text-xs text-muted-foreground">
                          RSA-2048 verification; only authorized parties can sign transactions
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="font-semibold text-sm">Distributed Consensus</p>
                        <p className="text-xs text-muted-foreground">
                          No single point of failure; 1000+ independent validator nodes
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="font-semibold text-sm">Time-Lock Proof</p>
                        <p className="text-xs text-muted-foreground">
                          Cryptographic proof that records existed at specific timestamps
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Source Cross-Verification</CardTitle>
                <CardDescription>Reduce errors through independent confirmation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-emerald-50">
                    <p className="font-semibold text-sm text-emerald-900 mb-2">CO₂ Measurement Verification</p>
                    <p className="text-sm text-emerald-800">
                      Satellite data (Sentinel-2) | Soil probes | IoT sensors | Ground surveys | Consensus required for issuance
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-50">
                    <p className="font-semibold text-sm text-blue-900 mb-2">Biodiversity Verification</p>
                    <p className="text-sm text-blue-800">
                      eDNA sequencing | Bioacoustic monitoring | Visual species surveys | Community reports | Supermajority agreement
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-purple-50">
                    <p className="font-semibold text-sm text-purple-900 mb-2">Financial Verification</p>
                    <p className="text-sm text-purple-800">
                      Trade execution | Settlement confirmation | Escrow audit | Blockchain record | 100% match required
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-pink-50">
                    <p className="font-semibold text-sm text-pink-900 mb-2">Consent Verification</p>
                    <p className="text-sm text-pink-800">
                      Community signatures | Legal review | Third-party witness | Blockchain record | Permanent proof
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomaly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ML-Based Anomaly Detection</CardTitle>
                <CardDescription>AI catches fraud patterns in real-time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border-l-4 border-l-orange-500 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-800">
                    Machine learning models trained on millions of legitimate measurements learn what normal looks like. Deviations flagged instantly for human review.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Detectable Fraud Patterns</h3>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 border rounded-lg">
                        <p className="font-semibold">Sudden CO2 Spikes</p>
                        <p className="text-xs text-muted-foreground">Flagged if measurement deviates beyond 15 percent from expected curve</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="font-semibold">Data Manipulation</p>
                        <p className="text-xs text-muted-foreground">Statistical inconsistencies with satellite confirmation</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="font-semibold">Double Counting</p>
                        <p className="text-xs text-muted-foreground">RIU ID uniqueness verified across all markets</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="font-semibold">Phantom Projects</p>
                        <p className="text-xs text-muted-foreground">Geospatial validation confirms location exists</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">Alert Response</h3>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 border rounded-lg bg-red-50">
                        <p className="font-semibold text-red-900">Tier 1: Yellow Alert</p>
                        <p className="text-xs text-red-800">Minor inconsistency; automatic investigation, 24-hour response</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-orange-50">
                        <p className="font-semibold text-orange-900">Tier 2: Orange Alert</p>
                        <p className="text-xs text-orange-800">Significant deviation; human review, regulatory notice</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-red-50">
                        <p className="font-semibold text-red-900">Tier 3: Red Alert</p>
                        <p className="text-xs text-red-800">Clear fraud pattern; immediate transaction halt, investigation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Public Audit Trail</CardTitle>
                <CardDescription>Complete transparency—anyone can verify any RIU</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg bg-gradient-to-r from-slate-50 to-blue-50">
                  <p className="font-semibold text-sm mb-2">Audit Frequency</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">24/7</p>
                      <p className="text-xs text-muted-foreground">Automated scanning</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">Daily</p>
                      <p className="text-xs text-muted-foreground">AI anomaly reports</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">Weekly</p>
                      <p className="text-xs text-muted-foreground">Team reviews</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-600">Monthly</p>
                      <p className="text-xs text-muted-foreground">Third-party audit</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Audit Components</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 border rounded-lg">
                      <p className="font-semibold">Financial Audit</p>
                      <p className="text-xs text-muted-foreground">All transactions verified against blockchain ledger</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-semibold">Data Audit</p>
                      <p className="text-xs text-muted-foreground">Satellite imagery, sensor readings cross-checked against claim</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-semibold">Governance Audit</p>
                      <p className="text-xs text-muted-foreground">Council voting records, consent documentation verified</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-semibold">Valuation Audit</p>
                      <p className="text-xs text-muted-foreground">Impact score calculation checked against published formula</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <p className="text-sm font-semibold mb-3">Public Access (No Login Required)</p>
                  <div className="space-y-2 text-sm">
                    <p className="p-3 border rounded-lg bg-blue-50">
                      Query any RIU by ID to see full history (issuance, trades, retirement)
                    </p>
                    <p className="p-3 border rounded-lg bg-emerald-50">
                      Download raw measurement data for any project
                    </p>
                    <p className="p-3 border rounded-lg bg-purple-50">
                      View all council voting records and decisions
                    </p>
                    <p className="p-3 border rounded-lg bg-amber-50">
                      Access published audit reports (monthly and annual)
                    </p>
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

export default Security;

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Shield, Gavel, Lightbulb, Lock } from "lucide-react";

const Governance = () => {
  const [selectedCouncil, setSelectedCouncil] = useState<string>("amazon-council");

  const councils = [
    {
      id: "amazon-council",
      name: "Amazon Basin Bioregional Council",
      members: 12,
      status: "active",
      indigenous_representation: "67%",
      recent_decisions: 8,
      sacred_lands_protected: 2400000,
    },
    {
      id: "coral-council",
      name: "Coral Triangle Governance Forum",
      members: 8,
      status: "active",
      indigenous_representation: "50%",
      recent_decisions: 5,
      sacred_lands_protected: 450000,
    },
    {
      id: "boreal-council",
      name: "Boreal Forest Ethics Committee",
      members: 10,
      status: "active",
      indigenous_representation: "60%",
      recent_decisions: 6,
      sacred_lands_protected: 1200000,
    },
  ];

  const currentCouncil = councils.find((c) => c.id === selectedCouncil) || councils[0];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Ethical, Cultural & Spiritual Governance</h1>
          <p className="text-lg text-muted-foreground">
            Community consent, sacred land protection, DAO-style councils, and intergenerational equity
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-l-4 border-l-pink-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Community Consent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">67%</p>
              <p className="text-xs text-muted-foreground">Indigenous representation</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Sacred Lands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3.7M</p>
              <p className="text-xs text-muted-foreground">km² Protected</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gavel className="h-4 w-4" />
                Intergenerational
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">100+</p>
              <p className="text-xs text-muted-foreground">Years horizon</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="councils" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="councils">Councils</TabsTrigger>
            <TabsTrigger value="consent">Consent</TabsTrigger>
            <TabsTrigger value="sacred">Sacred Lands</TabsTrigger>
            <TabsTrigger value="justice">Justice</TabsTrigger>
          </TabsList>

          {/* Councils Tab */}
          <TabsContent value="councils" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bioregional Ethics Councils</CardTitle>
                <CardDescription>Community-elected governance bodies with DAO-style decision-making</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {councils.map((council) => (
                    <div
                      key={council.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedCouncil === council.id ? "ring-2 ring-primary bg-gradient-to-r from-slate-50 to-blue-50" : "hover:shadow-lg"}`}
                      onClick={() => setSelectedCouncil(council.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{council.name}</h4>
                          <Badge variant="outline" className="mt-2">
                            {council.status === "active" ? "✓ Active" : "Forming"}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{council.members}</p>
                          <p className="text-xs text-muted-foreground">Members</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Indigenous</p>
                          <p className="font-bold text-pink-600">{council.indigenous_representation}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Recent Decisions</p>
                          <p className="font-bold">{council.recent_decisions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Protected (km²)</p>
                          <p className="font-bold">{(council.sacred_lands_protected / 1000000).toFixed(1)}M</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Council Details */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle>{currentCouncil.name}</CardTitle>
                <CardDescription>Governance structure and decision-making process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Council Composition */}
                  <div>
                    <h3 className="font-semibold mb-4">Council Composition</h3>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">Indigenous Representatives</span>
                          <span className="font-bold text-pink-600">{currentCouncil.indigenous_representation}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-pink-500 h-2 rounded-full" style={{ width: currentCouncil.indigenous_representation }} />
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">Youth Delegates</span>
                          <span className="font-bold text-blue-600">25%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Under 35 years old, intergenerational perspective</p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">Scientific Advisors</span>
                          <span className="font-bold text-emerald-600">10%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Independent experts, non-voting advisory capacity</p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">Non-Voting Observers</span>
                          <span className="font-bold">Public</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Transparency: all meetings open to attendance</p>
                      </div>
                    </div>
                  </div>

                  {/* Decision Process */}
                  <div>
                    <h3 className="font-semibold mb-4">Decision-Making Process</h3>
                    <div className="space-y-3">
                      <div className="p-3 border-l-4 border-l-emerald-500 bg-emerald-50 rounded">
                        <p className="text-sm font-semibold text-emerald-900 mb-1">Phase 1: Community Consultation</p>
                        <p className="text-xs text-emerald-800">30-90 days of public comment, town halls, and feedback collection</p>
                      </div>

                      <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50 rounded">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Phase 2: Council Deliberation</p>
                        <p className="text-xs text-blue-800">2-3 council meetings with scientific review and evidence presentation</p>
                      </div>

                      <div className="p-3 border-l-4 border-l-purple-500 bg-purple-50 rounded">
                        <p className="text-sm font-semibold text-purple-900 mb-1">Phase 3: Consensus Vote</p>
                        <p className="text-xs text-purple-800">Supermajority (75%) required for approval; recorded publicly</p>
                      </div>

                      <div className="p-3 border-l-4 border-l-amber-500 bg-amber-50 rounded">
                        <p className="text-sm font-semibold text-amber-900 mb-1">Phase 4: Implementation & Audit</p>
                        <p className="text-xs text-amber-800">Decisions posted on blockchain; annual independent review</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Decisions */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Recent Decisions ({currentCouncil.recent_decisions} total)</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <div className="p-3 border rounded-lg text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold">Approval: Mangrove Restoration Project XYZ</span>
                        <Badge>✓ 88%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Voted: 2024-01-10 | Impact: High | Reversibility: Medium</p>
                    </div>

                    <div className="p-3 border rounded-lg text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold">Rejection: Industrial Agriculture Conversion</span>
                        <Badge variant="destructive">✗ 12%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Voted: 2024-01-05 | Reason: Indigenous consent missing</p>
                    </div>

                    <div className="p-3 border rounded-lg text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold">Conditional Approval: Carbon Offset Program ABC</span>
                        <Badge>⚠ 75%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Voted: 2023-12-28 | Conditions: Community benefit-sharing agreement required</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consent Tab */}
          <TabsContent value="consent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Consent Validation</CardTitle>
                <CardDescription>Preventing harm through verified agreement and digital identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Consent Framework</h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-emerald-50">
                        <h4 className="font-semibold text-sm text-emerald-900 mb-2">Free, Prior & Informed Consent (FPIC)</h4>
                        <ul className="text-xs text-emerald-800 space-y-1">
                          <li>✓ Communities informed BEFORE decisions</li>
                          <li>✓ Time for deliberation (min. 30 days)</li>
                          <li>✓ No coercion or financial pressure</li>
                          <li>✓ Right to say "no" without penalty</li>
                        </ul>
                      </div>

                      <div className="p-4 border rounded-lg bg-blue-50">
                        <h4 className="font-semibold text-sm text-blue-900 mb-2">Digital Identity & Consent Registry</h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>✓ Decentralized ID for community leaders</li>
                          <li>✓ Immutable consent records (blockchain)</li>
                          <li>✓ Revocation mechanisms</li>
                          <li>✓ Dispute resolution pathway</li>
                        </ul>
                      </div>

                      <div className="p-4 border rounded-lg bg-purple-50">
                        <h4 className="font-semibold text-sm text-purple-900 mb-2">Benefit Sharing</h4>
                        <ul className="text-xs text-purple-800 space-y-1">
                          <li>✓ Minimum 15% of revenues to communities</li>
                          <li>✓ Community approval of distribution mechanism</li>
                          <li>✓ Transparent accounting</li>
                          <li>✓ Multi-year commitments</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Consent Process Map</h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl font-bold text-emerald-600 w-8">1</div>
                          <div>
                            <p className="font-semibold text-sm">Project Scoping (Week 1-2)</p>
                            <p className="text-xs text-muted-foreground">Developers meet with traditional authorities</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl font-bold text-blue-600 w-8">2</div>
                          <div>
                            <p className="font-semibold text-sm">Public Disclosure (Week 3-8)</p>
                            <p className="text-xs text-muted-foreground">Community meetings, Q&A, impact assessment review</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl font-bold text-purple-600 w-8">3</div>
                          <div>
                            <p className="font-semibold text-sm">Consent Vote (Week 9-10)</p>
                            <p className="text-xs text-muted-foreground">Secret ballot, supermajority (75%) required</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl font-bold text-green-600 w-8">4</div>
                          <div>
                            <p className="font-semibold text-sm">Agreement Signing (Week 11+)</p>
                            <p className="text-xs text-muted-foreground">Legal contracts recorded on blockchain</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sacred Lands Tab */}
          <TabsContent value="sacred" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sacred Land Protection</CardTitle>
                <CardDescription>Geospatial governance and cultural integrity preservation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Protection Mechanisms</h3>
                    <div className="space-y-3">
                      <div className="p-4 border-l-4 border-l-pink-500 bg-pink-50 rounded-lg">
                        <h4 className="font-semibold text-sm text-pink-900 mb-2">Geo-Fencing</h4>
                        <p className="text-xs text-pink-800">Cryptographically verified spatial boundaries for sacred sites. Real-time monitoring for violations.</p>
                      </div>

                      <div className="p-4 border-l-4 border-l-amber-500 bg-amber-50 rounded-lg">
                        <h4 className="font-semibold text-sm text-amber-900 mb-2">Off-Limits to Commercialization</h4>
                        <p className="text-xs text-amber-800">Smart contracts prevent any profit-generating activity on sacred lands, regardless of pressure.</p>
                      </div>

                      <div className="p-4 border-l-4 border-l-purple-500 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-sm text-purple-900 mb-2">Perpetual Community Stewardship</h4>
                        <p className="text-xs text-purple-800">Lands remain under community control across generations, protected by trust instruments.</p>
                      </div>

                      <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-sm text-blue-900 mb-2">Cultural Integrity Covenant</h4>
                        <p className="text-xs text-blue-800">Immutable public record of restrictions, accessible to all stakeholders for accountability.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Protected Sites (Current)</h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm">Mount Kilimanjaro Sacred Zone</span>
                          <Badge>Tanzania</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Area: 450 km² | Status: Protected | Community: Chagga people</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm">Amazon Spirit Forests</span>
                          <Badge>Peru/Brazil</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Area: 2.2M km² | Status: Protected | Communities: 180+ groups</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm">Coral Triangle Sacred Waters</span>
                          <Badge>Indonesia/Philippines</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Area: 1.1M km² | Status: Protected | Communities: Polynesian peoples</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm">Boreal Mother Forests</span>
                          <Badge>Scandinavia/Russia</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Area: 890K km² | Status: Protected | Communities: Sámi, First Nations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Justice Tab */}
          <TabsContent value="justice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Intergenerational Justice & Equity</CardTitle>
                <CardDescription>Long-term thinking embedded in governance structures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">100+ Year Governance Horizon</h3>
                  <div className="p-4 border-l-4 border-l-green-600 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 mb-3">
                      <strong>Why 100 years?</strong> Because carbon remains in the atmosphere for 300+ years. Today's decisions impact 4+ future generations.
                    </p>
                    <div className="space-y-2 text-xs text-green-700">
                      <p>✓ All agreements include perpetual stewardship clauses</p>
                      <p>✓ Trust instruments survive beyond any individual's lifetime</p>
                      <p>✓ Youth delegates (under 35) have permanent council seats</p>
                      <p>✓ Community veto rights protected against corporate pressure</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Justice Principles</h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 border rounded-lg bg-blue-50">
                          <p className="font-semibold text-blue-900">Procedural Justice</p>
                          <p className="text-blue-700">Communities involved in decisions affecting them</p>
                        </div>

                        <div className="p-3 border rounded-lg bg-purple-50">
                          <p className="font-semibold text-purple-900">Distributive Justice</p>
                          <p className="text-purple-700">Benefits shared equitably; harms not concentrated</p>
                        </div>

                        <div className="p-3 border rounded-lg bg-pink-50">
                          <p className="font-semibold text-pink-900">Recognition Justice</p>
                          <p className="text-pink-700">Cultural & indigenous knowledge valued equally</p>
                        </div>

                        <div className="p-3 border rounded-lg bg-amber-50">
                          <p className="font-semibold text-amber-900">Restorative Justice</p>
                          <p className="text-amber-700">Harm repaired through community-based processes</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-3">Equity Safeguards</h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 border rounded-lg">
                          <p className="font-semibold">Language Access</p>
                          <p className="text-muted-foreground">All documents translated into local languages</p>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <p className="font-semibold">Literacy Accommodation</p>
                          <p className="text-muted-foreground">Oral presentations & visual aids for agreements</p>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <p className="font-semibold">Cost Elimination</p>
                          <p className="text-muted-foreground">No community payment required for participation</p>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <p className="font-semibold">Legal Support</p>
                          <p className="text-muted-foreground">Independent lawyers provided at project expense</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Non-Issuable Projects */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Projects That Cannot Be Issued</h3>
                  <div className="space-y-2">
                    <div className="p-3 border-l-4 border-l-red-500 bg-red-50 rounded">
                      <p className="font-semibold text-sm text-red-900">Sacred Lands Without Community Consent</p>
                      <p className="text-xs text-red-800">Non-negotiable. No exceptions. No amount of profit justifies violation of sacred trust.</p>
                    </div>

                    <div className="p-3 border-l-4 border-l-red-500 bg-red-50 rounded">
                      <p className="font-semibold text-sm text-red-900">Forced Displacement Projects</p>
                      <p className="text-xs text-red-800">Carbon credits cannot be built on dispossession or removal of indigenous peoples.</p>
                    </div>

                    <div className="p-3 border-l-4 border-l-red-500 bg-red-50 rounded">
                      <p className="font-semibold text-sm text-red-900">Projects with Benefit-Capture</p>
                      <p className="text-xs text-red-800">If communities will not receive equitable share of value created, project is rejected.</p>
                    </div>

                    <div className="p-3 border-l-4 border-l-red-500 bg-red-50 rounded">
                      <p className="font-semibold text-sm text-red-900">Monoculture Conversions</p>
                      <p className="text-xs text-red-800">Converting diverse ecosystems to single crop, even if carbon-positive, rejected on biodiversity grounds.</p>
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

export default Governance;

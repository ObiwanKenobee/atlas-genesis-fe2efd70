import { PageLayout } from '../components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Leaf, Zap, Building, Store, Wheat, FileCheck, TrendingUp, Award, GraduationCap, HelpCircle } from 'lucide-react';

// Carbon Offsetting Page
export function CarbonOffsetting() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Leaf className="w-8 h-8 text-emerald-500" />
            <h1 className="text-4xl font-bold">Carbon Offsetting</h1>
          </div>
          <p className="text-xl text-muted-foreground">Neutralize your carbon footprint with verified regenerative credits</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual Offsetting</CardTitle>
              <CardDescription>Personal carbon neutrality solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Calculate your carbon footprint</li>
                <li>• Purchase verified offset credits</li>
                <li>• Track impact over time</li>
                <li>• Get carbon neutral certification</li>
              </ul>
              <Button className="w-full mt-4">Start Offsetting</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Offsetting</CardTitle>
              <CardDescription>Enterprise carbon neutrality programs</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Scope 1, 2, 3 emissions coverage</li>
                <li>• Bulk credit purchasing</li>
                <li>• ESG reporting integration</li>
                <li>• Custom offset strategies</li>
              </ul>
              <Button className="w-full mt-4">Enterprise Solutions</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

// Impact Investment Page
export function ImpactInvestment() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold">Impact Investment</h1>
          </div>
          <p className="text-xl text-muted-foreground">Generate returns while creating positive environmental impact</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Regenerative Bonds</CardTitle>
              <Badge className="w-fit">3.8% - 6.5% APY</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Fixed-income investments backed by verified regenerative projects</p>
              <Button className="w-full">Explore Bonds</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carbon Credit Futures</CardTitle>
              <Badge className="w-fit">Variable Returns</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Trade future carbon credit deliveries with price appreciation potential</p>
              <Button className="w-full">View Futures</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Equity</CardTitle>
              <Badge className="w-fit">High Growth</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Direct equity investments in regenerative agriculture and ecosystem projects</p>
              <Button className="w-full">Invest Now</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

// Regulatory Compliance Page
export function RegulatoryCompliance() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <FileCheck className="w-8 h-8 text-green-500" />
            <h1 className="text-4xl font-bold">Regulatory Compliance</h1>
          </div>
          <p className="text-xl text-muted-foreground">Meet sustainability requirements with verified carbon credits</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>EU ETS Compliance</CardTitle>
              <CardDescription>European Union Emissions Trading System</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• EU Allowances (EUAs)</li>
                <li>• Verified Carbon Units (VCUs)</li>
                <li>• Automated compliance reporting</li>
                <li>• Registry integration</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>California Cap-and-Trade</CardTitle>
              <CardDescription>CARB compliance solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• California Carbon Allowances (CCAs)</li>
                <li>• CARB offset protocols</li>
                <li>• Quarterly auction participation</li>
                <li>• True-up period management</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

// Enterprise Solutions Page
export function EnterpriseSolutions() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Building className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Enterprise Solutions</h1>
          </div>
          <p className="text-xl text-muted-foreground">Large-scale carbon programs for Fortune 500 companies</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Corporate Carbon Strategy</CardTitle>
              <CardDescription>End-to-end sustainability program management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Assessment</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Carbon footprint analysis</li>
                    <li>• Scope 1, 2, 3 mapping</li>
                    <li>• Reduction opportunities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Strategy</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Net-zero roadmaps</li>
                    <li>• Science-based targets</li>
                    <li>• Offset portfolio design</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Execution</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Credit procurement</li>
                    <li>• ESG reporting</li>
                    <li>• Stakeholder communication</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

// SMB Solutions Page
export function SMBSolutions() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Store className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold">SMB Solutions</h1>
          </div>
          <p className="text-xl text-muted-foreground">Accessible sustainability solutions for small and medium businesses</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Package</CardTitle>
              <CardDescription>Get carbon neutral in 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Automated footprint calculation</li>
                <li>• Pre-selected offset portfolio</li>
                <li>• Digital certificates</li>
                <li>• Marketing materials</li>
              </ul>
              <Button className="w-full mt-4">Start for $99/month</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Program</CardTitle>
              <CardDescription>Tailored sustainability strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Detailed carbon assessment</li>
                <li>• Custom offset selection</li>
                <li>• Quarterly reporting</li>
                <li>• Dedicated support</li>
              </ul>
              <Button className="w-full mt-4">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

// Agriculture Solutions Page
export function AgricultureSolutions() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Wheat className="w-8 h-8 text-amber-600" />
            <h1 className="text-4xl font-bold">Agriculture Solutions</h1>
          </div>
          <p className="text-xl text-muted-foreground">Regenerative farming credits and sustainable agriculture programs</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Farmer Income Projections</CardTitle>
              <CardDescription>Additional revenue from regenerative practices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">$205K</div>
                  <div className="text-sm text-muted-foreground">Small Farm (100 acres)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">$385K</div>
                  <div className="text-sm text-muted-foreground">Medium Farm (500 acres)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">$565K</div>
                  <div className="text-sm text-muted-foreground">Large Farm (1000+ acres)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Soil Carbon Credits</CardTitle>
                <CardDescription>Monetize soil health improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Cover crop implementation</li>
                  <li>• No-till farming practices</li>
                  <li>• Rotational grazing</li>
                  <li>• Soil carbon measurement</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Biodiversity Credits</CardTitle>
                <CardDescription>Reward ecosystem restoration</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Pollinator habitat creation</li>
                  <li>• Wetland restoration</li>
                  <li>• Native species reintroduction</li>
                  <li>• Biodiversity monitoring</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// Renewable Energy Page
export function RenewableEnergy() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold">Renewable Energy</h1>
          </div>
          <p className="text-xl text-muted-foreground">Clean energy transition projects and carbon credits</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Solar Projects</CardTitle>
              <CardDescription>Photovoltaic installations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Utility-scale solar farms</li>
                <li>• Distributed rooftop systems</li>
                <li>• Community solar gardens</li>
                <li>• Energy storage integration</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wind Energy</CardTitle>
              <CardDescription>Onshore and offshore wind</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Large-scale wind farms</li>
                <li>• Small wind systems</li>
                <li>• Offshore installations</li>
                <li>• Grid integration services</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Other Technologies</CardTitle>
              <CardDescription>Emerging clean energy</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Hydroelectric projects</li>
                <li>• Geothermal systems</li>
                <li>• Biomass energy</li>
                <li>• Green hydrogen</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

// Education Hub Page
export function EducationHub() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <GraduationCap className="w-8 h-8 text-indigo-500" />
            <h1 className="text-4xl font-bold">Education Hub</h1>
          </div>
          <p className="text-xl text-muted-foreground">Learn about carbon markets and regenerative impact</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Market Fundamentals</CardTitle>
              <CardDescription>Free online course</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Carbon credit basics</li>
                <li>• Verification standards</li>
                <li>• Market dynamics</li>
                <li>• Investment strategies</li>
              </ul>
              <Button className="w-full mt-4">Start Learning</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Youth Engagement</CardTitle>
              <CardDescription>850K+ students reached</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• School partnership programs</li>
                <li>• Interactive simulations</li>
                <li>• Student competitions</li>
                <li>• Career pathways</li>
              </ul>
              <Button className="w-full mt-4">Join Program</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

// Certifications Page
export function Certifications() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Award className="w-8 h-8 text-gold" />
            <h1 className="text-4xl font-bold">Certifications</h1>
          </div>
          <p className="text-xl text-muted-foreground">Standards and methodologies for carbon credit verification</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification Standards</CardTitle>
              <CardDescription>Recognized global standards</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Verified Carbon Standard (VCS)</li>
                <li>• Gold Standard</li>
                <li>• Climate Action Reserve (CAR)</li>
                <li>• American Carbon Registry (ACR)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Methodologies</CardTitle>
              <CardDescription>Project-specific approaches</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Forestry and land use</li>
                <li>• Renewable energy</li>
                <li>• Agriculture and livestock</li>
                <li>• Industrial processes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

// Help Center Page
export function HelpCenter() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <HelpCircle className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold">Help Center</h1>
          </div>
          <p className="text-xl text-muted-foreground">FAQs and troubleshooting guides</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">How do carbon credits work?</h4>
                  <p className="text-sm text-muted-foreground">Carbon credits represent verified reductions in greenhouse gas emissions. Each credit equals one metric ton of CO2 equivalent removed from the atmosphere.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What makes Atlas Sanctum different?</h4>
                  <p className="text-sm text-muted-foreground">We focus on regenerative impact units (RIUs) that go beyond carbon to include biodiversity, soil health, and community benefits.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How are credits verified?</h4>
                  <p className="text-sm text-muted-foreground">Our multi-stage verification process combines satellite data, sensor measurements, and human verification for 95% confidence intervals.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
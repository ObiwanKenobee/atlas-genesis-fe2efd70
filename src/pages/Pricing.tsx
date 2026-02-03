import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Users,
  Leaf,
  BarChart3,
  Building2,
  Sparkles,
  CreditCard,
  Star,
  Users as UsersIcon,
  Briefcase,
  GraduationCap,
  TreePine,
  Factory,
  TrendingUp,
  Network,
  Heart,
  Database,
  DollarSign,
  FileText,
  BookOpen,
  Lock,
  Award,
  Layout,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BUSINESS_MODEL_SEGMENTS = [
  {
    id: "infrastructure",
    name: "Infrastructure-as-a-Utility",
    primaryCustomers: "Governments, multilaterals, regional blocs",
    whatIsBeingPriced: "Regenerative data infrastructure, national dashboards, outcome verification",
    pricingMechanism: "Long-term service contracts (3–10 yrs)",
    priceRange: "$500K – $10M+ per year",
    valueJustification: "Critical public infrastructure for trust, compliance, and planning",
    icon: Database,
    color: "text-blue-500",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "multi-sided-market",
    name: "Multi-Sided Market (RVE)",
    primaryCustomers: "Corporates, cities, funds",
    whatIsBeingPriced: "Verified regenerative assets (carbon, nature, health)",
    pricingMechanism: "Transaction fees",
    priceRange: "1–3% per settled transaction",
    valueJustification: "Reduces greenwashing risk and compliance costs",
    icon: Briefcase,
    color: "text-green-500",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "outcome-based",
    name: "Outcome-Based Financing",
    primaryCustomers: "Donors, DFIs, governments, insurers",
    whatIsBeingPriced: "Verified real-world outcomes",
    pricingMechanism: "Pay-for-success / results-based payments",
    priceRange: "Outcome-dependent (often $/ton, $/hectare, $/life)",
    valueJustification: "Capital only pays when reality improves",
    icon: DollarSign,
    color: "text-purple-500",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    id: "enterprise-intelligence",
    name: "Enterprise Intelligence Platform",
    primaryCustomers: "Multinationals, supply-chain operators",
    whatIsBeingPriced: "Analytics, forecasting, compliance intelligence",
    pricingMechanism: "Annual subscriptions",
    priceRange: "$100K – $1M+ per year",
    valueJustification: "Replaces consultants, audits, and fragmented ESG tools",
    icon: BarChart3,
    color: "text-orange-500",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    id: "risk-reduction",
    name: "Risk-Reduction-as-a-Service",
    primaryCustomers: "Insurers, reinsurers, treasuries",
    whatIsBeingPriced: "Quantified risk reduction from regeneration",
    pricingMechanism: "Premium-sharing or service fees",
    priceRange: "% of avoided loss or fixed contracts",
    valueJustification: "Prevention cheaper than disaster recovery",
    icon: Shield,
    color: "text-red-500",
    gradient: "from-red-500 to-rose-600",
  },
  {
    id: "capital-markets",
    name: "Capital Markets & DeFi Layer",
    primaryCustomers: "Funds, crypto institutions, exchanges",
    whatIsBeingPriced: "Tokenized assets, oracle data, smart contracts",
    pricingMechanism: "Protocol, custody & usage fees",
    priceRange: "Low per unit, high volume",
    valueJustification: "Enables new financial instruments safely",
    icon: Network,
    color: "text-indigo-500",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    id: "commons-stewardship",
    name: "Commons Stewardship (DAO)",
    primaryCustomers: "Members, stewards, partners",
    whatIsBeingPriced: "Governance rights, voting, stewardship roles",
    pricingMechanism: "Mostly non-monetary; stake-based",
    priceRange: "Minimal / symbolic",
    valueJustification: "Prevents capture and mission drift",
    icon: UsersIcon,
    color: "text-teal-500",
    gradient: "from-teal-500 to-cyan-600",
  },
  {
    id: "intellectual-infrastructure",
    name: "Intellectual Infrastructure",
    primaryCustomers: "Developers, researchers, institutions",
    whatIsBeingPriced: "Standards, schemas, ethical AI protocols",
    pricingMechanism: "Open core + paid services",
    priceRange: "Free core; paid hosting & guarantees",
    valueJustification: "Standards drive adoption and longevity",
    icon: FileText,
    color: "text-pink-500",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: "cultural-institution",
    name: "Cultural Institution Layer",
    primaryCustomers: "Foundations, sponsors, educators",
    whatIsBeingPriced: "Knowledge archives, storytelling, education",
    pricingMechanism: "Grants, sponsorships, endowments",
    priceRange: "Grant-dependent",
    valueJustification: "Builds legitimacy and narrative trust",
    icon: BookOpen,
    color: "text-yellow-500",
    gradient: "from-yellow-500 to-amber-600",
  },
];

const CUSTOMER_SEGMENTS = [
  {
    id: "producers",
    name: "Regenerative Producers",
    description: "Farmers, fishers, land & ocean stewards",
    whatTheyGet: "Mobile access, onboarding, AI-assisted regeneration guidance, impact verification, access to buyers & finance",
    pricingModel: "Free / Subsidized",
    priceRange: "$0",
    whenWeGetPaid: "Never at entry; platform earns only when credits are sold to buyers",
    icon: TreePine,
    color: "text-green-500",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "communities",
    name: "Local Communities & Youth Nodes",
    description: "Schools, labs, cooperatives",
    whatTheyGet: "Education access, impact storytelling tools, ethical AI library, participation in DAO",
    pricingModel: "Free / Grant-backed",
    priceRange: "$0",
    whenWeGetPaid: "Indirectly via sponsors, institutions, and buyers",
    icon: GraduationCap,
    color: "text-blue-500",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "buyers",
    name: "Impact Buyers",
    description: "Corporates, cities, institutions",
    whatTheyGet: "Verified carbon, nature, health & restoration credits; audit-ready reporting; reputational protection",
    pricingModel: "Transaction Fee",
    priceRange: "1–3% per verified transaction",
    whenWeGetPaid: "Upon successful verification and settlement of regenerative assets",
    icon: Briefcase,
    color: "text-purple-500",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    id: "enterprises",
    name: "Enterprises & Multinationals",
    description: "Large organizations with complex needs",
    whatTheyGet: "Supply-chain regeneration dashboards, ESG & compliance reporting, forecasting & scenario modeling",
    pricingModel: "Annual Subscription",
    priceRange: "$100K – $1M+ / year",
    whenWeGetPaid: "Recurring, tied to active usage and reporting cycles",
    icon: Building2,
    color: "text-orange-500",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    id: "governments",
    name: "Governments & Public Institutions",
    description: "National / regional authorities",
    whatTheyGet: "National / regional regenerative dashboards, outcome-based funding verification, policy simulation",
    pricingModel: "Multi-Year Contract",
    priceRange: "$250K – $5M+ per contract",
    whenWeGetPaid: "Contract milestones and verified outcomes",
    icon: Building2,
    color: "text-red-500",
    gradient: "from-red-500 to-rose-600",
  },
  {
    id: "investors",
    name: "Impact Investors & Funds",
    description: "Financial institutions and fund managers",
    whatTheyGet: "Deal flow, risk-scored regenerative projects, performance-linked instruments",
    pricingModel: "Origination + Performance Fees",
    priceRange: "1–2% origination + success-based upside",
    whenWeGetPaid: "On deal close and verified impact performance",
    icon: TrendingUp,
    color: "text-teal-500",
    gradient: "from-teal-500 to-cyan-600",
  },
  {
    id: "defi",
    name: "DeFi & Capital Market Participants",
    description: "Tokenized asset and smart contract users",
    whatTheyGet: "Tokenized regenerative assets, oracle data, smart contract execution",
    pricingModel: "Protocol & Usage Fees",
    priceRange: "Low per-transaction; high volume",
    whenWeGetPaid: "Per transaction / oracle call",
    icon: Network,
    color: "text-indigo-500",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    id: "ngos",
    name: "NGOs & Research Partners",
    description: "Nonprofits and academic institutions",
    whatTheyGet: "Data access, co-branded pilots, ethical AI tools",
    pricingModel: "Strategic / Sponsored",
    priceRange: "Often $0 or cost-recovery",
    whenWeGetPaid: "Paid via sponsors, grants, or institutional partners",
    icon: Heart,
    color: "text-pink-500",
    gradient: "from-pink-500 to-rose-600",
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Verified Projects",
    description: "All regenerative assets are third-party verified and certified",
  },
  {
    icon: Globe,
    title: "Global Impact",
    description: "Support projects across 50+ countries worldwide",
  },
  {
    icon: BarChart3,
    title: "Real-time Tracking",
    description: "Monitor your environmental impact in real-time",
  },
  {
    icon: UsersIcon,
    title: "Community Driven",
    description: "Join thousands of sustainability-focused organizations",
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto'>('fiat');

  const handleSelectSegment = (segmentId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // Navigate to relevant section based on segment
    if (segmentId === "infrastructure" || segmentId === "governments") {
      navigate("/outreach");
    } else if (segmentId === "multi-sided-market" || segmentId === "enterprise-intelligence" || segmentId === "buyers" || segmentId === "enterprises") {
      navigate("/marketplace");
    } else if (segmentId === "outcome-based" || segmentId === "risk-reduction" || segmentId === "investors") {
      navigate("/regenerative-finance");
    } else if (segmentId === "capital-markets" || segmentId === "defi") {
      navigate("/defi");
    } else if (segmentId === "commons-stewardship" || segmentId === "intellectual-infrastructure" || segmentId === "producers" || segmentId === "communities" || segmentId === "ngos") {
      navigate("/community");
    } else if (segmentId === "cultural-institution") {
      navigate("/education");
    } else {
      navigate("/marketplace");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-ocean/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Comprehensive Pricing Models
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Invest in Earth's{" "}
              <span className="text-gradient">Regeneration</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10">
              Choose the pricing model that fits your business needs or customer segment. Our inclusive approach ensures
              everyone can participate in creating a regenerative future.
            </p>

            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Globe className="w-3 h-3 mr-1" />
              Free for producers and communities
            </Badge>
          </motion.div>

          {/* Pricing Tabs */}
          <Tabs defaultValue="business-models" className="max-w-7xl mx-auto mt-16">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="business-models" className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Business Models
              </TabsTrigger>
              <TabsTrigger value="customer-segments" className="flex items-center gap-2">
                <UsersRound className="w-4 h-4" />
                Customer Segments
              </TabsTrigger>
            </TabsList>

            {/* Business Models Tab */}
            <TabsContent value="business-models">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
                {BUSINESS_MODEL_SEGMENTS.map((segment, index) => (
                  <motion.div
                    key={segment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card
                      className={`relative h-full bg-card/50 border-border/50 hover:border-primary/30 transition-colors group`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${segment.color.replace('text-', 'bg-')}/10`}
                          >
                            <segment.icon className={`w-5 h-5 ${segment.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground">
                              {segment.name}
                            </h3>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          <span className="font-medium">Primary Customers:</span>
                          <br />
                          {segment.primaryCustomers}
                        </p>
                        <div className="mt-4">
                          <span className={`text-2xl font-bold ${segment.color}`}>
                            {segment.priceRange}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {segment.pricingMechanism}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">What's Priced:</span>
                            <br />
                            {segment.whatIsBeingPriced}
                          </p>
                        </div>
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Value Justification:</span>
                            <br />
                            {segment.valueJustification}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleSelectSegment(segment.id)}
                          className={`w-full ${
                            segment.priceRange.includes("Free") || segment.priceRange.includes("Minimal")
                              ? "bg-primary hover:bg-primary/90"
                              : "bg-muted hover:bg-muted/80 text-foreground"
                          }`}
                        >
                          Learn More
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Customer Segments Tab */}
            <TabsContent value="customer-segments">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
                {CUSTOMER_SEGMENTS.map((segment, index) => (
                  <motion.div
                    key={segment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card
                      className={`relative h-full bg-card/50 border-border/50 hover:border-primary/30 transition-colors group`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${segment.color.replace('text-', 'bg-')}/10`}
                          >
                            <segment.icon className={`w-5 h-5 ${segment.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground">
                              {segment.name}
                            </h3>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          <span className="font-medium">Description:</span>
                          <br />
                          {segment.description}
                        </p>
                        <div className="mt-4">
                          <span className={`text-2xl font-bold ${segment.color}`}>
                            {segment.priceRange}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {segment.pricingModel}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">What They Get:</span>
                            <br />
                            {segment.whatTheyGet}
                          </p>
                        </div>
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">When We Get Paid:</span>
                            <br />
                            {segment.whenWeGetPaid}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleSelectSegment(segment.id)}
                          className={`w-full ${
                            segment.priceRange === "$0" || segment.priceRange.includes("Free")
                              ? "bg-primary hover:bg-primary/90"
                              : "bg-muted hover:bg-muted/80 text-foreground"
                          }`}
                        >
                          Learn More
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-16 bg-muted/20 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Secure Payment Options
            </h2>
            <p className="text-muted-foreground">
              We accept multiple payment methods for your convenience
            </p>
          </div>
          
          {/* Payment Method Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <Button
              variant={paymentMethod === 'fiat' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('fiat')}
              className="flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Fiat Payments
            </Button>
            <Button
              variant={paymentMethod === 'crypto' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('crypto')}
              className="flex items-center gap-2"
            >
              <Network className="w-4 h-4" />
              Crypto Payments
            </Button>
          </div>

          {/* Payment Methods Grid */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            {paymentMethod === 'fiat' ? (
              <>
                <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-[#003087] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">PP</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">PayPal</p>
                    <p className="text-xs text-muted-foreground">Fast & secure</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-[#00C3F7] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">PS</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Paystack</p>
                    <p className="text-xs text-muted-foreground">African payments</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border/50">
                  <CreditCard className="w-10 h-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Credit Card</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-[#627eea] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Ξ</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Ethereum</p>
                    <p className="text-xs text-muted-foreground">ETH & ERC20 tokens</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-[#f7931a] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">₿</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Bitcoin</p>
                    <p className="text-xs text-muted-foreground">BTC payments</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-[#0052ff] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CB</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Coinbase</p>
                    <p className="text-xs text-muted-foreground">Crypto gateway</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border/50">
                  <Network className="w-10 h-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">MetaMask</p>
                    <p className="text-xs text-muted-foreground">Web3 wallet</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All plans include essential features to help you make a positive impact
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-foreground mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of organizations investing in our planet's future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/marketplace">
                Explore Projects
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/outreach">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

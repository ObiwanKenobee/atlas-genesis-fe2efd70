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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for individuals starting their carbon journey",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Up to 10 carbon credit purchases/month",
      "Basic portfolio tracking",
      "Email transaction receipts",
      "Standard verification",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
    icon: Leaf,
  },
  {
    id: "professional",
    name: "Professional",
    description: "For businesses committed to sustainability",
    monthlyPrice: 49,
    yearlyPrice: 470,
    features: [
      "Unlimited carbon credit purchases",
      "Advanced portfolio analytics",
      "Priority email & chat support",
      "Enhanced verification & certificates",
      "API access (1,000 calls/month)",
      "Team member access (up to 5)",
      "Custom impact reports",
    ],
    cta: "Start Professional",
    popular: true,
    icon: Zap,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: [
      "Everything in Professional",
      "Unlimited API access",
      "Dedicated account manager",
      "Custom integrations",
      "White-label options",
      "Unlimited team members",
      "Advanced compliance reporting",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
    icon: Building2,
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Verified Projects",
    description: "All carbon credits are third-party verified and certified",
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
    icon: Users,
    title: "Community Driven",
    description: "Join thousands of sustainability-focused organizations",
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // Navigate to marketplace for now - in production this would go to checkout
    navigate("/marketplace");
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
              Transparent Pricing
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Invest in Earth's{" "}
              <span className="text-gradient">Regeneration</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10">
              Choose the plan that fits your sustainability goals. All plans include
              access to verified carbon credits and real-time impact tracking.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span
                className={`text-sm font-medium ${
                  !isYearly ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Monthly
              </span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <span
                className={`text-sm font-medium ${
                  isYearly ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Yearly
              </span>
              {isYearly && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Save 20%
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {PLANS.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card
                  className={`relative h-full ${
                    plan.popular
                      ? "border-primary/50 bg-card shadow-lg shadow-primary/10"
                      : "bg-card/50 border-border/50"
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          plan.popular
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <plan.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {plan.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">
                        ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      {plan.monthlyPrice > 0 && (
                        <span className="text-muted-foreground ml-2">
                          /{isYearly ? "year" : "month"}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full ${
                        plan.popular
                          ? "bg-primary hover:bg-primary/90"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
          <div className="flex flex-wrap items-center justify-center gap-8">
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

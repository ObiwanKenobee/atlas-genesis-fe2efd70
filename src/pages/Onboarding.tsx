import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf, ArrowRight, ArrowLeft, Check, User, Building2,
  Target, Globe, TreePine, Zap, Waves, CircleDot, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OnboardingData {
  organization: string;
  investmentGoal: string;
  interests: string[];
  monthlyBudget: string;
}

const INVESTMENT_GOALS = [
  { id: "offset", label: "Carbon Offsetting", icon: TreePine, description: "Neutralize your carbon footprint" },
  { id: "impact", label: "Impact Investment", icon: Target, description: "Generate returns while doing good" },
  { id: "compliance", label: "Regulatory Compliance", icon: Check, description: "Meet sustainability requirements" },
  { id: "exploration", label: "Just Exploring", icon: Globe, description: "Learn about carbon markets" },
];

const PROJECT_INTERESTS = [
  { id: "reforestation", label: "Reforestation", icon: TreePine },
  { id: "ocean_restoration", label: "Ocean Restoration", icon: Waves },
  { id: "renewable_energy", label: "Renewable Energy", icon: Zap },
  { id: "soil_carbon", label: "Soil Carbon", icon: CircleDot },
];

const BUDGET_RANGES = [
  { id: "starter", label: "Under $1,000", description: "Perfect for getting started" },
  { id: "growth", label: "$1,000 - $10,000", description: "Build a solid portfolio" },
  { id: "scale", label: "$10,000 - $50,000", description: "Make significant impact" },
  { id: "enterprise", label: "$50,000+", description: "Enterprise-level investing" },
];

const Onboarding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    organization: "",
    investmentGoal: "",
    interests: [],
    monthlyBudget: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const steps = [
    { title: "Organization", subtitle: "Tell us about yourself" },
    { title: "Goals", subtitle: "What brings you here?" },
    { title: "Interests", subtitle: "What projects excite you?" },
    { title: "Budget", subtitle: "Investment capacity" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Update the user's profile with onboarding data
      const { error } = await supabase
        .from("profiles")
        .update({
          organization: data.organization || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Store onboarding completion in localStorage
      localStorage.setItem(`onboarding_completed_${user.id}`, "true");
      
      toast.success("Welcome to Atlas Sanctum! 🌿");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleInterest = (id: string) => {
    setData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // Organization is optional
      case 1:
        return data.investmentGoal !== "";
      case 2:
        return data.interests.length > 0;
      case 3:
        return data.monthlyBudget !== "";
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-ocean/10 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-ocean flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground">
              Atlas Sanctum
            </span>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.setItem(`onboarding_completed_${user?.id}`, "true");
              navigate("/dashboard");
            }}
            className="text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: currentStep === index ? 1.1 : 1,
                  backgroundColor:
                    index < currentStep
                      ? "hsl(var(--primary))"
                      : index === currentStep
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted))",
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </motion.div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-1 mx-2 rounded-full transition-colors ${
                    index < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-elevated"
              >
                {/* Step Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 mb-4">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-sm text-muted-foreground">
                      Step {currentStep + 1} of {steps.length}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-muted-foreground">
                    {steps[currentStep].subtitle}
                  </p>
                </div>

                {/* Step 1: Organization */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="organization">Organization Name (Optional)</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="organization"
                          placeholder="Your company or organization"
                          value={data.organization}
                          onChange={(e) => setData({ ...data, organization: e.target.value })}
                          className="pl-11"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This helps us personalize your experience. Individual investors can skip this.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Investment Goals */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {INVESTMENT_GOALS.map((goal) => (
                      <motion.button
                        key={goal.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setData({ ...data, investmentGoal: goal.id })}
                        className={`p-5 rounded-xl border-2 text-left transition-all ${
                          data.investmentGoal === goal.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <goal.icon className={`w-8 h-8 mb-3 ${
                          data.investmentGoal === goal.id ? "text-primary" : "text-muted-foreground"
                        }`} />
                        <h3 className="font-semibold text-foreground mb-1">{goal.label}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Step 3: Project Interests */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <p className="text-center text-muted-foreground mb-6">
                      Select all that interest you
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {PROJECT_INTERESTS.map((interest) => (
                        <motion.button
                          key={interest.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleInterest(interest.id)}
                          className={`p-5 rounded-xl border-2 text-center transition-all ${
                            data.interests.includes(interest.id)
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <interest.icon className={`w-10 h-10 mx-auto mb-3 ${
                            data.interests.includes(interest.id) ? "text-primary" : "text-muted-foreground"
                          }`} />
                          <span className="font-medium text-foreground">{interest.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Budget */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    {BUDGET_RANGES.map((budget) => (
                      <motion.button
                        key={budget.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setData({ ...data, monthlyBudget: budget.id })}
                        className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                          data.monthlyBudget === budget.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{budget.label}</h3>
                            <p className="text-sm text-muted-foreground">{budget.description}</p>
                          </div>
                          {data.monthlyBudget === budget.id && (
                            <Check className="w-6 h-6 text-primary" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || isSubmitting}
              className="gap-2 bg-gradient-to-r from-primary to-ocean hover:opacity-90"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
              ) : (
                <>
                  Complete Setup
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

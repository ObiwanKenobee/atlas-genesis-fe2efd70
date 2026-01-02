import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { 
  User, Lock, Bell, Shield, LogOut, Save, ArrowLeft,
  Mail, Building2, Globe, Target, TreePine, Waves, Zap, CircleDot,
  Check, RefreshCw, Moon, Sun, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  full_name: string | null;
  organization: string | null;
  avatar_url: string | null;
}

interface Preferences {
  organization_type: string | null;
  investment_goals: string[] | null;
  project_interests: string[] | null;
  monthly_budget: string | null;
  email_notifications: boolean;
  transaction_alerts: boolean;
  impact_updates: boolean;
  marketing_emails: boolean;
  newsletter_subscribed: boolean;
}

const INVESTMENT_GOALS = [
  { id: "offset", label: "Carbon Offsetting", icon: TreePine },
  { id: "impact", label: "Impact Investment", icon: Target },
  { id: "compliance", label: "Regulatory Compliance", icon: Check },
  { id: "exploration", label: "Just Exploring", icon: Globe },
];

const PROJECT_INTERESTS = [
  { id: "reforestation", label: "Reforestation", icon: TreePine },
  { id: "ocean_restoration", label: "Ocean Restoration", icon: Waves },
  { id: "renewable_energy", label: "Renewable Energy", icon: Zap },
  { id: "soil_carbon", label: "Soil Carbon", icon: CircleDot },
];

const BUDGET_RANGES = [
  { id: "starter", label: "Under $1,000" },
  { id: "growth", label: "$1,000 - $10,000" },
  { id: "scale", label: "$10,000 - $50,000" },
  { id: "enterprise", label: "$50,000+" },
];

const Settings = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    organization_type: null,
    investment_goals: [],
    project_interests: [],
    monthly_budget: null,
    email_notifications: true,
    transaction_alerts: true,
    impact_updates: true,
    marketing_emails: false,
    newsletter_subscribed: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    organization: "",
    email: "",
  });
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "notifications" | "security" | "appearance">("profile");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, organization, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
          setFormData({
            full_name: profileData.full_name || "",
            organization: profileData.organization || "",
            email: user.email || "",
          });
        }

        // Fetch preferences
        const { data: prefsData } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (prefsData) {
          setPreferences({
            organization_type: prefsData.organization_type,
            investment_goals: prefsData.investment_goals || [],
            project_interests: prefsData.project_interests || [],
            monthly_budget: prefsData.monthly_budget,
            email_notifications: prefsData.email_notifications ?? true,
            transaction_alerts: prefsData.transaction_alerts ?? true,
            impact_updates: prefsData.impact_updates ?? true,
            marketing_emails: prefsData.marketing_emails ?? false,
            newsletter_subscribed: prefsData.newsletter_subscribed ?? false,
          });
        }
      }
    };

    fetchData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          organization: formData.organization,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setIsSavingPrefs(true);
    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          organization_type: preferences.organization_type,
          investment_goals: preferences.investment_goals,
          project_interests: preferences.project_interests,
          monthly_budget: preferences.monthly_budget,
          email_notifications: preferences.email_notifications,
          transaction_alerts: preferences.transaction_alerts,
          impact_updates: preferences.impact_updates,
          marketing_emails: preferences.marketing_emails,
          newsletter_subscribed: preferences.newsletter_subscribed,
        }, { onConflict: 'user_id' });

      if (error) throw error;
      toast.success("Preferences saved successfully");
    } catch (error) {
      toast.error("Failed to save preferences");
      console.error(error);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const toggleInterest = (id: string) => {
    setPreferences((prev) => ({
      ...prev,
      project_interests: prev.project_interests?.includes(id)
        ? prev.project_interests.filter((i) => i !== id)
        : [...(prev.project_interests || []), id],
    }));
  };

  const toggleGoal = (id: string) => {
    setPreferences((prev) => ({
      ...prev,
      investment_goals: prev.investment_goals?.includes(id)
        ? prev.investment_goals.filter((i) => i !== id)
        : [...(prev.investment_goals || []), id],
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
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

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Preferences", icon: Target },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Moon },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your personal information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Organization
                  </Label>
                  <Input
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="Your organization or role"
                    className="border-border/50"
                  />
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Investment Goals */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Investment Goals</CardTitle>
                <CardDescription>What brings you to Atlas Sanctum?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {INVESTMENT_GOALS.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        preferences.investment_goals?.includes(goal.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <goal.icon className={`w-5 h-5 ${
                        preferences.investment_goals?.includes(goal.id) ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <span className="font-medium text-sm text-foreground">{goal.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Interests */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Project Interests</CardTitle>
                <CardDescription>Select the project types you're interested in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {PROJECT_INTERESTS.map((interest) => (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        preferences.project_interests?.includes(interest.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <interest.icon className={`w-5 h-5 ${
                        preferences.project_interests?.includes(interest.id) ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <span className="font-medium text-sm text-foreground">{interest.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Budget */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Investment Capacity</CardTitle>
                <CardDescription>Your monthly investment budget</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {BUDGET_RANGES.map((budget) => (
                    <button
                      key={budget.id}
                      onClick={() => setPreferences(prev => ({ ...prev, monthly_budget: budget.id }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        preferences.monthly_budget === budget.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="font-medium text-sm text-foreground">{budget.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleSavePreferences}
              disabled={isSavingPrefs}
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSavingPrefs ? "animate-spin" : ""}`} />
              {isSavingPrefs ? "Saving..." : "Save Preferences"}
            </Button>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how you receive updates</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Get updates about your portfolio</p>
                  </div>
                  <Switch 
                    checked={preferences.email_notifications}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, email_notifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">Transaction Alerts</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Notify me of purchase and sale activity</p>
                  </div>
                  <Switch 
                    checked={preferences.transaction_alerts}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, transaction_alerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">Impact Updates</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Share updates about environmental impact</p>
                  </div>
                  <Switch 
                    checked={preferences.impact_updates}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, impact_updates: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">Marketing Emails</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">New projects and special offers</p>
                  </div>
                  <Switch 
                    checked={preferences.marketing_emails}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketing_emails: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">Newsletter</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Weekly insights on regenerative impact</p>
                  </div>
                  <Switch 
                    checked={preferences.newsletter_subscribed}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, newsletter_subscribed: checked }))}
                  />
                </div>

                <Button 
                  onClick={handleSavePreferences}
                  disabled={isSavingPrefs}
                  className="w-full mt-4"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingPrefs ? "Saving..." : "Save Notification Settings"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Moon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how Atlas Sanctum looks</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-4 block">Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        theme === "light"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center">
                        <Sun className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Light</span>
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        theme === "dark"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Moon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Dark</span>
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        theme === "system"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium text-foreground">System</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your theme preference is automatically saved and will persist across sessions.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Protect your account and data</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="w-4 h-4 mr-2" />
                  Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Recovery Email Address
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-destructive/10 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-destructive/20 text-destructive hover:bg-destructive/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Settings;

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Leaf, LogOut, User, BarChart3, Globe2, Wallet, 
  TrendingUp, Activity, Layers, Settings, Bell,
  ChevronRight, ExternalLink, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  full_name: string | null;
  organization: string | null;
  avatar_url: string | null;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, organization, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!error && data) {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, [user]);

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

  const stats = [
    { label: "Carbon Credits", value: "2,450", change: "+12.5%", icon: Leaf, color: "text-primary" },
    { label: "Portfolio Value", value: "$45.2K", change: "+8.3%", icon: Wallet, color: "text-accent" },
    { label: "Impact Score", value: "847", change: "+5.2%", icon: TrendingUp, color: "text-ocean" },
    { label: "Active Projects", value: "12", change: "+2", icon: Activity, color: "text-earth" },
  ];

  const recentActivity = [
    { title: "Carbon credit purchase", description: "50 credits from Amazon Rainforest Project", time: "2 hours ago", type: "purchase" },
    { title: "Impact verification", description: "Ocean restoration milestone achieved", time: "5 hours ago", type: "milestone" },
    { title: "New partnership", description: "Connected with Blue Ocean Initiative", time: "1 day ago", type: "partnership" },
    { title: "Portfolio update", description: "Quarterly performance report available", time: "2 days ago", type: "report" },
  ];

  const quickActions = [
    { label: "Buy Credits", icon: Wallet, href: "/marketplace" },
    { label: "My Portfolio", icon: Globe2, href: "/transactions" },
    { label: "Explore Projects", icon: Layers, href: "/marketplace" },
    { label: "Settings", icon: Settings, href: "#" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-ocean flex items-center justify-center flex-shrink-0">
              <Leaf className="w-4 sm:w-5 h-4 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-base sm:text-xl font-semibold text-foreground truncate">
              Atlas Sanctum
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-10 w-10">
              <Bell className="w-4 sm:w-5 h-4 sm:h-5" />
            </Button>
            {isAdmin && (
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <Link to="/admin">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-border">
              <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  {profile?.full_name || user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile?.organization || "Investor"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive h-10 w-10">
              <LogOut className="w-4 sm:w-5 h-4 sm:h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Explorer"}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Track your regenerative impact and manage your portfolio
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Recent Activity</h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6"
          >
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.a
                  key={action.label}
                  href={action.href}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <action.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground flex-1">{action.label}</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </motion.a>
              ))}
            </div>

            {/* Impact Summary */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-ocean/10 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-2">Your Impact</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You've contributed to protecting 24 hectares of rainforest this month.
              </p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "72%" }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-gradient-to-r from-primary to-ocean rounded-full"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">72% toward monthly goal</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

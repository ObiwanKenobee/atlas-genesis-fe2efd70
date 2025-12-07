import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Calendar, Award, Leaf, Users, 
  TrendingUp, ShieldCheck, ExternalLink, Building2 
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProject } from '@/hooks/useMarketplace';
import { useAuth } from '@/hooks/useAuth';
import { PurchaseModal } from '@/components/marketplace/PurchaseModal';
import { PROJECT_TYPE_LABELS, PROJECT_TYPE_ICONS } from '@/types/marketplace';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(id);
  const { user } = useAuth();
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 container mx-auto px-6">
          <Skeleton className="h-96 w-full rounded-2xl mb-8" />
          <Skeleton className="h-12 w-1/2 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-48 md:col-span-2" />
            <Skeleton className="h-48" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 container mx-auto px-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/marketplace">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  const availabilityPercent = (project.available_credits / project.total_credits) * 100;
  const soldCredits = project.total_credits - project.available_credits;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        {/* Hero Image */}
        <div className="relative h-[40vh] min-h-[320px] overflow-hidden">
          <img
            src={project.image_url || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600'}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-6 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link 
                to="/marketplace" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Marketplace
              </Link>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-primary/90 text-primary-foreground">
                  {PROJECT_TYPE_ICONS[project.project_type]} {PROJECT_TYPE_LABELS[project.project_type]}
                </Badge>
                <Badge variant="outline" className="bg-card/80 backdrop-blur-sm border-border">
                  Vintage {project.vintage_year}
                </Badge>
                <Badge variant="outline" className="bg-card/80 backdrop-blur-sm border-accent text-accent">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {project.certification}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {project.title}
              </h1>
              
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {project.location}, {project.country}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {project.developer_name}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="bg-card-gradient border-border/50">
                  <CardHeader>
                    <CardTitle className="text-foreground">About This Project</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80 leading-relaxed">
                      {project.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-card-gradient border-border/50">
                  <CardHeader>
                    <CardTitle className="text-foreground">Project Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { icon: Award, label: 'Certification', value: project.certification },
                        { icon: Leaf, label: 'Methodology', value: project.methodology || 'Standard' },
                        { icon: Calendar, label: 'Vintage Year', value: project.vintage_year.toString() },
                        { icon: TrendingUp, label: 'CO₂ per Credit', value: `${project.co2_offset_per_credit} tCO₂` },
                        { icon: Users, label: 'Developer', value: project.developer_name },
                        { icon: MapPin, label: 'Location', value: `${project.location}, ${project.country}` },
                      ].map((item) => (
                        <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <item.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs text-muted-foreground">{item.label}</div>
                            <div className="text-foreground font-medium">{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-card-gradient border-border/50">
                  <CardHeader>
                    <CardTitle className="text-foreground">Credit Availability</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {soldCredits.toLocaleString()} of {project.total_credits.toLocaleString()} credits sold
                      </span>
                      <span className="text-primary font-medium">{availabilityPercent.toFixed(1)}% available</span>
                    </div>
                    <Progress value={100 - availabilityPercent} className="h-3" />
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <div className="text-2xl font-bold text-foreground">{project.available_credits.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Available Credits</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <div className="text-2xl font-bold text-primary">{soldCredits.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Credits Sold</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar - Purchase Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:sticky lg:top-24 h-fit"
            >
              <Card className="bg-card-gradient border-border/50 shadow-elevated">
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      <span className="text-4xl font-bold text-gradient-gold">${project.price_per_credit}</span>
                    </div>
                    <span className="text-muted-foreground">per carbon credit</span>
                  </div>

                  <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available</span>
                      <span className="text-foreground font-medium">{project.available_credits.toLocaleString()} credits</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CO₂ Offset</span>
                      <span className="text-foreground font-medium">{project.co2_offset_per_credit} tonnes/credit</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Certification</span>
                      <span className="text-foreground font-medium">{project.certification}</span>
                    </div>
                  </div>

                  {user ? (
                    <Button 
                      onClick={() => setIsPurchaseOpen(true)}
                      className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                      disabled={project.available_credits === 0}
                    >
                      {project.available_credits === 0 ? 'Sold Out' : 'Purchase Credits'}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button asChild className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
                        <Link to="/auth">Sign In to Purchase</Link>
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Create an account to start offsetting your carbon footprint
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/30">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Verified & Secure Transaction</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      {project && (
        <PurchaseModal
          project={project}
          isOpen={isPurchaseOpen}
          onClose={() => setIsPurchaseOpen(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetail;

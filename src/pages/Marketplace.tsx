import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, TrendingUp, Globe, ShieldCheck } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ProjectCard } from '@/components/marketplace/ProjectCard';
import { ProjectFilters } from '@/components/marketplace/ProjectFilters';
import { useProjects } from '@/hooks/useMarketplace';
import { ProjectType } from '@/types/marketplace';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<ProjectType | undefined>();

  const { data: projects, isLoading, error, refetch } = useProjects({ type: selectedType, search });

  // Real-time inventory updates
  useEffect(() => {
    const channel = supabase
      .channel('carbon-projects-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'carbon_projects',
        },
        (payload) => {
          console.log('Project updated:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Handle payment callback
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const reference = searchParams.get('reference');
    const token = searchParams.get('token'); // PayPal token
    
    if (paymentStatus === 'success') {
      const verifyPayment = async () => {
        try {
          // Determine provider based on URL params
          const isPaystack = !!reference;
          const isPayPal = !!token;
          
          if (isPaystack || isPayPal) {
            const { data, error } = await supabase.functions.invoke('verify-payment', {
              body: {
                provider: isPaystack ? 'paystack' : 'paypal',
                reference: reference || undefined,
                orderId: token || undefined,
              },
            });

            if (error) throw error;

            if (data.verified) {
              toast.success('Payment successful! Credits added to your portfolio.');
              refetch();
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } else {
            toast.success('Payment completed successfully!');
          }
        } catch (err) {
          console.error('Verification error:', err);
          toast.error('Failed to verify payment. Please check your portfolio.');
        }
        
        // Clear URL params
        setSearchParams({});
      };

      verifyPayment();
    } else if (paymentStatus === 'cancelled') {
      toast.info('Payment was cancelled.');
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, refetch]);

  const stats = useMemo(() => {
    if (!projects) return { total: 0, credits: 0, countries: 0 };
    const countries = new Set(projects.map((p) => p.country));
    return {
      total: projects.length,
      credits: projects.reduce((sum, p) => sum + p.available_credits, 0),
      countries: countries.size,
    };
  }, [projects]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-hero" />
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative container mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">Carbon Credit</span>{' '}
                <span className="text-gradient">Marketplace</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Invest in verified carbon offset projects worldwide. Every credit you purchase 
                directly funds environmental protection and restoration.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto"
            >
              {[
                { icon: Leaf, label: 'Active Projects', value: stats.total },
                { icon: TrendingUp, label: 'Available Credits', value: stats.credits.toLocaleString() },
                { icon: Globe, label: 'Countries', value: stats.countries },
                { icon: ShieldCheck, label: 'Verified', value: '100%' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 text-center"
                >
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Filters & Projects */}
        <section className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ProjectFilters
              search={search}
              onSearchChange={setSearch}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          </motion.div>

          <div className="mt-8">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-t-xl" />
                    <div className="space-y-2 p-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-destructive">Failed to load projects. Please try again.</p>
              </div>
            ) : projects?.length === 0 ? (
              <div className="text-center py-16">
                <Leaf className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No projects found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects?.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Marketplace;

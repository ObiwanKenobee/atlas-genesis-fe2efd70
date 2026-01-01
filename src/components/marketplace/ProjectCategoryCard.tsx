import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CarbonProject, ProjectType, PROJECT_TYPE_LABELS, PROJECT_TYPE_ICONS } from '@/types/marketplace';

interface ProjectCategoryCategoryCardProps {
  type: ProjectType;
  projects: CarbonProject[];
  totalMarketValue: number;
  participantCount: number;
  index: number;
}

const categoryDescriptions: Record<ProjectType, string> = {
  reforestation: 'Restore forests and create lasting ecosystems through strategic reforestation initiatives',
  renewable_energy: 'Transition to clean energy with solar, wind, and hydroelectric projects',
  methane_capture: 'Capture and reduce methane emissions from agriculture and waste management',
  ocean_restoration: 'Restore marine ecosystems, coral reefs, and ocean biodiversity',
  soil_carbon: 'Build soil health while sequestering carbon through regenerative agriculture',
  direct_air_capture: 'Remove CO₂ directly from the atmosphere using advanced technology',
};

const categoryColors: Record<ProjectType, { bg: string; border: string; text: string; icon: string }> = {
  reforestation: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    icon: '🌲',
  },
  renewable_energy: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    icon: '⚡',
  },
  methane_capture: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    icon: '🏭',
  },
  ocean_restoration: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    icon: '🌊',
  },
  soil_carbon: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-900',
    icon: '🌱',
  },
  direct_air_capture: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-900',
    icon: '💨',
  },
};

export function ProjectCategoryCard({
  type,
  projects,
  totalMarketValue,
  participantCount,
  index,
}: ProjectCategoryCategoryCardProps) {
  const colors = categoryColors[type];
  const topProjects = projects.slice(0, 3);
  const totalCredits = projects.reduce((sum, p) => sum + p.total_credits, 0);
  const totalAvailable = projects.reduce((sum, p) => sum + p.available_credits, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className={`overflow-hidden border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-all duration-300`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{PROJECT_TYPE_ICONS[type]}</span>
                <div>
                  <CardTitle className={`text-2xl ${colors.text}`}>
                    {PROJECT_TYPE_LABELS[type]}
                  </CardTitle>
                </div>
              </div>
              <CardDescription className={`${colors.text} opacity-85`}>
                {categoryDescriptions[type]}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Category Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg bg-white/50 border ${colors.border}`}>
              <p className="text-xs text-muted-foreground mb-1">Active Projects</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {projects.length}
              </p>
            </div>
            <div className={`p-3 rounded-lg bg-white/50 border ${colors.border}`}>
              <p className="text-xs text-muted-foreground mb-1">Market Value</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                ${(totalMarketValue / 1e9).toFixed(1)}B
              </p>
            </div>
            <div className={`p-3 rounded-lg bg-white/50 border ${colors.border}`}>
              <p className="text-xs text-muted-foreground mb-1">Total Credits</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {(totalCredits / 1e6).toFixed(1)}M
              </p>
            </div>
          </div>

          {/* Top Projects Preview */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              Featured Projects ({Math.min(topProjects.length, 3)} of {projects.length})
            </h4>
            <div className="space-y-2">
              {topProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/60 border border-white/80 hover:bg-white transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {project.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.location}, {project.country}
                    </p>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="text-sm font-bold text-gradient-gold">${project.price_per_credit}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((project.available_credits / project.total_credits) * 100)}% available
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="flex items-center gap-3 pt-2 border-t">
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {participantCount.toLocaleString()} investors
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {totalAvailable.toLocaleString()} credits available
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            asChild
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Link to={`/marketplace?type=${type}`}>
              Explore Category
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

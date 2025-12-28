import { motion } from 'framer-motion';
import { MapPin, Leaf, Award, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CarbonProject, PROJECT_TYPE_LABELS, PROJECT_TYPE_ICONS } from '@/types/marketplace';
import { useLatestMeasurement } from '@/hooks/useMeasurementData';
import { useBioregionalZones } from '@/hooks/useBioregionalZones';

interface ProjectCardProps {
  project: CarbonProject;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const availabilityPercent = (project.available_credits / project.total_credits) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group overflow-hidden bg-card-gradient border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-glow">
        <div className="relative h-48 overflow-hidden">
          <img
            src={project.image_url || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
            {PROJECT_TYPE_ICONS[project.project_type]} {PROJECT_TYPE_LABELS[project.project_type]}
          </Badge>
          <Badge variant="outline" className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm border-border">
            {project.vintage_year}
          </Badge>
        </div>

        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {project.title}
            </h3>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{project.location}, {project.country}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-accent" />
              <span className="text-foreground/80">{project.certification}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="text-foreground/80">{project.co2_offset_per_credit} tCO₂</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Availability</span>
              <span className="text-foreground">{project.available_credits.toLocaleString()} credits</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${availabilityPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-2xl font-bold text-gradient-gold">${project.price_per_credit}</span>
              </div>
              <span className="text-xs text-muted-foreground">per credit</span>
            </div>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
              <Link to={`/marketplace/${project.id}`}>View Details</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

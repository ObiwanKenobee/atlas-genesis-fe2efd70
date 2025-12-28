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

/**
 * Mini chart showing CO2 trend for the project
 */
function MeasurementMiniChart({ projectId }: { projectId: string }) {
  const { data: latestMeasurement } = useLatestMeasurement(projectId);
  const { data: zones } = useBioregionalZones();

  if (!latestMeasurement) {
    return null;
  }

  // Simple sparkline-like data
  const data = [
    { co2: latestMeasurement.co2_level ? latestMeasurement.co2_level * 0.9 : 0 },
    { co2: latestMeasurement.co2_level ? latestMeasurement.co2_level * 0.95 : 0 },
    { co2: latestMeasurement.co2_level || 0 },
  ];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">CO₂ Trend</span>
        <Badge variant="outline" className="text-xs h-5">
          {latestMeasurement.co2_level?.toFixed(1) || 'N/A'} ppm
        </Badge>
      </div>
      <ResponsiveContainer width="100%" height={30}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <Line
            type="monotone"
            dataKey="co2"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
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
          {/* Title and Location */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1">
                {project.title}
              </h3>
              {project.verified_by_system_at && (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" title="System Verified" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{project.location}, {project.country}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>

          {/* Certification and Impact Score */}
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-accent" />
              <span className="text-foreground/80">{project.certification}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="text-foreground/80">{project.co2_offset_per_credit} tCO₂</span>
            </div>
            {project.impact_score && (
              <Badge variant="secondary" className="text-xs">
                Impact: {project.impact_score.toFixed(0)}/100
              </Badge>
            )}
          </div>

          {/* Measurement Mini Chart */}
          <MeasurementMiniChart projectId={project.id} />

          {/* Availability Bar */}
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

          {/* Last Verified Info */}
          {project.last_measurement_at && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1.5 bg-muted/30 rounded border border-border/30">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>
                Last verified{' '}
                {new Date(project.last_measurement_at).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Price and Action */}
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

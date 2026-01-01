import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, Flower2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  useRegenerativeMetrics,
  useSoilHealthScore,
  useBiodiversityIndex,
  useCropDiversityMetrics,
  useRegenerativeMetricsTrend,
} from '@/hooks/useRegenerativeMetrics';
import { RegenerativeMetrics as RegenerativeMetricsType } from '@/types/marketplace';
import { RegenerativeMetrics } from '@/types/marketplace';

interface RegenerativeMetricsCardProps {
  projectId: string;
  compact?: boolean;
}

export function RegenerativeMetricsCard({ projectId, compact = false }: RegenerativeMetricsCardProps) {
  const { data: metrics, isLoading } = useRegenerativeMetrics(projectId);
  const { data: soilHealth } = useSoilHealthScore(projectId);
  const { data: biodiversity } = useBiodiversityIndex(projectId);
  const { data: cropDiversity } = useCropDiversityMetrics(projectId);
  const { data: trend } = useRegenerativeMetricsTrend(projectId);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  if (isLoading || !metrics || metrics.length === 0) {
    return (
      <Card className="bg-card-gradient border-border/50">
        <CardHeader>
          <CardTitle>Regenerative Metrics</CardTitle>
          <CardDescription>Ecosystem health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const latest = metrics[0];

  const metrics_list = [
    {
      id: 'soil-health',
      title: 'Soil Microbiome Health',
      icon: Leaf,
      color: 'text-green-500',
      value: latest?.soil_microbiome_health,
      status: soilHealth?.level || 'unknown',
      description: 'Foundation of regenerative systems',
      recommendations: soilHealth?.recommendations,
      trend: trend?.microbiome_trend_30d,
    },
    {
      id: 'biodiversity',
      title: 'Biodiversity Index',
      icon: Flower2,
      color: 'text-emerald-500',
      value: latest?.biodiversity_index,
      status: biodiversity?.status || 'unknown',
      description: 'Species richness and diversity',
      nativeSpecies: biodiversity?.species_estimate,
      hasPollinators: biodiversity?.pollinator_presence,
      trend: trend?.biodiversity_trend_30d,
    },
    {
      id: 'crop-diversity',
      title: 'Crop Diversity Index',
      icon: Heart,
      color: 'text-orange-500',
      value: latest?.crop_diversity_index,
      status: cropDiversity?.diversity_level || 'unknown',
      description: 'Prevents monoculture, builds resilience',
      cropCount: cropDiversity?.crop_count,
      isMonoculture: cropDiversity?.is_monoculture,
      trend: trend?.crop_diversity_trend_30d,
    },
  ];

  if (compact) {
    return (
      <Card className="bg-card-gradient border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Regenerative Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics_list.map((metric) => (
            <div key={metric.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                  <span className="text-sm font-medium text-foreground">{metric.title}</span>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {metric.value?.toFixed(1) || 'N/A'}
                  {metric.value !== undefined && '/100'}
                </span>
              </div>
              <Progress value={Math.min(100, metric.value || 0)} className="h-2" />
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">{metric.status}</Badge>
                {metric.trend && (
                  <span className={`text-xs font-medium ${metric.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}% 30d
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card-gradient border-border/50">
      <CardHeader>
        <CardTitle>Regenerative Metrics</CardTitle>
        <CardDescription>Ecosystem health and agricultural resilience indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics_list.map((metric, idx) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setExpandedMetric(expandedMetric === metric.id ? null : metric.id)}
            className="p-4 rounded-lg border border-border/30 hover:border-primary/30 cursor-pointer transition-all bg-background/50"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${metric.color} bg-primary/10`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{metric.title}</h4>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">
                  {metric.value?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">/100</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 mb-3">
              <Progress value={Math.min(100, metric.value || 0)} className="h-2" />
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    metric.status === 'excellent' || metric.status === 'high'
                      ? 'bg-green-500/10 text-green-700 border-green-300'
                      : metric.status === 'good' || metric.status === 'moderate'
                        ? 'bg-blue-500/10 text-blue-700 border-blue-300'
                        : metric.status === 'fair' || metric.status === 'low'
                          ? 'bg-yellow-500/10 text-yellow-700 border-yellow-300'
                          : 'bg-red-500/10 text-red-700 border-red-300'
                  }`}
                >
                  {metric.status}
                </Badge>

                {metric.trend !== undefined && (
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {metric.trend > 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">+{metric.trend.toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />
                        <span className="text-red-600">{metric.trend.toFixed(1)}%</span>
                      </>
                    )}
                    <span className="text-muted-foreground">30d</span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details - Soil Health */}
            {metric.id === 'soil-health' && expandedMetric === metric.id && soilHealth && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-border/30 space-y-3"
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Recommendations:</p>
                  <ul className="space-y-1">
                    {soilHealth.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Additional Details - Biodiversity */}
            {metric.id === 'biodiversity' && expandedMetric === metric.id && biodiversity && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-border/30 space-y-3"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Native Species</p>
                    <p className="text-lg font-bold text-foreground">
                      {biodiversity.species_estimate || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Pollinator Presence</p>
                    <Badge
                      variant="outline"
                      className={
                        biodiversity.pollinator_presence
                          ? 'bg-green-500/10 text-green-700 border-green-300'
                          : 'bg-red-500/10 text-red-700 border-red-300'
                      }
                    >
                      {biodiversity.pollinator_presence ? 'Active' : 'Limited'}
                    </Badge>
                  </div>
                </div>
                {biodiversity.conservation_priority && (
                  <div className="p-2 bg-yellow-500/10 border border-yellow-200 rounded text-xs text-yellow-900">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Conservation priority area
                  </div>
                )}
              </motion.div>
            )}

            {/* Additional Details - Crop Diversity */}
            {metric.id === 'crop-diversity' && expandedMetric === metric.id && cropDiversity && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-border/30 space-y-3"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Crop Types</p>
                    <p className="text-lg font-bold text-foreground">{cropDiversity.crop_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Monoculture Risk</p>
                    <Badge
                      variant="outline"
                      className={
                        cropDiversity.is_monoculture
                          ? 'bg-red-500/10 text-red-700 border-red-300'
                          : 'bg-green-500/10 text-green-700 border-green-300'
                      }
                    >
                      {cropDiversity.is_monoculture ? 'High Risk' : 'Low Risk'}
                    </Badge>
                  </div>
                </div>
                {cropDiversity.is_monoculture && (
                  <div className="p-2 bg-red-500/10 border border-red-200 rounded text-xs text-red-900">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Increase crop diversity to improve resilience
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}

        {/* Data Quality Info */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30 text-sm">
          <span className="text-muted-foreground">Data Source:</span>
          <Badge variant="secondary">{latest?.data_source || 'N/A'}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

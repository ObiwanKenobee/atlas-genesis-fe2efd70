import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RegenerativeMetrics, RegenerativeMetricsTrend } from '@/types/marketplace';

interface MetricsFilters {
  days?: number; // Default 30 days
  dataSource?: string; // Filter by eDNA, Bioacoustic, Satellite, etc.
}

/**
 * Fetch regenerative metrics for a project
 * Includes soil microbiome, biodiversity, crop diversity, and restoration indicators
 */
export function useRegenerativeMetrics(projectId: string | undefined, filters?: MetricsFilters) {
  const days = filters?.days || 30;
  const dataSource = filters?.dataSource;

  return useQuery({
    queryKey: ['regenerative-metrics', projectId, days, dataSource],
    queryFn: async () => {
      if (!projectId) return [];

      let query = supabase
        .from('regenerative_metrics')
        .select('*')
        .eq('project_id', projectId)
        .order('measurement_date', { ascending: false })
        .limit(100);

      // Filter by date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = query.gte('measurement_date', startDate.toISOString());

      // Filter by data source if provided
      if (dataSource) {
        query = query.eq('data_source', dataSource);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as RegenerativeMetrics[]) || [];
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

/**
 * Fetch latest regenerative metrics for a project
 * Returns the most recent ecosystem health assessment
 */
export function useLatestRegenerativeMetrics(projectId: string | undefined) {
  return useQuery({
    queryKey: ['latest-regenerative-metrics', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('regenerative_metrics')
        .select('*')
        .eq('project_id', projectId)
        .order('measurement_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as RegenerativeMetrics) || null;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 30, // 30 minute cache
  });
}

/**
 * Compute regenerative metrics trends over 30 days
 * Shows how ecosystem health is improving or declining
 */
export function useRegenerativeMetricsTrend(projectId: string | undefined) {
  const { data: allMetrics } = useRegenerativeMetrics(projectId, { days: 30 });

  return useQuery({
    queryKey: ['regenerative-metrics-trend', projectId],
    queryFn: async () => {
      if (!allMetrics || allMetrics.length === 0) {
        return {
          microbiome_trend_30d: null,
          biodiversity_trend_30d: null,
          crop_diversity_trend_30d: null,
          pollinator_trend_30d: null,
          latest_scores: null,
          health_status: 'poor' as const,
        };
      }

      // Sort by date
      const sorted = [...allMetrics].sort(
        (a, b) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime()
      );

      const latest = sorted[0];

      // Split into first and second half for trend analysis
      const midpoint = Math.floor(sorted.length / 2);
      const firstHalf = sorted.slice(midpoint);
      const secondHalf = sorted.slice(0, midpoint);

      // Calculate average scores for each half
      const calcAvg = (metrics: RegenerativeMetrics[], field: keyof RegenerativeMetrics) => {
        const values = metrics
          .map((m) => m[field])
          .filter((v) => typeof v === 'number' && !isNaN(v as number));
        return values.length > 0 ? values.reduce((a, b) => (a as number) + (b as number), 0) / values.length : null;
      };

      const microbiome_first = calcAvg(firstHalf, 'soil_microbiome_health') || 0;
      const microbiome_second = calcAvg(secondHalf, 'soil_microbiome_health') || 0;
      const microbiome_trend_30d = microbiome_first > 0 ? parseFloat(
        (((microbiome_second - microbiome_first) / microbiome_first) * 100).toFixed(2)
      ) : null;

      const biodiversity_first = calcAvg(firstHalf, 'biodiversity_index') || 0;
      const biodiversity_second = calcAvg(secondHalf, 'biodiversity_index') || 0;
      const biodiversity_trend_30d = biodiversity_first > 0 ? parseFloat(
        (((biodiversity_second - biodiversity_first) / biodiversity_first) * 100).toFixed(2)
      ) : null;

      const crop_first = calcAvg(firstHalf, 'crop_diversity_index') || 0;
      const crop_second = calcAvg(secondHalf, 'crop_diversity_index') || 0;
      const crop_diversity_trend_30d = crop_first > 0 ? parseFloat(
        (((crop_second - crop_first) / crop_first) * 100).toFixed(2)
      ) : null;

      const pollinator_first = calcAvg(firstHalf, 'pollinator_count') || 0;
      const pollinator_second = calcAvg(secondHalf, 'pollinator_count') || 0;
      const pollinator_trend_30d = pollinator_first > 0 ? parseFloat(
        (((pollinator_second - pollinator_first) / pollinator_first) * 100).toFixed(2)
      ) : null;

      // Determine overall health status based on latest scores
      const avgScore =
        (
          (latest.soil_microbiome_health || 0) +
          (latest.biodiversity_index || 0) +
          (latest.crop_diversity_index || 0)
        ) / 3;

      let health_status: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
      if (avgScore >= 80) health_status = 'excellent';
      else if (avgScore >= 60) health_status = 'good';
      else if (avgScore >= 40) health_status = 'fair';

      return {
        microbiome_trend_30d,
        biodiversity_trend_30d,
        crop_diversity_trend_30d,
        pollinator_trend_30d,
        latest_scores: latest,
        health_status,
      } as RegenerativeMetricsTrend;
    },
    enabled: !!projectId && !!allMetrics,
  });
}

/**
 * Calculate soil microbiome health score
 * Scale 0-100 where 100 is optimally healthy
 */
export function useSoilHealthScore(projectId: string | undefined) {
  const { data: metrics } = useLatestRegenerativeMetrics(projectId);

  return useQuery({
    queryKey: ['soil-health-score', projectId],
    queryFn: async () => {
      if (!metrics) {
        return {
          score: 0,
          level: 'critical',
          recommendations: ['Conduct soil testing', 'Begin regenerative practices'],
        };
      }

      const score = metrics.soil_microbiome_health || 0;

      let level: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';
      if (score >= 80) level = 'excellent';
      else if (score >= 60) level = 'good';
      else if (score >= 40) level = 'fair';
      else if (score >= 20) level = 'poor';
      else level = 'critical';

      const recommendations = {
        excellent: ['Maintain current practices', 'Share best practices with neighbors'],
        good: ['Continue monitoring', 'Consider advanced regeneration techniques'],
        fair: ['Increase organic matter inputs', 'Reduce tillage', 'Add cover crops'],
        poor: ['Implement cover crop rotation', 'Reduce chemical inputs', 'Add compost'],
        critical: ['Urgent: Halt degradative practices', 'Begin intensive soil restoration', 'Consult soil specialist'],
      };

      return {
        score,
        level,
        recommendations: recommendations[level],
      };
    },
    enabled: !!metrics,
  });
}

/**
 * Calculate biodiversity index from various metrics
 * Combines species count, pollinator presence, and native species ratio
 */
export function useBiodiversityIndex(projectId: string | undefined) {
  const { data: metrics } = useLatestRegenerativeMetrics(projectId);

  return useQuery({
    queryKey: ['biodiversity-index', projectId],
    queryFn: async () => {
      if (!metrics) {
        return {
          index: 0,
          status: 'degraded',
          species_estimate: 0,
          pollinator_presence: false,
        };
      }

      const index = metrics.biodiversity_index || 0;
      const pollinators = metrics.pollinator_count || 0;
      const natives = metrics.native_species_count || 0;

      let status: 'degraded' | 'low' | 'moderate' | 'high' | 'pristine';
      if (index >= 80) status = 'pristine';
      else if (index >= 60) status = 'high';
      else if (index >= 40) status = 'moderate';
      else if (index >= 20) status = 'low';
      else status = 'degraded';

      return {
        index,
        status,
        species_estimate: natives,
        pollinator_presence: pollinators > 100,
        conservation_priority: status === 'degraded' || status === 'low',
      };
    },
    enabled: !!metrics,
  });
}

/**
 * Get crop diversity metrics
 * Prevents monoculture fraud and ensures agricultural resilience
 */
export function useCropDiversityMetrics(projectId: string | undefined) {
  const { data: metrics } = useLatestRegenerativeMetrics(projectId);

  return useQuery({
    queryKey: ['crop-diversity', projectId],
    queryFn: async () => {
      if (!metrics) {
        return {
          diversity_index: 0,
          crop_count: 0,
          is_monoculture: true,
          diversity_level: 'critical',
        };
      }

      const diversity_index = metrics.crop_diversity_index || 0;
      const crop_count = metrics.crop_types_count || 0;

      let diversity_level: 'critical' | 'low' | 'moderate' | 'high';
      if (diversity_index >= 70 && crop_count >= 5) diversity_level = 'high';
      else if (diversity_index >= 50 && crop_count >= 3) diversity_level = 'moderate';
      else if (diversity_index >= 25) diversity_level = 'low';
      else diversity_level = 'critical';

      const is_monoculture = crop_count <= 1;

      return {
        diversity_index,
        crop_count,
        is_monoculture,
        diversity_level,
        risk_level: is_monoculture ? 'high' : 'low',
      };
    },
    enabled: !!metrics,
  });
}

/**
 * Track restoration progress for mangrove/kelp forests
 * Specific to ocean and coastal carbon projects
 */
export function useRestorationProgress(projectId: string | undefined) {
  const { data: allMetrics } = useRegenerativeMetrics(projectId, { days: 90 });

  return useQuery({
    queryKey: ['restoration-progress', projectId],
    queryFn: async () => {
      if (!allMetrics || allMetrics.length < 2) {
        return {
          mangrove_health: null,
          kelp_coverage: null,
          growth_rate: null,
          restoration_status: 'no-data',
        };
      }

      const sorted = [...allMetrics].sort(
        (a, b) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
      );

      const latest = sorted[sorted.length - 1];
      const oldest = sorted[0];

      const mangrove_health = latest.mangrove_health_score || null;
      const kelp_coverage = latest.kelp_forest_coverage_percent || null;

      // Calculate growth rate
      let growth_rate = null;
      if (oldest.mangrove_health_score && latest.mangrove_health_score) {
        const daysDiff = Math.max(
          1,
          (new Date(latest.measurement_date).getTime() - new Date(oldest.measurement_date).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        growth_rate = parseFloat((
          ((latest.mangrove_health_score - oldest.mangrove_health_score) / daysDiff).toFixed(3)
        ));
      }

      let restoration_status: 'declining' | 'stable' | 'recovering' | 'thriving' = 'stable';
      if (growth_rate && growth_rate > 0.5) restoration_status = 'thriving';
      else if (growth_rate && growth_rate > 0.1) restoration_status = 'recovering';
      else if (growth_rate && growth_rate < -0.1) restoration_status = 'declining';

      return {
        mangrove_health,
        kelp_coverage,
        growth_rate,
        restoration_status,
      };
    },
    enabled: !!projectId && !!allMetrics,
  });
}

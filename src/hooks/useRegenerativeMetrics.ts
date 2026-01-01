import { useQuery } from "@tanstack/react-query";
import { RegenerativeMetrics, RegenerativeMetricsTrend } from "@/types/marketplace";

// Generate mock regenerative metrics
const generateMockMetrics = (projectId: string, days: number = 30): RegenerativeMetrics[] => {
  const metrics: RegenerativeMetrics[] = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    metrics.push({
      id: `regen-${projectId}-${i}`,
      project_id: projectId,
      measurement_date: date.toISOString(),
      soil_microbiome_health: 65 + Math.random() * 25,
      biodiversity_index: 70 + Math.random() * 20,
      pollinator_count: Math.floor(50 + Math.random() * 100),
      native_species_count: Math.floor(20 + Math.random() * 30),
      crop_diversity_index: 60 + Math.random() * 30,
      crop_types_count: Math.floor(3 + Math.random() * 8),
      mangrove_health_score: 75 + Math.random() * 15,
      kelp_forest_coverage_percent: 40 + Math.random() * 30,
      data_source: i % 2 === 0 ? "eDNA-Sample" : "Satellite",
      confidence_level: 0.8 + Math.random() * 0.15,
      notes: null,
      created_at: date.toISOString(),
    });
  }

  return metrics;
};

interface UseRegenerativeMetricsOptions {
  days?: number;
}

export const useRegenerativeMetrics = (projectId: string | undefined, options?: UseRegenerativeMetricsOptions) => {
  const days = options?.days ?? 30;

  const query = useQuery<RegenerativeMetrics[]>({
    queryKey: ["regenerative-metrics", projectId, days],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return [];
      await new Promise((resolve) => setTimeout(resolve, 300));
      return generateMockMetrics(projectId, days);
    },
  });

  // Compute trend from latest measurements
  const trend: RegenerativeMetricsTrend | null = query.data
    ? {
        microbiome_trend_30d: computeTrend(query.data.slice(0, 30).map((m) => m.soil_microbiome_health)),
        biodiversity_trend_30d: computeTrend(query.data.slice(0, 30).map((m) => m.biodiversity_index)),
        crop_diversity_trend_30d: computeTrend(query.data.slice(0, 30).map((m) => m.crop_diversity_index)),
        pollinator_trend_30d: computeTrend(query.data.slice(0, 30).map((m) => m.pollinator_count)),
        latest_scores: query.data[0] || null,
        health_status: computeHealthStatus(query.data[0]),
      }
    : null;

  return {
    data: query.data || [],
    trend,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// Additional exported hooks
export const useSoilHealthScore = (projectId: string | undefined) => {
  const { data } = useRegenerativeMetrics(projectId, { days: 7 });
  const latest = data?.[0];
  
  return {
    data: latest ? {
      score: latest.soil_microbiome_health || 0,
      level: (latest.soil_microbiome_health || 0) >= 80 ? "excellent" : 
             (latest.soil_microbiome_health || 0) >= 60 ? "good" : 
             (latest.soil_microbiome_health || 0) >= 40 ? "fair" : "poor",
      recommendations: [
        "Increase cover crop diversity",
        "Reduce tillage frequency",
        "Add organic matter amendments",
      ],
    } : null,
  };
};

export const useBiodiversityIndex = (projectId: string | undefined) => {
  const { data } = useRegenerativeMetrics(projectId, { days: 7 });
  const latest = data?.[0];
  
  return {
    data: latest ? {
      index: latest.biodiversity_index || 0,
      status: (latest.biodiversity_index || 0) >= 80 ? "high" : 
              (latest.biodiversity_index || 0) >= 50 ? "moderate" : "low",
      species_estimate: latest.native_species_count || 0,
      pollinator_presence: (latest.pollinator_count || 0) > 30,
      conservation_priority: (latest.biodiversity_index || 0) >= 85,
    } : null,
  };
};

export const useCropDiversityMetrics = (projectId: string | undefined) => {
  const { data } = useRegenerativeMetrics(projectId, { days: 7 });
  const latest = data?.[0];
  
  return {
    data: latest ? {
      diversity_index: latest.crop_diversity_index || 0,
      diversity_level: (latest.crop_diversity_index || 0) >= 70 ? "high" : 
                       (latest.crop_diversity_index || 0) >= 40 ? "moderate" : "low",
      crop_count: latest.crop_types_count || 0,
      is_monoculture: (latest.crop_types_count || 0) <= 2,
    } : null,
  };
};

export const useRegenerativeMetricsTrend = (projectId: string | undefined) => {
  const { trend } = useRegenerativeMetrics(projectId, { days: 30 });
  return { data: trend };
};

// Helper to compute trend (percentage change)
function computeTrend(values: (number | null | undefined)[]): number | null {
  const filtered = values.filter((v): v is number => v != null);
  if (filtered.length < 2) return null;

  const newest = filtered[0];
  const oldest = filtered[filtered.length - 1];

  if (oldest === 0) return null;
  return ((newest - oldest) / oldest) * 100;
}

// Helper to compute health status
function computeHealthStatus(metrics: RegenerativeMetrics | null | undefined): "excellent" | "good" | "fair" | "poor" {
  if (!metrics) return "fair";

  const avgScore =
    ((metrics.soil_microbiome_health || 0) +
      (metrics.biodiversity_index || 0) +
      (metrics.crop_diversity_index || 0)) /
    3;

  if (avgScore >= 80) return "excellent";
  if (avgScore >= 60) return "good";
  if (avgScore >= 40) return "fair";
  return "poor";
}

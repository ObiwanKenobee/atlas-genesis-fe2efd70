import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RegenerativeMetrics, RegenerativeMetricsTrend } from "@/types/marketplace";

export const useRegenerativeMetrics = (projectId: string | undefined) => {
  const query = useQuery<RegenerativeMetrics[]>({
    queryKey: ["regenerative-metrics", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("regenerative_metrics")
        .select("*")
        .eq("project_id", projectId)
        .order("measurement_date", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching regenerative metrics:", error);
        throw error;
      }

      return (data || []) as RegenerativeMetrics[];
    },
  });

  // Compute trend from latest measurements
  const trend: RegenerativeMetricsTrend | null = query.data
    ? {
        microbiome_trend_30d: computeTrend(
          query.data.slice(0, 30).map((m) => m.soil_microbiome_health)
        ),
        biodiversity_trend_30d: computeTrend(
          query.data.slice(0, 30).map((m) => m.biodiversity_index)
        ),
        crop_diversity_trend_30d: computeTrend(
          query.data.slice(0, 30).map((m) => m.crop_diversity_index)
        ),
        pollinator_trend_30d: computeTrend(
          query.data.slice(0, 30).map((m) => m.pollinator_count)
        ),
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
    (metrics.soil_microbiome_health || 0 +
      metrics.biodiversity_index || 0 +
      metrics.crop_diversity_index || 0) /
    3;

  if (avgScore >= 80) return "excellent";
  if (avgScore >= 60) return "good";
  if (avgScore >= 40) return "fair";
  return "poor";
}

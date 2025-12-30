import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeasurementData, MeasurementSummary } from "@/types/marketplace";

export const useMeasurementData = (projectId: string | undefined) => {
  const query = useQuery<MeasurementData[]>({
    queryKey: ["measurements", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("measurement_data")
        .select("*")
        .eq("project_id", projectId)
        .order("measurement_date", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching measurements:", error);
        throw error;
      }

      return (data || []) as MeasurementData[];
    },
  });

  // Compute summary from latest measurements
  const summary: MeasurementSummary | null = query.data
    ? {
        latest: query.data[0] || null,
        average_co2_7d: computeAverage(query.data.slice(0, 7).map((m) => m.co2_level)),
        average_ndvi_7d: computeAverage(query.data.slice(0, 7).map((m) => m.ndvi_index)),
        anomalies_count: query.data.filter((m) => m.anomaly_flag).length,
        confidence_trend: computeConfidenceTrend(query.data.slice(0, 7)),
        last_updated: query.data[0]?.measurement_date || new Date().toISOString(),
      }
    : null;

  return {
    data: query.data || [],
    summary,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// Helper to compute average of optional numbers
function computeAverage(values: (number | null | undefined)[]): number | null {
  const filtered = values.filter((v): v is number => v != null);
  if (filtered.length === 0) return null;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

// Helper to determine confidence trend
function computeConfidenceTrend(recent: MeasurementData[]): "improving" | "stable" | "declining" {
  if (recent.length < 2) return "stable";

  const firstHalf = recent.slice(0, Math.ceil(recent.length / 2));
  const secondHalf = recent.slice(Math.ceil(recent.length / 2));

  const avg1 = firstHalf.reduce((sum, m) => sum + m.confidence_level, 0) / firstHalf.length;
  const avg2 = secondHalf.reduce((sum, m) => sum + m.confidence_level, 0) / secondHalf.length;

  const diff = avg2 - avg1;
  if (diff > 0.05) return "improving";
  if (diff < -0.05) return "declining";
  return "stable";
}

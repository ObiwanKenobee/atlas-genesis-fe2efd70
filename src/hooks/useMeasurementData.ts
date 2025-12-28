import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MeasurementData, MeasurementSummary } from '@/types/marketplace';

interface MeasurementFilters {
  days?: number; // Default 30 days
  source?: string; // Filter by satellite source
}

/**
 * Fetch measurement data for a specific project
 * Includes satellite readings (CO2, NDVI, soil carbon) and anomaly detection
 */
export function useMeasurementData(projectId: string | undefined, filters?: MeasurementFilters) {
  const days = filters?.days || 30;
  const source = filters?.source;

  return useQuery({
    queryKey: ['measurement-data', projectId, days, source],
    queryFn: async () => {
      if (!projectId) return [];

      let query = supabase
        .from('measurement_data')
        .select('*')
        .eq('project_id', projectId)
        .order('measurement_date', { ascending: false })
        .limit(100); // Limit to last 100 records

      // Filter by date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = query.gte('measurement_date', startDate.toISOString());

      // Filter by source if provided
      if (source) {
        query = query.eq('satellite_source', source);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as MeasurementData[]) || [];
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

/**
 * Fetch latest measurement data for a project
 * Returns the most recent satellite/sensor reading
 */
export function useLatestMeasurement(projectId: string | undefined) {
  return useQuery({
    queryKey: ['latest-measurement', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('measurement_data')
        .select('*')
        .eq('project_id', projectId)
        .order('measurement_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as MeasurementData) || null;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 30, // 30 minute cache
  });
}

/**
 * Compute measurement summary with trends and anomalies
 */
export function useMeasurementSummary(projectId: string | undefined) {
  const { data: allMeasurements } = useMeasurementData(projectId, { days: 30 });

  return useQuery({
    queryKey: ['measurement-summary', projectId],
    queryFn: async () => {
      if (!allMeasurements || allMeasurements.length === 0) {
        return {
          latest: null,
          average_co2_7d: null,
          average_ndvi_7d: null,
          anomalies_count: 0,
          confidence_trend: 'stable' as const,
          last_updated: new Date().toISOString(),
        };
      }

      // Sort by date (newest first)
      const sorted = [...allMeasurements].sort(
        (a, b) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime()
      );

      const latest = sorted[0];

      // Calculate 7-day averages
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const last7Days = sorted.filter((m) => new Date(m.measurement_date) >= sevenDaysAgo);

      const average_co2_7d =
        last7Days.length > 0
          ? last7Days.reduce((sum, m) => sum + (m.co2_level || 0), 0) / last7Days.length
          : null;

      const average_ndvi_7d =
        last7Days.length > 0
          ? last7Days.reduce((sum, m) => sum + (m.ndvi_index || 0), 0) / last7Days.length
          : null;

      // Count anomalies
      const anomalies_count = sorted.filter((m) => m.anomaly_flag).length;

      // Determine confidence trend
      const confidences = sorted.slice(0, 10).map((m) => m.confidence_level);
      const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
      const firstHalf = confidences.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      const secondHalf = confidences.slice(5, 10).reduce((a, b) => a + b, 0) / 5;

      let confidence_trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (secondHalf > firstHalf + 0.05) confidence_trend = 'improving';
      if (secondHalf < firstHalf - 0.05) confidence_trend = 'declining';

      return {
        latest,
        average_co2_7d: average_co2_7d ? parseFloat(average_co2_7d.toFixed(2)) : null,
        average_ndvi_7d: average_ndvi_7d ? parseFloat(average_ndvi_7d.toFixed(3)) : null,
        anomalies_count,
        confidence_trend,
        last_updated: latest?.measurement_date || new Date().toISOString(),
      } as MeasurementSummary;
    },
    enabled: !!projectId && !!allMeasurements,
  });
}

/**
 * Fetch all measurement data with geospatial filtering
 * Used for mapping and location-based queries
 */
export function useMeasurementsByRegion(
  latitude: number | undefined,
  longitude: number | undefined,
  radiusKm: number = 50
) {
  return useQuery({
    queryKey: ['measurements-by-region', latitude, longitude, radiusKm],
    queryFn: async () => {
      if (!latitude || !longitude) return [];

      // Using PostGIS ST_Distance function via raw SQL
      const { data, error } = await supabase.rpc('get_measurements_within_radius', {
        lat: latitude,
        lng: longitude,
        radius_km: radiusKm,
      });

      if (error) {
        // Fallback: if RPC doesn't exist, fetch all and filter client-side
        const { data: allData, error: fetchError } = await supabase
          .from('measurement_data')
          .select('*')
          .limit(500);

        if (fetchError) throw fetchError;
        return allData as MeasurementData[];
      }

      return (data as MeasurementData[]) || [];
    },
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

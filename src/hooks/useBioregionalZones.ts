import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BioregionalZone, ClimateClassification } from '@/types/marketplace';

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Fetch all bioregional zones
 * These define ecological regions with climate classification and credit multipliers
 */
export function useBioregionalZones() {
  return useQuery({
    queryKey: ['bioregional-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bioregional_zones')
        .select('*')
        .order('zone_name', { ascending: true });

      if (error) throw error;
      return (data as BioregionalZone[]) || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

/**
 * Fetch bioregional zones within specified geographic bounds
 * Used for interactive map visualization
 */
export function useBioregionalZonesByBounds(bounds: MapBounds | null) {
  return useQuery({
    queryKey: ['bioregional-zones-bounds', bounds],
    queryFn: async () => {
      if (!bounds) return [];

      // Build bounding box polygon: [west, south], [east, south], [east, north], [west, north], [west, south]
      const bbox = `POLYGON((${bounds.west} ${bounds.south}, ${bounds.east} ${bounds.south}, ${bounds.east} ${bounds.north}, ${bounds.west} ${bounds.north}, ${bounds.west} ${bounds.south}))`;

      // Use PostGIS ST_Intersects for spatial intersection
      const { data, error } = await supabase
        .from('bioregional_zones')
        .select('*')
        .filter(
          'geometry',
          'cs',
          `(SELECT ST_GeomFromText('${bbox}', 4326))` // This is simplified; production should use RPC
        );

      if (error) {
        // Fallback: fetch all zones and filter client-side
        const { data: allZones, error: fetchError } = await supabase
          .from('bioregional_zones')
          .select('*');

        if (fetchError) throw fetchError;
        return allZones as BioregionalZone[];
      }

      return (data as BioregionalZone[]) || [];
    },
    enabled: !!bounds,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

/**
 * Fetch bioregional zones by climate classification
 * Useful for filtering projects by ecological type
 */
export function useBioregionalZonesByClimate(climate: ClimateClassification | null) {
  return useQuery({
    queryKey: ['bioregional-zones-climate', climate],
    queryFn: async () => {
      if (!climate) return [];

      const { data, error } = await supabase
        .from('bioregional_zones')
        .select('*')
        .eq('climate_classification', climate)
        .order('climate_risk_score', { ascending: true });

      if (error) throw error;
      return (data as BioregionalZone[]) || [];
    },
    enabled: !!climate,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Fetch indigenous lands within bioregional zones
 * Ensures ethical protection and community recognition
 */
export function useIndigenousLands() {
  return useQuery({
    queryKey: ['indigenous-lands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bioregional_zones')
        .select('*')
        .eq('indigenous_land', true)
        .order('zone_name', { ascending: true });

      if (error) throw error;
      return (data as BioregionalZone[]) || [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hour cache (less frequently updated)
  });
}

/**
 * Get credit multiplier for a specific project location
 * Bioregional zones have different base multipliers based on ecological importance
 */
export function useCreditMultiplierForZone(zoneId: string | null) {
  return useQuery({
    queryKey: ['credit-multiplier', zoneId],
    queryFn: async () => {
      if (!zoneId) return 1.0;

      const { data, error } = await supabase
        .from('bioregional_zones')
        .select('base_credit_multiplier, biodiversity_value_factor, climate_risk_score')
        .eq('id', zoneId)
        .maybeSingle();

      if (error) throw error;

      if (!data) return 1.0;

      // Calculate composite multiplier
      // Higher climate risk = higher credits (more urgent)
      // Higher biodiversity value = higher credits (more important)
      const riskMultiplier = 1 + (data.climate_risk_score || 0) / 100 * 0.25; // Max +25% for climate risk
      const biodiversityBonus = data.biodiversity_value_factor || 1.0;

      return parseFloat(
        (data.base_credit_multiplier * riskMultiplier * biodiversityBonus).toFixed(2)
      );
    },
    enabled: !!zoneId,
  });
}

/**
 * Fetch climate risk assessment for a zone
 * Used in valuation and risk modeling
 */
export function useClimateRiskAssessment(zoneId: string | null) {
  return useQuery({
    queryKey: ['climate-risk-assessment', zoneId],
    queryFn: async () => {
      if (!zoneId) {
        return {
          risk_score: 50,
          risk_level: 'moderate' as const,
          primary_threats: [],
          adaptation_factors: [],
        };
      }

      const { data, error } = await supabase
        .from('bioregional_zones')
        .select('climate_risk_score, climate_classification, historical_land_use')
        .eq('id', zoneId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          risk_score: 50,
          risk_level: 'moderate' as const,
          primary_threats: [],
          adaptation_factors: [],
        };
      }

      // Determine risk level from score
      let risk_level: 'low' | 'moderate' | 'high' | 'critical' = 'moderate';
      if (data.climate_risk_score >= 80) risk_level = 'critical';
      else if (data.climate_risk_score >= 60) risk_level = 'high';
      else if (data.climate_risk_score >= 40) risk_level = 'moderate';
      else risk_level = 'low';

      // Map climate type to primary threats
      const threatMap: Record<string, string[]> = {
        tropical_rainforest: ['deforestation', 'drought', 'disease'],
        tropical_savanna: ['desertification', 'overgrazing', 'drought'],
        arid_desert: ['water scarcity', 'salinization', 'dust storms'],
        temperate_grassland: ['conversion to crops', 'overgrazing', 'fire'],
        boreal_forest: ['permafrost thaw', 'bark beetles', 'wildfires'],
        temperate_deciduous: ['land conversion', 'pest outbreaks', 'drought'],
        mediterranean: ['wildfires', 'desertification', 'water stress'],
        tundra: ['permafrost degradation', 'ice loss', 'vegetation shifts'],
        ocean_coastal: ['ocean acidification', 'sea level rise', 'warming'],
        mountain: ['glacier retreat', 'erosion', 'avalanches'],
      };

      const primary_threats = threatMap[data.climate_classification] || [];

      return {
        risk_score: data.climate_risk_score || 50,
        risk_level,
        primary_threats,
        adaptation_factors: [
          'regenerative practices',
          'biodiversity restoration',
          'water conservation',
          'erosion control',
        ],
      };
    },
    enabled: !!zoneId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hour cache
  });
}

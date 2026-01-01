import { useQuery } from "@tanstack/react-query";
import { BioregionalZone } from "@/types/marketplace";

// Mock bioregional zones data since the table doesn't exist yet
const mockBioregionalZones: BioregionalZone[] = [
  {
    id: "zone-1",
    zone_name: "Amazon Basin",
    geometry: null,
    climate_classification: "tropical_rainforest",
    historical_land_use: "Primary rainforest with selective logging history",
    indigenous_land: true,
    indigenous_community_name: "Yanomami",
    base_credit_multiplier: 2.5,
    climate_risk_score: 65,
    biodiversity_value_factor: 1.8,
    region_country: "Brazil",
    region_area_km2: 5500000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "zone-2",
    zone_name: "Congo Rainforest",
    geometry: null,
    climate_classification: "tropical_rainforest",
    historical_land_use: "Protected forest reserve",
    indigenous_land: true,
    indigenous_community_name: "Mbuti",
    base_credit_multiplier: 2.3,
    climate_risk_score: 55,
    biodiversity_value_factor: 1.7,
    region_country: "Democratic Republic of Congo",
    region_area_km2: 2000000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "zone-3",
    zone_name: "Borneo Highlands",
    geometry: null,
    climate_classification: "tropical_rainforest",
    historical_land_use: "Mixed forest and palm plantations",
    indigenous_land: true,
    indigenous_community_name: "Dayak",
    base_credit_multiplier: 2.0,
    climate_risk_score: 72,
    biodiversity_value_factor: 1.6,
    region_country: "Indonesia/Malaysia",
    region_area_km2: 743330,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "zone-4",
    zone_name: "Great Barrier Reef",
    geometry: null,
    climate_classification: "ocean_coastal",
    historical_land_use: "Marine protected area",
    indigenous_land: false,
    indigenous_community_name: null,
    base_credit_multiplier: 1.8,
    climate_risk_score: 85,
    biodiversity_value_factor: 2.0,
    region_country: "Australia",
    region_area_km2: 344400,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const useBioregionalZones = (zoneIds?: string[] | undefined) => {
  const query = useQuery<BioregionalZone[]>({
    queryKey: ["bioregional-zones", zoneIds],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      if (zoneIds && zoneIds.length > 0) {
        return mockBioregionalZones.filter((z) => zoneIds.includes(z.id));
      }
      return mockBioregionalZones;
    },
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useBioregionalZoneByCoordinates = (latitude: number | null, longitude: number | null) => {
  const query = useQuery<BioregionalZone | null>({
    queryKey: ["bioregional-zone-location", latitude, longitude],
    enabled: latitude != null && longitude != null,
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      // Return the first mock zone as a placeholder
      return mockBioregionalZones[0];
    },
  });

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// Additional hooks for the BiogregionalMapComponent
export const useClimateRiskAssessment = (zoneId?: string) => {
  return useQuery({
    queryKey: ["climate-risk", zoneId],
    enabled: !!zoneId,
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return {
        risk_level: "moderate",
        score: 65,
        factors: ["Deforestation pressure", "Climate variability"],
      };
    },
  });
};

export const useIndigenousLands = () => {
  return {
    data: mockBioregionalZones.filter((z) => z.indigenous_land),
    isLoading: false,
  };
};

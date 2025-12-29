import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BioregionalZone } from "@/types/marketplace";

export const useBioregionalZones = (zoneIds: string[] | undefined) => {
  const query = useQuery<BioregionalZone[]>({
    queryKey: ["bioregional-zones", zoneIds],
    enabled: !!(zoneIds && zoneIds.length > 0),
    queryFn: async () => {
      if (!zoneIds || zoneIds.length === 0) return [];

      const { data, error } = await supabase
        .from("bioregional_zones")
        .select("*")
        .in("id", zoneIds);

      if (error) {
        console.error("Error fetching bioregional zones:", error);
        throw error;
      }

      return (data || []) as BioregionalZone[];
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
      if (latitude == null || longitude == null) return null;

      // Use PostGIS to find the zone containing the point
      const { data, error } = await supabase.rpc("find_bioregional_zone", {
        point_longitude: longitude,
        point_latitude: latitude,
      });

      if (error) {
        console.error("Error fetching bioregional zone by coordinates:", error);
        // Return null instead of throwing to handle cases where no zone exists
        return null;
      }

      return (data?.[0] || null) as BioregionalZone | null;
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

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BioregionalZone, CLIMATE_LABELS, ClimateClassification } from "@/types/marketplace";
import { MapPin, Shield, AlertTriangle, Globe, BarChart3 } from "lucide-react";

interface BioregionalMapProps {
  zones: BioregionalZone[];
  selectedZone?: BioregionalZone;
  onSelectZone?: (zone: BioregionalZone) => void;
  isLoading?: boolean;
}

const CLIMATE_COLORS: Record<ClimateClassification, string> = {
  tropical_rainforest: "bg-emerald-700",
  tropical_savanna: "bg-amber-700",
  arid_desert: "bg-yellow-600",
  temperate_grassland: "bg-lime-600",
  boreal_forest: "bg-slate-600",
  temperate_deciduous: "bg-orange-600",
  mediterranean: "bg-orange-500",
  tundra: "bg-blue-400",
  ocean_coastal: "bg-blue-600",
  mountain: "bg-gray-700",
};

export const BioregionalMap: React.FC<BioregionalMapProps> = ({
  zones = [],
  selectedZone,
  onSelectZone,
  isLoading = false,
}) => {
  // Simple statistical summary of zones
  const zoneStats = useMemo(() => {
    return {
      total_area: zones.reduce((sum, z) => sum + (z.region_area_km2 || 0), 0),
      avg_climate_risk: zones.reduce((sum, z) => sum + z.climate_risk_score, 0) / zones.length,
      indigenous_zones: zones.filter((z) => z.indigenous_land).length,
      avg_biodiversity_value: zones.reduce((sum, z) => sum + z.biodiversity_value_factor, 0) / zones.length,
    };
  }, [zones]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bioregional Intelligence Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-b from-slate-200 to-slate-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Total Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(zoneStats.total_area / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground">km²</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Climate Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{zoneStats.avg_climate_risk.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Indigenous Lands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{zoneStats.indigenous_zones}</p>
            <p className="text-xs text-muted-foreground">Protected Zones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Biodiversity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{zoneStats.avg_biodiversity_value.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Value Factor</p>
          </CardContent>
        </Card>
      </div>

      {/* Map Container (Placeholder - real implementation would use Mapbox/Leaflet) */}
      <Card>
        <CardHeader>
          <CardTitle>Bioregional Zone Map</CardTitle>
          <CardDescription>Interactive PostGIS-powered geospatial visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 bg-gradient-to-br from-blue-50 via-emerald-50 to-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-semibold">Bioregional Map</p>
              <p className="text-sm text-muted-foreground">Powered by PostGIS & Mapbox</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Details List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Bioregional Zones</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {zones.map((zone) => (
            <Card
              key={zone.id}
              className={`cursor-pointer transition-all ${selectedZone?.id === zone.id ? "ring-2 ring-primary" : "hover:shadow-lg"}`}
              onClick={() => onSelectZone?.(zone)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{zone.zone_name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{zone.region_country}</CardDescription>
                  </div>
                  <div className={`${CLIMATE_COLORS[zone.climate_classification]} rounded-full p-2`}>
                    <Globe className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Climate Classification */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Climate Type</span>
                    <Badge variant="outline">{CLIMATE_LABELS[zone.climate_classification]}</Badge>
                  </div>
                </div>

                {/* Area */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Area</span>
                  <span className="font-semibold">{zone.region_area_km2?.toLocaleString() || "—"} km²</span>
                </div>

                {/* Climate Risk Score */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-orange-700">Climate Risk</span>
                    <span className="text-xs font-bold text-orange-700">{zone.climate_risk_score.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((zone.climate_risk_score / 100) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Biodiversity Value Factor */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-emerald-700">Biodiversity Value</span>
                    <span className="text-xs font-bold text-emerald-700">{zone.biodiversity_value_factor.toFixed(2)}x</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(zone.biodiversity_value_factor * 20, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Base Credit Multiplier */}
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Credit Multiplier</span>
                  <span className="font-bold text-purple-600">{zone.base_credit_multiplier.toFixed(2)}x</span>
                </div>

                {/* Indigenous Land Badge */}
                {zone.indigenous_land && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-amber-900">Indigenous Land</p>
                        <p className="text-xs text-amber-700">{zone.indigenous_community_name || "Protected territory"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Historical Land Use */}
                {zone.historical_land_use && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 mb-1">Historical Land Use</p>
                    <p className="text-xs text-blue-600">{zone.historical_land_use}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Zone Details Panel */}
      {selectedZone && (
        <Card className="border-2 border-primary bg-gradient-to-br from-slate-50 to-blue-50">
          <CardHeader>
            <CardTitle>Selected Zone Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Zone Name</h4>
                  <p className="text-lg font-bold">{selectedZone.zone_name}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Country</h4>
                  <p className="text-lg font-bold">{selectedZone.region_country || "Unknown"}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Climate Classification</h4>
                  <p className="text-lg">{CLIMATE_LABELS[selectedZone.climate_classification]}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Area</h4>
                  <p className="text-lg font-bold">{selectedZone.region_area_km2?.toLocaleString() || "N/A"} km²</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Climate Risk Score</h4>
                  <p className="text-lg font-bold text-orange-600">{selectedZone.climate_risk_score.toFixed(2)}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Base Credit Multiplier</h4>
                  <p className="text-lg font-bold text-purple-600">{selectedZone.base_credit_multiplier.toFixed(2)}x</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BioregionalMap;

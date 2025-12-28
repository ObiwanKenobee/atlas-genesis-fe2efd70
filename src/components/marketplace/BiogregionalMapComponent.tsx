import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Shield, Info, MapPin, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBioregionalZones, useClimateRiskAssessment, useIndigenousLands } from '@/hooks/useBioregionalZones';
import { BioregionalZone, CLIMATE_LABELS } from '@/types/marketplace';

interface BiogregionalMapComponentProps {
  projectId?: string;
  selectedZoneId?: string;
  onZoneSelect?: (zoneId: string) => void;
}

/**
 * Simple map visualization component
 * Shows bioregional zones with climate risk color coding
 * Note: This is a simplified implementation. For production, use Leaflet.js or Mapbox GL
 */
export function BiogregionalMapComponent({
  projectId,
  selectedZoneId,
  onZoneSelect,
}: BiogregionalMapComponentProps) {
  const { data: zones, isLoading } = useBioregionalZones();
  const { data: indigenousLands } = useIndigenousLands();
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<BioregionalZone | null>(null);
  const [mapView, setMapView] = useState<'climate-risk' | 'indigenous' | 'multiplier'>('climate-risk');

  if (isLoading || !zones) {
    return (
      <Card className="bg-card-gradient border-border/50">
        <CardHeader>
          <CardTitle>Bioregional Intelligence</CardTitle>
          <CardDescription>Geographic zones and climate risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleZoneSelect = (zone: BioregionalZone) => {
    setSelectedZone(selectedZone?.id === zone.id ? null : zone);
    if (onZoneSelect) {
      onZoneSelect(zone.id);
    }
  };

  // Get color for climate risk
  const getClimateRiskColor = (risk: number): string => {
    if (risk >= 80) return 'bg-red-500/30';
    if (risk >= 60) return 'bg-orange-500/30';
    if (risk >= 40) return 'bg-yellow-500/30';
    return 'bg-green-500/30';
  };

  const getRiskBadgeColor = (risk: number): string => {
    if (risk >= 80) return 'bg-red-500/20 text-red-700 border-red-300';
    if (risk >= 60) return 'bg-orange-500/20 text-orange-700 border-orange-300';
    if (risk >= 40) return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
    return 'bg-green-500/20 text-green-700 border-green-300';
  };

  const getMultiplierColor = (multiplier: number): string => {
    if (multiplier >= 2.0) return 'bg-purple-500/30';
    if (multiplier >= 1.5) return 'bg-blue-500/30';
    if (multiplier >= 1.0) return 'bg-cyan-500/30';
    return 'bg-gray-500/30';
  };

  return (
    <Card className="bg-card-gradient border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Bioregional Intelligence</CardTitle>
            <CardDescription>Geographic zones with climate risk & ecological multipliers</CardDescription>
          </div>
          <Info className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* View Toggle */}
        <div className="flex gap-2 border-b border-border">
          {(['climate-risk', 'indigenous', 'multiplier'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setMapView(view)}
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                mapView === view
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {view === 'climate-risk' ? '🌡️ Climate Risk' : view === 'indigenous' ? '🏠 Indigenous Lands' : '⚖️ Multipliers'}
            </button>
          ))}
        </div>

        {/* Zone List / Grid */}
        <div className="space-y-3">
          {mapView === 'climate-risk' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-2 py-1 bg-muted/30 rounded">
                <span>Climate Risk Scale</span>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Critical (80+)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>Moderate (40-60)</span>
                  </div>
                </div>
              </div>

              {zones.map((zone, i) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleZoneSelect(zone)}
                  onMouseEnter={() => setHoveredZoneId(zone.id)}
                  onMouseLeave={() => setHoveredZoneId(null)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    hoveredZoneId === zone.id
                      ? 'border-primary/50 shadow-lg'
                      : selectedZone?.id === zone.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border/30'
                  } ${getClimateRiskColor(zone.climate_risk_score || 0)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{zone.zone_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {zone.region_country}
                        {zone.indigenous_land && ' • 🏠 Indigenous Land'}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getRiskBadgeColor(zone.climate_risk_score || 0)} text-xs`}
                    >
                      {zone.climate_risk_score?.toFixed(0) || 0}% Risk
                    </Badge>
                  </div>

                  {/* Expanded Details */}
                  {selectedZone?.id === zone.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 pt-3 border-t border-border/30 space-y-2"
                    >
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground mb-1">Climate</p>
                          <p className="font-medium text-foreground">
                            {CLIMATE_LABELS[zone.climate_classification]}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Credit Multiplier</p>
                          <p className="font-medium text-foreground">
                            {zone.base_credit_multiplier.toFixed(2)}×
                          </p>
                        </div>
                        {zone.region_area_km2 && (
                          <div>
                            <p className="text-muted-foreground mb-1">Area</p>
                            <p className="font-medium text-foreground">
                              {zone.region_area_km2.toLocaleString()} km²
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground mb-1">Biodiversity Factor</p>
                          <p className="font-medium text-foreground">
                            {zone.biodiversity_value_factor.toFixed(2)}×
                          </p>
                        </div>
                      </div>

                      {zone.historical_land_use && (
                        <div className="pt-2 border-t border-border/30">
                          <p className="text-xs font-medium text-foreground mb-1">Historical Use</p>
                          <p className="text-xs text-muted-foreground">{zone.historical_land_use}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {mapView === 'indigenous' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-2 py-1 bg-muted/30 rounded">
                <span>Indigenous Land Recognition</span>
                <Badge variant="outline" className="text-xs">
                  {indigenousLands.length} protected zone{indigenousLands.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {indigenousLands.length > 0 ? (
                indigenousLands.map((zone, i) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-lg border-2 border-green-300/50 bg-green-500/10"
                  >
                    <div className="flex items-start gap-3">
                      <Leaf className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground">{zone.zone_name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>Indigenous Community:</strong> {zone.indigenous_community_name || 'Recognized'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {zone.historical_land_use && `Traditional use: ${zone.historical_land_use}`}
                        </p>
                      </div>
                      <Badge className="bg-green-600 text-white text-xs">Protected</Badge>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-lg">
                  No indigenous land zones mapped
                </div>
              )}
            </div>
          )}

          {mapView === 'multiplier' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-2 py-1 bg-muted/30 rounded">
                <span>Credit Price Multiplier</span>
                <div className="flex gap-3 text-xs">
                  <span>Low (0.5x)</span>
                  <span>High (2.5x+)</span>
                </div>
              </div>

              {zones.map((zone, i) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    hoveredZoneId === zone.id
                      ? 'border-primary/50 shadow-lg'
                      : 'border-border/30'
                  } ${getMultiplierColor(zone.base_credit_multiplier)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{zone.zone_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {CLIMATE_LABELS[zone.climate_classification]}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {zone.base_credit_multiplier.toFixed(2)}×
                      </div>
                      <p className="text-xs text-muted-foreground">multiplier</p>
                    </div>
                  </div>

                  {/* Multiplier Breakdown */}
                  <div className="mt-3 pt-3 border-t border-border/30 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Rate</span>
                      <span className="font-medium text-foreground">{zone.base_credit_multiplier.toFixed(2)}×</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Climate Risk Adjustment</span>
                      <span className="font-medium text-foreground">
                        {(1 + (zone.climate_risk_score || 0) / 100 * 0.25).toFixed(2)}×
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Biodiversity Factor</span>
                      <span className="font-medium text-foreground">
                        {zone.biodiversity_value_factor.toFixed(2)}×
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-border/30">
                      <span className="text-foreground">Composite</span>
                      <span className="text-primary">
                        {(zone.base_credit_multiplier * (1 + (zone.climate_risk_score || 0) / 100 * 0.25) * zone.biodiversity_value_factor).toFixed(2)}×
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Legend/Info Box */}
        <div className="p-3 bg-blue-500/10 border border-blue-200 rounded text-xs text-blue-900 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Bioregional Pricing</p>
            <p>
              Credits are dynamically priced based on geographic zone, climate risk, and biodiversity importance. Higher-risk areas
              and high-biodiversity zones command premium prices to reflect their strategic importance.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

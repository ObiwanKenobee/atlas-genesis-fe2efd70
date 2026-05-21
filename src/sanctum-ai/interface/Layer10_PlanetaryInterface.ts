/**
 * Atlas Sanctum AI — Layer 10: Planetary Interface
 *
 * Implements:
 *   - Global dashboard metrics aggregator
 *   - Digital twin state manager
 *   - Geospatial visualization data builder
 *   - Simulation scenario runner
 *   - Real-time ecosystem monitoring feed
 */

import {
  DigitalTwinState, PlanetaryDashboardMetrics,
  SimulationScenario, CarbonRestorationPlan,
  LatLng, EpochMs,
  Result, ok, err, AIError,
} from '../AtlasSanctumAI.types';

// ─── Digital Twin Manager ─────────────────────────────────────────────────────

export class DigitalTwinManager {
  private twins = new Map<string, DigitalTwinState>();

  register(twin: DigitalTwinState): void {
    this.twins.set(twin.twinId, twin);
  }

  sync(twinId: string, realWorldState: Record<string, number>): Result<DigitalTwinState, AIError> {
    const twin = this.twins.get(twinId);
    if (!twin) return err(new AIError(`Twin ${twinId} not found`, 'NOT_FOUND', 'interface'));

    const divergenceScore = this.computeDivergence(twin.currentState, realWorldState);
    const updated: DigitalTwinState = {
      ...twin,
      currentState: realWorldState,
      lastSyncedAt: Date.now() as EpochMs,
      divergenceScore,
    };
    this.twins.set(twinId, updated);
    return ok(updated);
  }

  simulate(twinId: string, interventions: Record<string, number>): Result<DigitalTwinState, AIError> {
    const twin = this.twins.get(twinId);
    if (!twin) return err(new AIError(`Twin ${twinId} not found`, 'NOT_FOUND', 'interface'));

    const simulatedState = Object.fromEntries(
      Object.entries(twin.currentState).map(([k, v]) => [k, v + (interventions[k] ?? 0)])
    );
    const updated: DigitalTwinState = { ...twin, simulatedState };
    this.twins.set(twinId, updated);
    return ok(updated);
  }

  getHighDivergenceTwins(threshold = 0.2): DigitalTwinState[] {
    return [...this.twins.values()].filter(t => t.divergenceScore > threshold);
  }

  private computeDivergence(current: Record<string, number>, real: Record<string, number>): number {
    const keys = Object.keys(current);
    if (keys.length === 0) return 0;
    const totalDiff = keys.reduce((sum, k) => sum + Math.abs((current[k] ?? 0) - (real[k] ?? 0)), 0);
    return Math.min(1, totalDiff / keys.length);
  }
}

// ─── Planetary Dashboard Aggregator ──────────────────────────────────────────

export class PlanetaryDashboardAggregator {
  private snapshots: PlanetaryDashboardMetrics[] = [];

  record(metrics: PlanetaryDashboardMetrics): void {
    this.snapshots.push(metrics);
    if (this.snapshots.length > 8760) this.snapshots.shift(); // 1 year of hourly data
  }

  latest(): PlanetaryDashboardMetrics | undefined {
    return this.snapshots.at(-1);
  }

  trend(key: keyof PlanetaryDashboardMetrics, windowSize = 30): 'improving' | 'stable' | 'degrading' {
    if (this.snapshots.length < 2) return 'stable';
    const window = this.snapshots.slice(-windowSize);
    const first = window[0][key] as number;
    const last  = window.at(-1)![key] as number;
    const delta = (last - first) / Math.max(1, Math.abs(first));
    return delta > 0.02 ? 'improving' : delta < -0.02 ? 'degrading' : 'stable';
  }

  generateReport(): {
    summary: string;
    criticalAlerts: string[];
    positiveSignals: string[];
    recommendations: string[];
  } {
    const latest = this.latest();
    if (!latest) return { summary: 'No data', criticalAlerts: [], positiveSignals: [], recommendations: [] };

    const criticalAlerts: string[] = [];
    const positiveSignals: string[] = [];
    const recommendations: string[] = [];

    if (latest.globalCarbonBudgetRemaining < 300) {
      criticalAlerts.push(`⚠️ Carbon budget critically low: ${latest.globalCarbonBudgetRemaining.toFixed(0)} GtCO₂ remaining`);
      recommendations.push('Accelerate carbon removal projects');
    }
    if (latest.biodiversityIntactnessIndex < 70) {
      criticalAlerts.push(`⚠️ Biodiversity intactness below safe boundary: ${latest.biodiversityIntactnessIndex.toFixed(1)}`);
      recommendations.push('Expand protected area network');
    }
    if (latest.humanFlourishingIndex > 75) {
      positiveSignals.push(`✅ Human flourishing index: ${latest.humanFlourishingIndex.toFixed(1)}`);
    }
    if (latest.activeRestorationProjects > 1000) {
      positiveSignals.push(`✅ ${latest.activeRestorationProjects.toLocaleString()} active restoration projects`);
    }

    return {
      summary: `Planetary health snapshot at ${new Date(latest.timestamp).toISOString()}`,
      criticalAlerts,
      positiveSignals,
      recommendations,
    };
  }
}

// ─── Geospatial Visualization Builder ────────────────────────────────────────

export interface GeoLayer {
  layerId: string;
  type: 'heatmap' | 'choropleth' | 'point' | 'polygon' | 'flow';
  data: { location: LatLng; value: number; label?: string }[];
  colorScale: [string, string];  // [min color, max color]
  opacity: number;
}

export class GeospatialVisualizationBuilder {
  buildCarbonHeatmap(
    projects: { location: LatLng; sequestrationTonnes: number; name: string }[],
  ): GeoLayer {
    return {
      layerId: 'carbon-heatmap',
      type: 'heatmap',
      data: projects.map(p => ({ location: p.location, value: p.sequestrationTonnes, label: p.name })),
      colorScale: ['#ffffcc', '#006837'],
      opacity: 0.8,
    };
  }

  buildBiodiversityLayer(
    zones: { location: LatLng; intactnessIndex: number; biome: string }[],
  ): GeoLayer {
    return {
      layerId: 'biodiversity-choropleth',
      type: 'choropleth',
      data: zones.map(z => ({ location: z.location, value: z.intactnessIndex, label: z.biome })),
      colorScale: ['#d73027', '#1a9850'],
      opacity: 0.7,
    };
  }

  buildRiskLayer(
    assets: { location: LatLng; failureProbability: number; assetType: string }[],
  ): GeoLayer {
    return {
      layerId: 'infrastructure-risk',
      type: 'point',
      data: assets.map(a => ({ location: a.location, value: a.failureProbability, label: a.assetType })),
      colorScale: ['#fee08b', '#d73027'],
      opacity: 0.9,
    };
  }
}

// ─── Simulation Scenario Runner ───────────────────────────────────────────────

export class SimulationScenarioRunner {
  private scenarios = new Map<string, SimulationScenario>();

  register(scenario: SimulationScenario): void {
    this.scenarios.set(scenario.scenarioId, scenario);
  }

  run(scenarioId: string): Result<SimulationScenario, AIError> {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) return err(new AIError(`Scenario ${scenarioId} not found`, 'NOT_FOUND', 'interface'));

    // Simulate outcomes based on interventions
    const projectedOutcomes: Record<string, number> = {};
    const totalSeq = scenario.interventions.reduce((s, i) => s + i.estimatedSequestrationTonnes, 0);

    projectedOutcomes['carbonSequestrationTonnes'] = totalSeq * scenario.timeHorizonYears;
    projectedOutcomes['biodiversityGain'] = scenario.interventions.length * 0.05;
    projectedOutcomes['economicValue'] = totalSeq * 50 * scenario.timeHorizonYears;
    projectedOutcomes['communitiesImpacted'] = scenario.interventions.length * 12;

    const updated: SimulationScenario = {
      ...scenario,
      projectedOutcomes,
      confidenceInterval: [
        projectedOutcomes['carbonSequestrationTonnes'] * 0.8,
        projectedOutcomes['carbonSequestrationTonnes'] * 1.2,
      ],
    };
    this.scenarios.set(scenarioId, updated);
    return ok(updated);
  }

  compare(scenarioIds: string[]): Record<string, Record<string, number>> {
    return Object.fromEntries(
      scenarioIds.map(id => [id, this.scenarios.get(id)?.projectedOutcomes ?? {}])
    );
  }
}

// ─── Real-Time Ecosystem Monitor ─────────────────────────────────────────────

export interface EcosystemAlert {
  alertId: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  biomeId: string;
  message: string;
  timestamp: EpochMs;
  recommendedActions: string[];
}

export class RealTimeEcosystemMonitor {
  private alerts: EcosystemAlert[] = [];
  private subscribers: ((alert: EcosystemAlert) => void)[] = [];

  subscribe(handler: (alert: EcosystemAlert) => void): () => void {
    this.subscribers.push(handler);
    return () => { this.subscribers = this.subscribers.filter(s => s !== handler); };
  }

  emit(alert: EcosystemAlert): void {
    this.alerts.push(alert);
    this.subscribers.forEach(s => s(alert));
  }

  checkThresholds(biomeId: string, metrics: Record<string, number>): void {
    if ((metrics.ndvi ?? 1) < 0.2) {
      this.emit({
        alertId: `alert-${Date.now()}`,
        severity: 'critical',
        biomeId,
        message: `Critical vegetation loss in ${biomeId}: NDVI=${metrics.ndvi?.toFixed(3)}`,
        timestamp: Date.now() as EpochMs,
        recommendedActions: ['Deploy emergency reforestation team', 'Activate satellite monitoring', 'Notify governance council'],
      });
    }
    if ((metrics.fireRisk ?? 0) > 0.8) {
      this.emit({
        alertId: `alert-${Date.now()}`,
        severity: 'emergency',
        biomeId,
        message: `Extreme fire risk in ${biomeId}`,
        timestamp: Date.now() as EpochMs,
        recommendedActions: ['Coordinate with disaster response agent', 'Pre-position firefighting resources'],
      });
    }
  }

  getActiveAlerts(severity?: EcosystemAlert['severity']): EcosystemAlert[] {
    return severity ? this.alerts.filter(a => a.severity === severity) : this.alerts;
  }
}

// ─── Planetary Interface Layer ────────────────────────────────────────────────

export class PlanetaryInterfaceLayer {
  readonly twins       = new DigitalTwinManager();
  readonly dashboard   = new PlanetaryDashboardAggregator();
  readonly geo         = new GeospatialVisualizationBuilder();
  readonly simulation  = new SimulationScenarioRunner();
  readonly monitor     = new RealTimeEcosystemMonitor();

  initializePlanetaryTwins(): void {
    const biomes: DigitalTwinState[] = [
      { twinId: 'twin-amazon',       entityType: 'biome',      location: { lat: -3.47, lng: -62.22 }, currentState: { ndvi: 0.82, carbonStock: 150, speciesCount: 40000 }, lastSyncedAt: Date.now() as EpochMs, divergenceScore: 0 },
      { twinId: 'twin-great-barrier', entityType: 'ocean',     location: { lat: -18.29, lng: 147.70 }, currentState: { coralCover: 0.45, phLevel: 8.1, tempC: 27 }, lastSyncedAt: Date.now() as EpochMs, divergenceScore: 0 },
      { twinId: 'twin-sahel',        entityType: 'biome',      location: { lat: 13.5, lng: 2.1 },     currentState: { ndvi: 0.31, soilMoisture: 0.18, desertificationRisk: 0.6 }, lastSyncedAt: Date.now() as EpochMs, divergenceScore: 0 },
      { twinId: 'twin-arctic',       entityType: 'atmosphere', location: { lat: 80.0, lng: 0.0 },     currentState: { seaIceExtentKm2: 4_500_000, albedo: 0.6, tempC: -15 }, lastSyncedAt: Date.now() as EpochMs, divergenceScore: 0 },
    ];
    biomes.forEach(t => this.twins.register(t));
  }

  generatePlanetarySnapshot(): PlanetaryDashboardMetrics {
    const metrics: PlanetaryDashboardMetrics = {
      timestamp: Date.now() as EpochMs,
      globalCarbonBudgetRemaining: 380,
      biodiversityIntactnessIndex: 72.4,
      oceanHealthIndex: 68.1,
      freshwaterStressIndex: 0.42,
      humanFlourishingIndex: 71.3,
      activeRestorationProjects: 1247,
      totalRIUsCirculating: 24_500_000,
      agentsOnline: 12,
    };
    this.dashboard.record(metrics);
    return metrics;
  }
}

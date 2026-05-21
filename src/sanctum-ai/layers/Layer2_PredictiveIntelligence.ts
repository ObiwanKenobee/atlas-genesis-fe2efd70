/**
 * Atlas Sanctum AI — Layer 2: Predictive Intelligence
 *
 * Implements:
 *   - Bayesian belief network updates
 *   - Climate scenario forecasting engine
 *   - Infrastructure stress simulation
 *   - Multi-horizon risk analysis
 */

import {
  BayesianBelief, ClimateScenario, RiskAssessment,
  InfrastructureStressModel, LatLng,
  Result, ok, err, AIError, Confidence, EpochMs,
} from '../AtlasSanctumAI.types';

// ─── Bayesian Belief Network ──────────────────────────────────────────────────

export class BayesianNetwork {
  private beliefs = new Map<string, BayesianBelief>();

  observe(variable: string, likelihood: number, evidence: string[]): BayesianBelief {
    const existing = this.beliefs.get(variable);
    const prior = existing?.posterior ?? 0.5;

    // Bayes: P(H|E) ∝ P(E|H) * P(H)
    const unnormalized = likelihood * prior;
    const marginal = likelihood * prior + (1 - likelihood) * (1 - prior);
    const posterior = marginal > 0 ? unnormalized / marginal : prior;

    const belief: BayesianBelief = {
      variable,
      prior,
      likelihood,
      posterior: Math.max(0, Math.min(1, posterior)),
      evidence: [...(existing?.evidence ?? []), ...evidence],
    };
    this.beliefs.set(variable, belief);
    return belief;
  }

  query(variable: string): BayesianBelief | undefined {
    return this.beliefs.get(variable);
  }

  queryAll(): BayesianBelief[] {
    return [...this.beliefs.values()];
  }
}

// ─── Climate Forecasting Engine ───────────────────────────────────────────────

export class ClimateForecastingEngine {
  private readonly bayesian = new BayesianNetwork();

  /**
   * Generate multi-scenario climate projections for a location.
   * In production: integrates with CMIP6 model ensemble via Earth2Studio.
   */
  generateScenarios(location: LatLng, horizonYears: 5 | 10 | 25 | 50 | 100): ClimateScenario[] {
    const rcpProfiles: Record<string, { tempDelta: number; slr: number; biodiversityLoss: number }> = {
      '2.6': { tempDelta: 1.5,  slr: 200,  biodiversityLoss: 0.08 },
      '4.5': { tempDelta: 2.4,  slr: 400,  biodiversityLoss: 0.18 },
      '6.0': { tempDelta: 3.1,  slr: 600,  biodiversityLoss: 0.28 },
      '8.5': { tempDelta: 4.8,  slr: 1000, biodiversityLoss: 0.45 },
    };

    const latitudeFactor = 1 + Math.abs(location.lat) / 90 * 0.3;

    return (['2.6', '4.5', '6.0', '8.5'] as const).map(rcp => {
      const profile = rcpProfiles[rcp];
      const timeScale = horizonYears / 100;
      const belief = this.bayesian.observe(
        `climate-${rcp}`,
        rcp === '2.6' ? 0.35 : rcp === '4.5' ? 0.40 : rcp === '6.0' ? 0.15 : 0.10,
        [`location:${location.lat},${location.lng}`, `horizon:${horizonYears}y`]
      );

      return {
        id: `scenario-${rcp}-${horizonYears}y`,
        name: `RCP ${rcp} — ${horizonYears}-year projection`,
        rcp,
        horizon: horizonYears,
        temperatureDeltaC: profile.tempDelta * timeScale * latitudeFactor,
        precipitationDelta: (rcp === '2.6' ? -0.02 : rcp === '8.5' ? -0.12 : -0.06) * timeScale,
        seaLevelRiseMm: profile.slr * timeScale,
        biodiversityLoss: profile.biodiversityLoss * timeScale,
        confidence: belief.posterior as Confidence,
      };
    });
  }

  mostLikelyScenario(scenarios: ClimateScenario[]): ClimateScenario {
    return scenarios.reduce((best, s) => s.confidence > best.confidence ? s : best);
  }
}

// ─── Risk Analysis Engine ─────────────────────────────────────────────────────

export class RiskAnalysisEngine {
  assessPortfolio(
    location: LatLng,
    scenarios: ClimateScenario[],
    assets: InfrastructureStressModel[],
  ): RiskAssessment[] {
    const risks: RiskAssessment[] = [];
    const worstScenario = scenarios.reduce((w, s) => s.temperatureDeltaC > w.temperatureDeltaC ? s : w);

    // Climate risk
    risks.push({
      category: 'climate',
      severity: worstScenario.temperatureDeltaC > 3 ? 5 : worstScenario.temperatureDeltaC > 2 ? 4 : 3,
      probability: worstScenario.confidence,
      timeHorizonYears: worstScenario.horizon,
      mitigationOptions: [
        'Transition to renewable energy',
        'Implement nature-based solutions',
        'Strengthen early-warning systems',
      ],
      residualRisk: (worstScenario.confidence * 0.3) as Confidence,
    });

    // Infrastructure risk
    const criticalAssets = assets.filter(a => a.criticalityScore > 0.7);
    if (criticalAssets.length > 0) {
      const avgFailure = criticalAssets.reduce((s, a) => s + a.failureProbability, 0) / criticalAssets.length;
      risks.push({
        category: 'infrastructure',
        severity: avgFailure > 0.5 ? 5 : avgFailure > 0.3 ? 4 : 3,
        probability: avgFailure as Confidence,
        timeHorizonYears: 10,
        mitigationOptions: [
          'Redundancy hardening',
          'Climate-resilient retrofitting',
          'Distributed micro-grid deployment',
        ],
        residualRisk: (avgFailure * 0.4) as Confidence,
      });
    }

    // Ecological risk
    risks.push({
      category: 'ecological',
      severity: worstScenario.biodiversityLoss > 0.3 ? 5 : 4,
      probability: 0.75 as Confidence,
      timeHorizonYears: worstScenario.horizon,
      mitigationOptions: [
        'Establish wildlife corridors',
        'Expand marine protected areas',
        'Fund regenerative agriculture transition',
      ],
      residualRisk: 0.2 as Confidence,
    });

    return risks;
  }
}

// ─── Infrastructure Stress Simulator ─────────────────────────────────────────

export class InfrastructureStressSimulator {
  simulate(
    assets: InfrastructureStressModel[],
    climateScenario: ClimateScenario,
    yearsAhead: number,
  ): InfrastructureStressModel[] {
    return assets.map(asset => {
      const climateStress = climateScenario.temperatureDeltaC * 0.05 * (yearsAhead / 10);
      const projectedLoad = Math.min(1, asset.currentLoad + climateStress);
      const failureProbability = Math.min(0.99,
        asset.failureProbability + climateStress * (1 - asset.redundancyLevel)
      ) as Confidence;

      return { ...asset, projectedLoad, failureProbability };
    });
  }

  identifyCriticalPath(assets: InfrastructureStressModel[]): InfrastructureStressModel[] {
    return assets
      .filter(a => a.failureProbability > 0.4 && a.criticalityScore > 0.6)
      .sort((a, b) => b.failureProbability * b.criticalityScore - a.failureProbability * a.criticalityScore);
  }
}

// ─── Predictive Intelligence Layer ───────────────────────────────────────────

export class PredictiveIntelligenceLayer {
  readonly bayesian = new BayesianNetwork();
  readonly climate  = new ClimateForecastingEngine();
  readonly risk     = new RiskAnalysisEngine();
  readonly infra    = new InfrastructureStressSimulator();

  async forecast(location: LatLng, assets: InfrastructureStressModel[] = []): Promise<{
    scenarios: ClimateScenario[];
    risks: RiskAssessment[];
    stressedAssets: InfrastructureStressModel[];
    primaryScenario: ClimateScenario;
  }> {
    const scenarios = this.climate.generateScenarios(location, 25);
    const primaryScenario = this.climate.mostLikelyScenario(scenarios);
    const risks = this.risk.assessPortfolio(location, scenarios, assets);
    const stressedAssets = this.infra.simulate(assets, primaryScenario, 25);

    return { scenarios, risks, stressedAssets, primaryScenario };
  }
}

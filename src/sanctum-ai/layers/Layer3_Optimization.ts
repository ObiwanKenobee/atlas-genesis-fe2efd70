/**
 * Atlas Sanctum AI — Layer 3: Optimization
 *
 * Implements:
 *   - Multi-objective resource allocation (Pareto-optimal)
 *   - Energy grid optimization
 *   - Carbon restoration coordination
 *   - Water & agriculture systems planning
 *   - Transportation logistics
 */

import {
  ResourceAllocation, OptimizationObjective,
  CarbonRestorationPlan, LatLng,
  Result, ok, err, AIError,
} from '../AtlasSanctumAI.types';

// ─── Multi-Objective Optimizer (NSGA-II simplified) ──────────────────────────

export interface Solution {
  id: string;
  variables: number[];
  objectives: number[];
  rank: number;
  crowdingDistance: number;
}

export class MultiObjectiveOptimizer {
  /**
   * Pareto-front selection from a population of solutions.
   * In production: backed by Ray Tune or Optuna.
   */
  paretoFront(solutions: Solution[]): Solution[] {
    return solutions.filter(s => !solutions.some(other =>
      other.id !== s.id && this.dominates(other, s)
    ));
  }

  private dominates(a: Solution, b: Solution): boolean {
    return a.objectives.every((v, i) => v <= b.objectives[i]) &&
           a.objectives.some((v, i) => v < b.objectives[i]);
  }

  weightedSum(solution: Solution, weights: number[]): number {
    return solution.objectives.reduce((sum, v, i) => sum + v * (weights[i] ?? 1), 0);
  }
}

// ─── Resource Allocation Engine ───────────────────────────────────────────────

export class ResourceAllocationEngine {
  /**
   * Allocate resources across recipients using priority-weighted fair-share.
   * Equity score uses Gini coefficient inversion.
   */
  allocate(
    resourceType: ResourceAllocation['resourceType'],
    totalAvailable: number,
    recipients: { id: string; need: number; priority: number }[],
  ): ResourceAllocation {
    const totalNeed = recipients.reduce((s, r) => s + r.need * r.priority, 0);

    const allocations = recipients.map(r => ({
      recipient: r.id,
      amount: totalAvailable * (r.need * r.priority) / totalNeed,
      priority: r.priority,
    }));

    const amounts = allocations.map(a => a.amount);
    const gini = this.giniCoefficient(amounts);

    return {
      resourceType,
      totalAvailable,
      allocations,
      efficiency: Math.min(1, totalNeed / totalAvailable),
      equityScore: 1 - gini,
    };
  }

  private giniCoefficient(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = sorted.reduce((s, v) => s + v, 0) / n;
    if (mean === 0) return 0;
    const numerator = sorted.reduce((sum, v, i) =>
      sum + (2 * (i + 1) - n - 1) * v, 0
    );
    return numerator / (n * n * mean);
  }
}

// ─── Energy Grid Optimizer ────────────────────────────────────────────────────

export interface EnergyNode {
  id: string;
  type: 'solar' | 'wind' | 'hydro' | 'storage' | 'demand';
  location: LatLng;
  capacityKW: number;
  currentOutputKW: number;
  storageKWh?: number;
}

export interface EnergyDispatchPlan {
  timestamp: number;
  dispatches: { from: string; to: string; powerKW: number }[];
  renewableFraction: number;
  curtailmentKW: number;
  unmetDemandKW: number;
}

export class EnergyGridOptimizer {
  optimize(nodes: EnergyNode[]): EnergyDispatchPlan {
    const generators = nodes.filter(n => n.type !== 'demand' && n.type !== 'storage');
    const demands    = nodes.filter(n => n.type === 'demand');
    const storage    = nodes.filter(n => n.type === 'storage');

    const totalGeneration = generators.reduce((s, n) => s + n.currentOutputKW, 0);
    const totalDemand     = demands.reduce((s, n) => s + n.currentOutputKW, 0);
    const surplus         = totalGeneration - totalDemand;

    const dispatches: EnergyDispatchPlan['dispatches'] = [];
    let remaining = totalDemand;

    for (const gen of generators) {
      if (remaining <= 0) break;
      const dispatch = Math.min(gen.currentOutputKW, remaining);
      dispatches.push({ from: gen.id, to: 'grid', powerKW: dispatch });
      remaining -= dispatch;
    }

    // Charge storage with surplus
    if (surplus > 0) {
      for (const s of storage) {
        const canCharge = (s.storageKWh ?? 0) * 0.1; // 10% per interval
        dispatches.push({ from: 'grid', to: s.id, powerKW: Math.min(surplus, canCharge) });
      }
    }

    const renewableKW = generators
      .filter(n => n.type !== 'storage')
      .reduce((s, n) => s + n.currentOutputKW, 0);

    return {
      timestamp: Date.now(),
      dispatches,
      renewableFraction: totalGeneration > 0 ? renewableKW / totalGeneration : 0,
      curtailmentKW: Math.max(0, surplus),
      unmetDemandKW: Math.max(0, -surplus),
    };
  }
}

// ─── Carbon Restoration Coordinator ──────────────────────────────────────────

export class CarbonRestorationCoordinator {
  /**
   * Rank and sequence restoration projects by cost-effectiveness and co-benefits.
   * Optimizes for maximum sequestration per dollar with equity weighting.
   */
  prioritize(
    projects: CarbonRestorationPlan[],
    budget: number,
    equityWeight = 0.3,
  ): { selected: CarbonRestorationPlan[]; totalSequestration: number; totalCost: number } {
    // Score = sequestration/cost + equity bonus for community-led projects
    const scored = projects.map(p => ({
      project: p,
      score: (p.estimatedSequestrationTonnes / (p.costPerTonne * p.estimatedSequestrationTonnes))
             + (p.cobenefits.length * equityWeight * 0.1),
    })).sort((a, b) => b.score - a.score);

    const selected: CarbonRestorationPlan[] = [];
    let spent = 0;
    let totalSeq = 0;

    for (const { project } of scored) {
      const cost = project.costPerTonne * project.estimatedSequestrationTonnes;
      if (spent + cost <= budget) {
        selected.push(project);
        spent += cost;
        totalSeq += project.estimatedSequestrationTonnes;
      }
    }

    return { selected, totalSequestration: totalSeq, totalCost: spent };
  }
}

// ─── Water & Agriculture Planner ─────────────────────────────────────────────

export interface WaterBasin {
  basinId: string;
  location: LatLng;
  annualRainfallMm: number;
  groundwaterDepthM: number;
  irrigationDemandMm: number;
  populationServed: number;
}

export interface AgriculturePlan {
  basinId: string;
  recommendedCrops: string[];
  irrigationStrategy: 'drip' | 'sprinkler' | 'flood' | 'rainfed';
  waterSavingPct: number;
  yieldImprovementPct: number;
  soilHealthInterventions: string[];
}

export class WaterAgriculturePlanner {
  plan(basin: WaterBasin): AgriculturePlan {
    const waterStress = basin.irrigationDemandMm / Math.max(1, basin.annualRainfallMm);

    const irrigationStrategy: AgriculturePlan['irrigationStrategy'] =
      waterStress > 1.5 ? 'drip' :
      waterStress > 1.0 ? 'sprinkler' :
      waterStress > 0.5 ? 'flood' : 'rainfed';

    const waterSavingPct =
      irrigationStrategy === 'drip' ? 50 :
      irrigationStrategy === 'sprinkler' ? 30 :
      irrigationStrategy === 'flood' ? 10 : 0;

    return {
      basinId: basin.basinId,
      recommendedCrops: waterStress > 1.2
        ? ['drought-resistant sorghum', 'millet', 'cowpea']
        : ['maize', 'wheat', 'legumes'],
      irrigationStrategy,
      waterSavingPct,
      yieldImprovementPct: waterSavingPct * 0.4,
      soilHealthInterventions: [
        'Cover cropping',
        'Biochar application',
        'Agroforestry integration',
        'Composting program',
      ],
    };
  }
}

// ─── Optimization Layer ───────────────────────────────────────────────────────

export class OptimizationLayer {
  readonly resources  = new ResourceAllocationEngine();
  readonly energy     = new EnergyGridOptimizer();
  readonly carbon     = new CarbonRestorationCoordinator();
  readonly water      = new WaterAgriculturePlanner();
  readonly pareto     = new MultiObjectiveOptimizer();

  optimizeObjectives(objectives: OptimizationObjective[]): {
    feasible: boolean;
    recommendations: string[];
    tradeoffs: string[];
  } {
    const conflicts = objectives.filter((o, i) =>
      objectives.some((other, j) => i !== j &&
        o.direction !== other.direction &&
        Math.abs(o.currentValue - o.targetValue) > 0.1
      )
    );

    return {
      feasible: conflicts.length === 0,
      recommendations: objectives.map(o =>
        `${o.direction === 'maximize' ? '↑' : '↓'} ${o.name}: ${o.currentValue.toFixed(2)} → ${o.targetValue.toFixed(2)}`
      ),
      tradeoffs: conflicts.map(c => `Tension between ${c.name} and complementary objectives`),
    };
  }
}

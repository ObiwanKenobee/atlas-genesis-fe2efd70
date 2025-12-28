import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ValuationModel, ImpactBreakdown } from '@/types/marketplace';
import { useMeasurementData } from './useMeasurementData';
import { useRegenerativeMetrics } from './useRegenerativeMetrics';

/**
 * Fetch valuation model for a project
 * Contains impact weights, confidence scores, and risk adjustments
 */
export function useValuationModel(projectId: string | undefined) {
  return useQuery({
    queryKey: ['valuation-model', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('valuation_model')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;
      return (data as ValuationModel) || null;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 30, // 30 minute cache
  });
}

/**
 * Calculate dynamic credit price based on impact scoring
 * Price = base_price * impact_multiplier * confidence_adjustment * risk_adjustment
 */
export function useDynamicCreditPrice(projectId: string | undefined) {
  const { data: valuation } = useValuationModel(projectId);
  const { data: measurements } = useMeasurementData(projectId, { days: 7 });
  const { data: metrics } = useRegenerativeMetrics(projectId, { days: 7 });

  return useQuery({
    queryKey: ['dynamic-credit-price', projectId],
    queryFn: async () => {
      if (!valuation) {
        return {
          base_price: 0,
          final_price: 0,
          multipliers: {
            impact: 1.0,
            confidence: 1.0,
            risk: 1.0,
          },
          price_change_percent: 0,
        };
      }

      // Calculate impact multiplier (0.5x to 1.5x)
      const impactScore = valuation.weighted_impact_score || 50;
      const impactMultiplier = 0.5 + (impactScore / 100) * 1.0;

      // Calculate confidence adjustment (0.85x to 1.15x)
      const confidence = valuation.confidence_score || 0.85;
      const confidenceMultiplier = 0.85 + confidence * 0.3;

      // Calculate risk adjustment based on reversal probability
      // Higher risk = lower price multiplier
      const reversalRisk = valuation.reversal_risk_percent || 5;
      const riskMultiplier = 1.0 - (reversalRisk / 100) * 0.5; // Max -50% for high risk

      // Final calculation
      const basePrice = valuation.base_credit_price || 0;
      const finalPrice = parseFloat(
        (basePrice * impactMultiplier * confidenceMultiplier * riskMultiplier).toFixed(2)
      );

      // Calculate price change from base
      const priceChange = parseFloat(
        (((finalPrice - basePrice) / Math.max(basePrice, 1)) * 100).toFixed(2)
      );

      return {
        base_price: basePrice,
        final_price: finalPrice,
        multipliers: {
          impact: parseFloat(impactMultiplier.toFixed(2)),
          confidence: parseFloat(confidenceMultiplier.toFixed(2)),
          risk: parseFloat(riskMultiplier.toFixed(2)),
        },
        price_change_percent: priceChange,
      };
    },
    enabled: !!valuation && !!measurements && !!metrics,
  });
}

/**
 * Calculate impact breakdown showing weighted contributions
 * Shows how CO2, biodiversity, and health impact final score
 */
export function useImpactBreakdown(projectId: string | undefined) {
  const { data: valuation } = useValuationModel(projectId);
  const { data: measurements } = useMeasurementData(projectId, { days: 7 });
  const { data: metrics } = useRegenerativeMetrics(projectId, { days: 7 });

  return useQuery({
    queryKey: ['impact-breakdown', projectId],
    queryFn: async () => {
      if (!valuation || !measurements || !metrics) {
        return {
          co2_component: { value: 0, weight: 0.4, contribution: 0 },
          biodiversity_component: { value: 0, weight: 0.3, contribution: 0 },
          health_component: { value: 0, weight: 0.3, contribution: 0 },
          final_score: 0,
          confidence_interval: [0, 0],
          reversal_risk_adjusted_price: 0,
        } as ImpactBreakdown;
      }

      // Normalize measurements to 0-100 scale
      const avgCO2 = measurements.reduce((sum, m) => sum + (m.co2_level || 0), 0) / Math.max(measurements.length, 1);
      const co2_value = Math.min(100, (avgCO2 / 200) * 100); // Assume 200 ppm is max impact

      const avgBiodiversity = metrics.reduce((sum, m) => sum + (m.biodiversity_index || 0), 0) / Math.max(metrics.length, 1);
      const biodiversity_value = avgBiodiversity || 0;

      const avgHealth = metrics.reduce((sum, m) => sum + (m.soil_microbiome_health || 0), 0) / Math.max(metrics.length, 1);
      const health_value = avgHealth || 0;

      // Calculate weighted contributions
      const co2_contribution = (co2_value / 100) * valuation.impact_co2_weight * 100;
      const biodiversity_contribution = (biodiversity_value / 100) * valuation.impact_biodiversity_weight * 100;
      const health_contribution = (health_value / 100) * valuation.impact_health_weight * 100;

      const final_score = co2_contribution + biodiversity_contribution + health_contribution;

      // Calculate confidence interval
      const confidence = valuation.confidence_score || 0.85;
      const margin = (1 - confidence) * 20; // margin of error
      const lower = Math.max(0, final_score - margin);
      const upper = Math.min(100, final_score + margin);

      // Risk-adjusted price
      const basePrice = valuation.base_credit_price || 0;
      const riskFactor = 1 - (valuation.reversal_risk_percent || 5) / 100;
      const reversalRiskAdjustedPrice = parseFloat((basePrice * riskFactor).toFixed(2));

      return {
        co2_component: {
          value: parseFloat(co2_value.toFixed(2)),
          weight: valuation.impact_co2_weight,
          contribution: parseFloat(co2_contribution.toFixed(2)),
        },
        biodiversity_component: {
          value: parseFloat(biodiversity_value.toFixed(2)),
          weight: valuation.impact_biodiversity_weight,
          contribution: parseFloat(biodiversity_contribution.toFixed(2)),
        },
        health_component: {
          value: parseFloat(health_value.toFixed(2)),
          weight: valuation.impact_health_weight,
          contribution: parseFloat(health_contribution.toFixed(2)),
        },
        final_score: parseFloat(final_score.toFixed(2)),
        confidence_interval: [parseFloat(lower.toFixed(2)), parseFloat(upper.toFixed(2))],
        reversal_risk_adjusted_price: reversalRiskAdjustedPrice,
      } as ImpactBreakdown;
    },
    enabled: !!projectId && !!valuation && !!measurements && !!metrics,
  });
}

/**
 * Calculate reversal risk decay over time
 * Credits become less risky as permanence increases
 * Useful for long-term valuation projections
 */
export function useReversalRiskDecay(projectId: string | undefined, yearsFromNow: number = 10) {
  const { data: valuation } = useValuationModel(projectId);

  return useQuery({
    queryKey: ['reversal-risk-decay', projectId, yearsFromNow],
    queryFn: async () => {
      if (!valuation) {
        return {
          current_risk: 5,
          future_risk: 2.5,
          risk_reduction_percent: 50,
          permanence_score: 50,
          permanence_bond_amount: 0,
        };
      }

      const currentRisk = valuation.reversal_risk_percent || 5;
      const decayRate = valuation.reversal_risk_decay_rate || 0.95;

      // Exponential decay: future_risk = current_risk * (decay_rate ^ years)
      const futureRisk = currentRisk * Math.pow(decayRate, yearsFromNow);
      const riskReductionPercent = parseFloat(
        (((currentRisk - futureRisk) / currentRisk) * 100).toFixed(2)
      );

      // Permanence score increases with time (0-100)
      const permanenceScore = parseFloat(
        Math.min(100, (yearsFromNow / 30) * 100).toFixed(2)
      );

      return {
        current_risk: parseFloat(currentRisk.toFixed(2)),
        future_risk: parseFloat(futureRisk.toFixed(2)),
        risk_reduction_percent: riskReductionPercent,
        permanence_score: permanenceScore,
        permanence_bond_amount: valuation.permanence_bond_percent || 10,
      };
    },
    enabled: !!valuation,
  });
}

/**
 * Generate confidence interval for credit value
 * Shows 95% confidence bounds on valuation
 */
export function useValuationConfidenceInterval(projectId: string | undefined) {
  const { data: valuation } = useValuationModel(projectId);

  return useQuery({
    queryKey: ['valuation-confidence', projectId],
    queryFn: async () => {
      if (!valuation) {
        return {
          point_estimate: 0,
          lower_bound_95: 0,
          upper_bound_95: 0,
          confidence_level: 0,
          interpretation: 'Insufficient data',
        };
      }

      const pointEstimate = valuation.final_credit_price || 0;
      const lowerBound = valuation.confidence_lower_bound || 0;
      const upperBound = valuation.confidence_upper_bound || 0;
      const confidence = valuation.confidence_score || 0.85;

      // Margin of error calculation
      const marginOfError = parseFloat(((upperBound - lowerBound) / 2).toFixed(2));
      const confidencePercent = parseFloat((confidence * 100).toFixed(1));

      // Interpretation based on margin
      let interpretation = 'High confidence';
      if (marginOfError > pointEstimate * 0.3) interpretation = 'Moderate confidence';
      if (marginOfError > pointEstimate * 0.5) interpretation = 'Low confidence';

      return {
        point_estimate: pointEstimate,
        lower_bound_95: lowerBound,
        upper_bound_95: upperBound,
        margin_of_error: marginOfError,
        confidence_level: confidencePercent,
        interpretation,
      };
    },
    enabled: !!valuation,
  });
}

/**
 * Calculate credit price projection over time
 * Shows how price might change as permanence increases and risk decreases
 */
export function usePriceProjection(projectId: string | undefined) {
  const { data: valuation } = useValuationModel(projectId);
  const { data: currentPrice } = useDynamicCreditPrice(projectId);

  return useQuery({
    queryKey: ['price-projection', projectId],
    queryFn: async () => {
      if (!valuation || !currentPrice) {
        return {
          current_price: 0,
          projected_prices: [],
          best_case: 0,
          worst_case: 0,
        };
      }

      const basePrice = valuation.base_credit_price || 0;
      const decayRate = valuation.reversal_risk_decay_rate || 0.95;

      const projectedPrices = [];
      for (let year = 1; year <= 20; year += 2) {
        // Project every 2 years
        const riskAtYear = valuation.reversal_risk_percent * Math.pow(decayRate, year);
        const riskMultiplier = 1.0 - (riskAtYear / 100) * 0.5;
        const projectedPrice = parseFloat((basePrice * riskMultiplier).toFixed(2));

        projectedPrices.push({
          year,
          price: projectedPrice,
          risk_level: riskAtYear,
        });
      }

      // Calculate best/worst case scenarios
      const bestCase = parseFloat((basePrice * 1.5).toFixed(2)); // Best: full impact realization
      const worstCase = parseFloat((basePrice * 0.5).toFixed(2)); // Worst: partial permanence

      return {
        current_price: currentPrice.final_price,
        projected_prices: projectedPrices,
        best_case: bestCase,
        worst_case: worstCase,
      };
    },
    enabled: !!projectId && !!valuation && !!currentPrice,
  });
}

/**
 * Verify impact scoring integrity
 * Ensures weights sum to 1.0 and all values are in valid ranges
 */
export function useValuationIntegrity(projectId: string | undefined) {
  const { data: valuation } = useValuationModel(projectId);

  return useQuery({
    queryKey: ['valuation-integrity', projectId],
    queryFn: async () => {
      if (!valuation) {
        return {
          is_valid: false,
          weight_sum: 0,
          issues: ['No valuation model found'],
        };
      }

      const issues: string[] = [];

      // Check weight sum
      const weightSum = valuation.impact_co2_weight + valuation.impact_biodiversity_weight + valuation.impact_health_weight;
      if (Math.abs(weightSum - 1.0) > 0.01) {
        issues.push(`Weight sum is ${weightSum.toFixed(2)}, should be 1.0`);
      }

      // Check score ranges
      if (!valuation.weighted_impact_score || valuation.weighted_impact_score < 0 || valuation.weighted_impact_score > 100) {
        issues.push('Impact score out of valid range (0-100)');
      }

      if (!valuation.confidence_score || valuation.confidence_score < 0 || valuation.confidence_score > 1) {
        issues.push('Confidence score out of valid range (0-1)');
      }

      // Check price consistency
      if (valuation.base_credit_price && valuation.final_credit_price) {
        const priceRatio = valuation.final_credit_price / valuation.base_credit_price;
        if (priceRatio < 0.3 || priceRatio > 3.0) {
          issues.push(`Price multiplier ${priceRatio.toFixed(2)}x is extreme`);
        }
      }

      return {
        is_valid: issues.length === 0,
        weight_sum: parseFloat(weightSum.toFixed(3)),
        issues,
      };
    },
    enabled: !!valuation,
  });
}

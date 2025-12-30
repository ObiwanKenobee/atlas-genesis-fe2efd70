import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ValuationModel, ImpactBreakdown } from "@/types/marketplace";

export const useValuationModel = (projectId: string | undefined) => {
  const query = useQuery<ValuationModel>({
    queryKey: ["valuation-model", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID required");

      const { data, error } = await supabase
        .from("valuation_models")
        .select("*")
        .eq("project_id", projectId)
        .order("last_recomputed_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found, which is expected for new projects
        console.error("Error fetching valuation model:", error);
        throw error;
      }

      return (data || null) as ValuationModel | null;
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

// Helper to compute impact breakdown from valuation model
export function computeImpactBreakdown(model: ValuationModel): ImpactBreakdown {
  const totalWeight = model.impact_co2_weight + model.impact_biodiversity_weight + model.impact_health_weight;

  const co2Component = {
    value: 100, // Normalized to 0-100 scale
    weight: model.impact_co2_weight,
    contribution: (model.impact_co2_weight / totalWeight) * (model.weighted_impact_score || 0),
  };

  const biodiversityComponent = {
    value: 100,
    weight: model.impact_biodiversity_weight,
    contribution: (model.impact_biodiversity_weight / totalWeight) * (model.weighted_impact_score || 0),
  };

  const healthComponent = {
    value: 100,
    weight: model.impact_health_weight,
    contribution: (model.impact_health_weight / totalWeight) * (model.weighted_impact_score || 0),
  };

  return {
    co2_component: co2Component,
    biodiversity_component: biodiversityComponent,
    health_component: healthComponent,
    final_score: model.weighted_impact_score || 0,
    confidence_interval: [
      model.confidence_lower_bound || 0,
      model.confidence_upper_bound || 100,
    ],
    reversal_risk_adjusted_price: model.final_credit_price || 0,
  };
}

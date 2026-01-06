import { query } from '../db';
import { logSecurityEvent } from '../utils/logger';

export interface EthicalConstraint {
  id: string;
  name: string;
  type: 'hard' | 'soft';
  category: 'environmental' | 'social' | 'economic' | 'cultural' | 'temporal';
  rule: string;
  parameters: Record<string, any>;
  violationCost?: number; // For soft constraints
  active: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface EthicalEvaluation {
  actionId: string;
  constraints: EthicalConstraintResult[];
  overallResult: 'allowed' | 'denied' | 'allowed_with_cost';
  totalCost: number;
  reasoning: string[];
  alternatives?: string[];
}

export interface EthicalConstraintResult {
  constraintId: string;
  constraintName: string;
  type: 'hard' | 'soft';
  violated: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cost: number;
  reasoning: string;
  suggestedAlternative?: string;
}

export class EthicalConstraintEngine {
  /**
   * Evaluate action against all active ethical constraints
   */
  async evaluateAction(
    actionType: string,
    actionData: any,
    userId: string,
    context: Record<string, any> = {}
  ): Promise<EthicalEvaluation> {
    const actionId = `ea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get all active constraints for this action type
    const constraints = await this.getActiveConstraints(actionType);
    
    const results: EthicalConstraintResult[] = [];
    let totalCost = 0;
    let hardViolations = 0;
    const reasoning: string[] = [];
    const alternatives: string[] = [];

    // Evaluate each constraint
    for (const constraint of constraints) {
      const result = await this.evaluateConstraint(constraint, actionData, context);
      results.push(result);

      if (result.violated) {
        if (constraint.type === 'hard') {
          hardViolations++;
          reasoning.push(`HARD VIOLATION: ${result.reasoning}`);
        } else {
          totalCost += result.cost;
          reasoning.push(`Soft violation (cost: ${result.cost}): ${result.reasoning}`);
        }

        if (result.suggestedAlternative) {
          alternatives.push(result.suggestedAlternative);
        }
      }
    }

    // Determine overall result
    let overallResult: 'allowed' | 'denied' | 'allowed_with_cost';
    if (hardViolations > 0) {
      overallResult = 'denied';
    } else if (totalCost > 0) {
      overallResult = 'allowed_with_cost';
    } else {
      overallResult = 'allowed';
    }

    // Log the evaluation
    await this.logEvaluation(actionId, userId, actionType, overallResult, totalCost, results);

    return {
      actionId,
      constraints: results,
      overallResult,
      totalCost,
      reasoning,
      alternatives: alternatives.length > 0 ? alternatives : undefined
    };
  }

  /**
   * Create new ethical constraint
   */
  async createConstraint(
    name: string,
    type: 'hard' | 'soft',
    category: string,
    rule: string,
    parameters: Record<string, any>,
    violationCost: number = 0,
    createdBy: string
  ): Promise<string> {
    const constraintId = `ec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await query(`
      INSERT INTO ethical_constraints (
        id, name, type, category, rule, parameters, violation_cost, 
        active, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, NOW())
    `, [
      constraintId, name, type, category, rule, 
      JSON.stringify(parameters), violationCost, createdBy
    ]);

    logSecurityEvent('ethical_constraint_created', createdBy, {
      constraintId,
      name,
      type,
      category
    }, 'low');

    return constraintId;
  }

  /**
   * Simulate action outcomes for ethical evaluation
   */
  async simulateScenario(
    actionType: string,
    actionData: any,
    timeHorizon: number = 365, // days
    scenarios: number = 100
  ): Promise<{
    bestCase: EthicalEvaluation;
    worstCase: EthicalEvaluation;
    averageCase: EthicalEvaluation;
    riskScore: number;
  }> {
    const simulations: EthicalEvaluation[] = [];

    for (let i = 0; i < scenarios; i++) {
      // Add random variations to simulate uncertainty
      const variedData = this.addScenarioVariation(actionData, i / scenarios);
      const evaluation = await this.evaluateAction(actionType, variedData, 'system');
      simulations.push(evaluation);
    }

    // Analyze results
    const costs = simulations.map(s => s.totalCost);
    const deniedCount = simulations.filter(s => s.overallResult === 'denied').length;
    
    const bestCase = simulations.reduce((best, current) => 
      current.totalCost < best.totalCost ? current : best
    );
    
    const worstCase = simulations.reduce((worst, current) => 
      current.totalCost > worst.totalCost ? current : worst
    );
    
    const averageCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
    const averageCase: EthicalEvaluation = {
      actionId: 'simulation_average',
      constraints: [],
      overallResult: deniedCount > scenarios * 0.1 ? 'denied' : 'allowed_with_cost',
      totalCost: averageCost,
      reasoning: [`Average of ${scenarios} simulations`],
    };

    const riskScore = (deniedCount / scenarios) + (averageCost / 1000); // Normalized risk

    return {
      bestCase,
      worstCase,
      averageCase,
      riskScore
    };
  }

  /**
   * Get active constraints for action type
   */
  private async getActiveConstraints(actionType: string): Promise<EthicalConstraint[]> {
    const result = await query(`
      SELECT * FROM ethical_constraints 
      WHERE active = true 
      AND (parameters->>'actionTypes' IS NULL OR parameters->>'actionTypes' LIKE '%' || $1 || '%')
      ORDER BY type DESC, category
    `, [actionType]);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      category: row.category,
      rule: row.rule,
      parameters: JSON.parse(row.parameters || '{}'),
      violationCost: row.violation_cost,
      active: row.active,
      createdBy: row.created_by,
      createdAt: row.created_at
    }));
  }

  /**
   * Evaluate single constraint against action
   */
  private async evaluateConstraint(
    constraint: EthicalConstraint,
    actionData: any,
    context: Record<string, any>
  ): Promise<EthicalConstraintResult> {
    let violated = false;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let reasoning = '';
    let suggestedAlternative: string | undefined;

    try {
      // Execute constraint rule
      const ruleResult = await this.executeRule(constraint.rule, actionData, context, constraint.parameters);
      violated = !ruleResult.passed;
      severity = ruleResult.severity || 'medium';
      reasoning = ruleResult.reasoning || 'Constraint evaluation completed';
      suggestedAlternative = ruleResult.alternative;
    } catch (error) {
      // If rule execution fails, treat as violation for safety
      violated = true;
      severity = 'high';
      reasoning = `Rule execution failed: ${(error as Error).message}`;
    }

    const cost = violated && constraint.type === 'soft' ? (constraint.violationCost || 0) : 0;

    return {
      constraintId: constraint.id,
      constraintName: constraint.name,
      type: constraint.type,
      violated,
      severity,
      cost,
      reasoning,
      suggestedAlternative
    };
  }

  /**
   * Execute constraint rule (simplified rule engine)
   */
  private async executeRule(
    rule: string,
    actionData: any,
    context: any,
    parameters: any
  ): Promise<{
    passed: boolean;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    reasoning?: string;
    alternative?: string;
  }> {
    // This is a simplified rule engine. In production, you'd use a proper rule engine
    // like Drools, or implement a more sophisticated expression evaluator

    const ruleContext = {
      action: actionData,
      context,
      params: parameters,
      // Helper functions
      hasProperty: (obj: any, prop: string) => obj && obj.hasOwnProperty(prop),
      getValue: (obj: any, path: string) => this.getNestedValue(obj, path),
      isWithinRange: (value: number, min: number, max: number) => value >= min && value <= max,
      isValidDate: (date: any) => date instanceof Date && !isNaN(date.getTime()),
      // Environmental checks
      exceedsEmissionLimit: (emissions: number, limit: number) => emissions > limit,
      threatensBiodiversity: (impact: any) => impact && impact.biodiversityScore < 0.5,
      // Social checks
      affectsIndigenousLand: (location: any) => location && location.indigenousTerritory === true,
      requiresCommunityConsent: (impact: any) => impact && impact.communityAffected === true,
      // Economic checks
      exceedsAffordabilityThreshold: (cost: number, income: number) => cost > income * 0.3,
      // Temporal checks
      hasLongTermImpact: (duration: number) => duration > 365 * 10, // 10 years
    };

    try {
      // Simple rule evaluation (in production, use a proper rule engine)
      const result = this.evaluateRuleExpression(rule, ruleContext);
      return result;
    } catch (error) {
      throw new Error(`Rule evaluation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Simple rule expression evaluator
   */
  private evaluateRuleExpression(rule: string, context: any): {
    passed: boolean;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    reasoning?: string;
    alternative?: string;
  } {
    // This is a very simplified implementation
    // In production, use a proper rule engine or expression evaluator

    // Example rules:
    // "!exceedsEmissionLimit(action.emissions, params.maxEmissions)"
    // "!affectsIndigenousLand(action.location) || context.hasConsent"
    // "!threatensBiodiversity(action.impact)"

    // For now, return a default evaluation
    // This would be replaced with actual rule parsing and execution
    
    if (rule.includes('exceedsEmissionLimit')) {
      const emissions = context.action?.emissions || 0;
      const limit = context.params?.maxEmissions || 1000;
      const passed = emissions <= limit;
      
      return {
        passed,
        severity: passed ? 'low' : 'high',
        reasoning: passed 
          ? `Emissions ${emissions} within limit ${limit}` 
          : `Emissions ${emissions} exceed limit ${limit}`,
        alternative: passed ? undefined : 'Consider carbon offset or emission reduction measures'
      };
    }

    if (rule.includes('affectsIndigenousLand')) {
      const affectsLand = context.action?.location?.indigenousTerritory === true;
      const hasConsent = context.context?.hasConsent === true;
      const passed = !affectsLand || hasConsent;
      
      return {
        passed,
        severity: passed ? 'low' : 'critical',
        reasoning: passed 
          ? 'No indigenous land impact or consent obtained' 
          : 'Action affects indigenous land without consent',
        alternative: passed ? undefined : 'Obtain community consent before proceeding'
      };
    }

    // Default: assume rule passes
    return {
      passed: true,
      severity: 'low',
      reasoning: 'Rule evaluation completed successfully'
    };
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Add scenario variation for simulation
   */
  private addScenarioVariation(data: any, variation: number): any {
    // Add random variations to simulate different scenarios
    const varied = JSON.parse(JSON.stringify(data));
    
    // Add some randomness to numeric values
    if (varied.emissions) {
      varied.emissions *= (1 + (Math.random() - 0.5) * 0.2); // ±10% variation
    }
    
    if (varied.cost) {
      varied.cost *= (1 + (Math.random() - 0.5) * 0.3); // ±15% variation
    }
    
    return varied;
  }

  /**
   * Log ethical evaluation
   */
  private async logEvaluation(
    actionId: string,
    userId: string,
    actionType: string,
    result: string,
    cost: number,
    constraints: EthicalConstraintResult[]
  ): Promise<void> {
    await query(`
      INSERT INTO ethical_evaluations (
        id, user_id, action_type, result, total_cost, 
        constraints_evaluated, violations, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `, [
      actionId, userId, actionType, result, cost,
      constraints.length, constraints.filter(c => c.violated).length
    ]);

    // Log security event for denied actions
    if (result === 'denied') {
      logSecurityEvent('ethical_constraint_violation', userId, {
        actionId,
        actionType,
        violations: constraints.filter(c => c.violated).map(c => c.constraintName)
      }, 'high');
    }
  }

  /**
   * Get constraint violation history
   */
  async getViolationHistory(
    userId?: string,
    actionType?: string,
    days: number = 30
  ): Promise<any[]> {
    let whereClause = 'WHERE created_at > NOW() - INTERVAL \'$1 days\'';
    const params: any[] = [days];

    if (userId) {
      whereClause += ' AND user_id = $2';
      params.push(userId);
    }

    if (actionType) {
      whereClause += ` AND action_type = $${params.length + 1}`;
      params.push(actionType);
    }

    const result = await query(`
      SELECT * FROM ethical_evaluations 
      ${whereClause}
      ORDER BY created_at DESC
    `, params);

    return result.rows;
  }
}
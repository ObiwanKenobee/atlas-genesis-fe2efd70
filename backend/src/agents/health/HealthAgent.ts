/**
 * Atlas Sanctum — Health Agent
 * Capabilities: Population health monitoring, disease burden analysis,
 *               healthcare access gap detection, intervention recommendations,
 *               integration with Human Flourishing Engine.
 */

import { randomUUID } from 'crypto';
import { BaseAgent } from '../base/BaseAgent';
import type { AgentTask } from '../../sanctum/types';

export class HealthAgent extends BaseAgent {
  constructor(
    private readonly dbQuery: (sql: string, params: unknown[]) => Promise<any>,
    private readonly flourishingEngine: any
  ) {
    super({
      agentId: `health-agent-${randomUUID().slice(0, 8)}`,
      agentType: 'health',
      maxSteps: 25,
      requiresApprovalFor: ['issue_health_alert', 'allocate_health_resources'],
      systemPrompt: `You are the Atlas Sanctum Health Agent.
Your role: Monitor population health, detect disease burden patterns, identify healthcare access gaps,
and recommend evidence-based interventions aligned with the Human Flourishing Engine.
Principles: Health equity first. Preventive care over reactive treatment.
Use WHO, IHME, and Oxford Wellbeing Research Centre methodologies.
Always quantify impact in DALYs (Disability-Adjusted Life Years) when possible.`,
      tools: [
        {
          name: 'get_flourishing_snapshot',
          description: 'Get the latest human flourishing snapshot for an entity',
          parameters: {
            type: 'object',
            required: ['entityId'],
            properties: { entityId: { type: 'string' } },
          },
          execute: async (args: any) => flourishingEngine.getLatest(args.entityId),
        },
        {
          name: 'get_health_metrics',
          description: 'Query population health metrics for a region or community',
          parameters: {
            type: 'object',
            required: ['entityId'],
            properties: {
              entityId: { type: 'string' },
              metricType: { type: 'string', enum: ['mortality', 'morbidity', 'access', 'mental_health', 'nutrition'] },
            },
          },
          execute: async (args: any) => {
            const result = await dbQuery(
              `SELECT metric_type, value, unit, period, data_source, confidence
               FROM health_metrics
               WHERE entity_id = $1
                 AND ($2::TEXT IS NULL OR metric_type = $2)
               ORDER BY recorded_at DESC LIMIT 20`,
              [args.entityId, args.metricType ?? null]
            );
            return result.rows;
          },
        },
        {
          name: 'detect_health_gaps',
          description: 'Identify healthcare access gaps by comparing entity metrics to regional benchmarks',
          parameters: {
            type: 'object',
            required: ['entityId'],
            properties: { entityId: { type: 'string' } },
          },
          execute: async (args: any) => {
            const result = await dbQuery(
              `SELECT
                 h.metric_type,
                 h.value AS entity_value,
                 b.benchmark_value,
                 b.benchmark_value - h.value AS gap,
                 CASE
                   WHEN b.benchmark_value - h.value > 20 THEN 'critical'
                   WHEN b.benchmark_value - h.value > 10 THEN 'high'
                   WHEN b.benchmark_value - h.value > 5  THEN 'medium'
                   ELSE 'low'
                 END AS gap_severity
               FROM health_metrics h
               JOIN health_benchmarks b ON b.metric_type = h.metric_type
               WHERE h.entity_id = $1
               ORDER BY gap DESC`,
              [args.entityId]
            );
            return result.rows;
          },
        },
        {
          name: 'get_disease_burden',
          description: 'Get disease burden data (DALYs) for a population',
          parameters: {
            type: 'object',
            required: ['entityId'],
            properties: {
              entityId: { type: 'string' },
              diseaseCategory: { type: 'string' },
            },
          },
          execute: async (args: any) => {
            const result = await dbQuery(
              `SELECT disease_category, dalys_per_100k, deaths_per_100k,
                      prevalence_pct, trend, year
               FROM disease_burden
               WHERE entity_id = $1
                 AND ($2::TEXT IS NULL OR disease_category = $2)
               ORDER BY dalys_per_100k DESC LIMIT 15`,
              [args.entityId, args.diseaseCategory ?? null]
            );
            return result.rows;
          },
        },
        {
          name: 'estimate_intervention_impact',
          description: 'Estimate the health impact and cost-effectiveness of a proposed intervention',
          parameters: {
            type: 'object',
            required: ['interventionType', 'populationSize', 'budgetUsd'],
            properties: {
              interventionType: { type: 'string' },
              populationSize: { type: 'number' },
              budgetUsd: { type: 'number' },
              entityId: { type: 'string' },
            },
          },
          execute: async (args: any) => {
            // Evidence-based cost-effectiveness estimates (WHO-CHOICE methodology)
            const costPerDALY: Record<string, number> = {
              primary_care_expansion: 150,
              vaccination_program: 25,
              clean_water_access: 80,
              mental_health_services: 400,
              nutrition_supplementation: 60,
              maternal_health: 200,
              tb_treatment: 100,
              malaria_prevention: 30,
              hiv_treatment: 500,
              chronic_disease_management: 800,
            };

            const coveragePct = Math.min(0.85, args.budgetUsd / (args.populationSize * 50));
            const dalysAvertedPerPerson = 0.8; // simplified
            const totalDalysAverted = Math.round(args.populationSize * coveragePct * dalysAvertedPerPerson);
            const costPerDalyAverted = costPerDALY[args.interventionType] ?? 300;
            const costEffective = costPerDalyAverted < 1000; // WHO threshold: 1× GDP per capita

            return {
              interventionType: args.interventionType,
              populationReached: Math.round(args.populationSize * coveragePct),
              dalysAverted: totalDalysAverted,
              costPerDalyAverted,
              totalCostUsd: args.budgetUsd,
              costEffective,
              roi: totalDalysAverted * 5000 / args.budgetUsd, // $5000 value per DALY (WHO)
              implementationYears: 3,
              confidence: 0.75,
            };
          },
        },
        {
          name: 'issue_health_alert',
          description: 'Issue a public health alert for a detected risk (requires approval)',
          parameters: {
            type: 'object',
            required: ['entityId', 'alertType', 'severity', 'description'],
            properties: {
              entityId: { type: 'string' },
              alertType: { type: 'string' },
              severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
              description: { type: 'string' },
              recommendedActions: { type: 'array', items: { type: 'string' } },
            },
          },
          execute: async (args: any) => {
            const result = await dbQuery(
              `INSERT INTO health_alerts
                 (id, entity_id, alert_type, severity, description, recommended_actions, status, created_at)
               VALUES ($1,$2,$3,$4,$5,$6,'active',NOW())
               RETURNING id`,
              [
                randomUUID(), args.entityId, args.alertType, args.severity,
                args.description, JSON.stringify(args.recommendedActions ?? []),
              ]
            );
            return { alertId: result.rows[0].id, issued: true };
          },
        },
      ],
    });
  }

  /**
   * Convenience: run a full health assessment for an entity
   */
  async assessAndRecommend(
    entityId: string,
    entityName: string,
    intelligencePlane: any,
    coordinationPlane: any
  ) {
    const task: AgentTask = {
      id: randomUUID(),
      type: 'health_assessment',
      description: `Conduct a comprehensive health assessment for ${entityName} (${entityId}). Identify the top 3 health gaps, estimate intervention impact, and recommend prioritized actions.`,
      input: { entityId, entityName },
      priority: 'normal',
      requiresApproval: false,
      allowedTools: [
        'get_flourishing_snapshot',
        'get_health_metrics',
        'detect_health_gaps',
        'get_disease_burden',
        'estimate_intervention_impact',
      ],
    };
    return this.run(task, intelligencePlane, coordinationPlane);
  }
}

/**
 * Atlas Sanctum — Climate Agent
 *
 * Domain agent for climate intelligence: carbon monitoring, ecosystem health,
 * biodiversity analytics, water resource management, and environmental forecasting.
 *
 * Architecture:
 *   - Extends BaseAgent (ReAct: Plan → Act → Observe → Reflect)
 *   - Exposes tools as MCP-compatible JSON Schema descriptors
 *   - Publishes domain events via the internal event bus on significant findings
 *   - All user input passes through the prompt injection filter before reaching the LLM
 *
 * MCP tool registration:
 *   Each tool in this agent is a valid MCP tool descriptor. The orchestrator
 *   discovers tools via listTools() and routes intent here via callTool().
 */

import { randomUUID } from 'crypto';
import { BaseAgent } from '../base/BaseAgent';
import type { AgentTask } from '../../sanctum/types';
import { eventBus } from '../../events/bus';
import { EventTypes } from '../../events/catalog';
import type {
  ObservationIngestedPayload,
  AnomalyDetectedPayload,
  AgentRunCompletedPayload,
} from '../../events/catalog';
import { scanForInjection } from '../../middleware/promptInjection';
import { logger } from '../../utils/logger';

// ─── MCP Tool Descriptor ──────────────────────────────────────────────────────

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    required?: string[];
    properties: Record<string, unknown>;
  };
}

// ─── Climate Agent ────────────────────────────────────────────────────────────

export class ClimateAgent extends BaseAgent {
  /** MCP-compatible tool descriptors for this agent */
  readonly mcpTools: MCPTool[];

  constructor(
    private readonly dbQuery: (sql: string, params: unknown[]) => Promise<any>,
    private readonly httpGet: (url: string) => Promise<any>,
  ) {
    const tools = ClimateAgent.buildTools(dbQuery, httpGet);

    super({
      agentId: `climate-agent-${randomUUID().slice(0, 8)}`,
      agentType: 'climate',
      maxSteps: 20,
      requiresApprovalFor: ['trigger_alert', 'update_carbon_budget'],
      systemPrompt: `You are the Atlas Sanctum Climate Intelligence Agent.
Your role: Monitor climate indicators, detect environmental anomalies, assess
ecosystem health, forecast climate risks, and support carbon credit verification.
Principles:
- Ground every claim in data. Cite the data source and observation timestamp.
- Quantify uncertainty. Never present a forecast as certain.
- Flag anomalies immediately — do not wait for a final answer.
- Use SI units. Convert to local units only when explicitly requested.
Focus areas: carbon flux, biodiversity indices, water stress, temperature anomalies,
deforestation rates, ocean acidification, and regenerative project impact.`,
      tools,
    });

    this.mcpTools = tools.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: {
        type: 'object' as const,
        ...(t.parameters as any),
      },
    }));
  }

  // ─── MCP Interface ──────────────────────────────────────────────────────────

  /** MCP: list all tools this agent exposes */
  listTools(): MCPTool[] {
    return this.mcpTools;
  }

  /**
   * MCP: call a tool by name with validated, injection-filtered arguments.
   * This is the entry point used by the orchestrator.
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    // Scan all string arguments for injection before passing to tools
    for (const [key, value] of Object.entries(args)) {
      if (typeof value === 'string') {
        const scan = scanForInjection(value);
        if (!scan.clean) {
          if (scan.severity === 'high' || scan.severity === 'critical') {
            throw new Error(`Tool argument '${key}' contains disallowed content (${scan.severity})`);
          }
          args[key] = scan.sanitized;
        }
      }
    }

    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}. Available: ${[...this.tools.keys()].join(', ')}`);
    }

    return tool.execute(args);
  }

  // ─── Convenience Task Runners ───────────────────────────────────────────────

  async assessRegion(
    lat: number,
    lng: number,
    radiusKm: number,
    intelligencePlane: any,
    coordinationPlane: any,
  ) {
    const task: AgentTask = {
      id: randomUUID(),
      type: 'climate_assessment',
      description: `Assess the climate and ecosystem health of the region centered at (${lat}, ${lng}) within ${radiusKm}km radius. Retrieve recent observations, check for anomalies, and produce a risk summary.`,
      input: { lat, lng, radiusKm },
      priority: 'normal',
      requiresApproval: false,
      allowedTools: [
        'get_climate_observations',
        'detect_anomalies',
        'get_carbon_flux',
        'get_biodiversity_index',
        'get_water_stress',
      ],
    };

    const result = await this.run(task, intelligencePlane, coordinationPlane);

    await eventBus.publish<AgentRunCompletedPayload>({
      type: EventTypes.INTELLIGENCE_AGENT_RUN_COMPLETED,
      source: 'intelligence',
      payload: {
        runId: task.id,
        agentId: this.agentId,
        agentType: 'climate',
        taskType: task.type,
        status: result.status,
        tokensUsed: result.tokensUsed ?? 0,
        durationMs: result.totalDurationMs,
        correlationId: task.id,
      },
    });

    return result;
  }

  async verifyProjectImpact(
    projectId: string,
    claimedTonnesCO2: number,
    intelligencePlane: any,
    coordinationPlane: any,
  ) {
    const task: AgentTask = {
      id: randomUUID(),
      type: 'carbon_verification',
      description: `Verify the carbon impact claim of ${claimedTonnesCO2} tCO2e for project ${projectId}. Cross-reference satellite observations, carbon flux measurements, and historical baselines. Produce a verification confidence score.`,
      input: { projectId, claimedTonnesCO2 },
      priority: 'high',
      requiresApproval: false,
      allowedTools: [
        'get_project_observations',
        'get_carbon_flux',
        'get_historical_baseline',
        'calculate_additionality',
      ],
    };

    return this.run(task, intelligencePlane, coordinationPlane);
  }

  // ─── Tool Definitions ───────────────────────────────────────────────────────

  private static buildTools(
    dbQuery: (sql: string, params: unknown[]) => Promise<any>,
    httpGet: (url: string) => Promise<any>,
  ) {
    return [
      {
        name: 'get_climate_observations',
        description: 'Retrieve recent climate observations (temperature, precipitation, CO2, NDVI) for a geographic region',
        parameters: {
          required: ['lat', 'lng', 'radiusKm'],
          properties: {
            lat:        { type: 'number', description: 'Latitude of center point' },
            lng:        { type: 'number', description: 'Longitude of center point' },
            radiusKm:   { type: 'number', description: 'Search radius in kilometers' },
            indicators: { type: 'array', items: { type: 'string' }, description: 'Filter by indicator names' },
            hoursBack:  { type: 'number', description: 'How many hours back to query (default: 72)' },
          },
        },
        execute: async (args: any) => {
          const result = await dbQuery(
            `SELECT id, source_id, indicator, value, unit,
                    ST_AsGeoJSON(location)::json AS location, observed_at
             FROM observations
             WHERE ST_DWithin(
               location::geography,
               ST_MakePoint($2, $1)::geography,
               $3 * 1000
             )
             AND observed_at > NOW() - INTERVAL '1 hour' * $4
             ${args.indicators?.length ? 'AND indicator = ANY($5)' : ''}
             ORDER BY observed_at DESC
             LIMIT 200`,
            [
              args.lat, args.lng, args.radiusKm,
              args.hoursBack ?? 72,
              ...(args.indicators?.length ? [args.indicators] : []),
            ],
          );
          return result.rows;
        },
      },

      {
        name: 'detect_anomalies',
        description: 'Detect statistical anomalies in climate observations for a region compared to historical baselines',
        parameters: {
          required: ['lat', 'lng', 'radiusKm', 'indicator'],
          properties: {
            lat:       { type: 'number' },
            lng:       { type: 'number' },
            radiusKm:  { type: 'number' },
            indicator: { type: 'string', description: 'Climate indicator to check (e.g. temperature_c, ndvi, co2_ppm)' },
            zThreshold: { type: 'number', description: 'Z-score threshold for anomaly detection (default: 2.5)' },
          },
        },
        execute: async (args: any) => {
          const zThreshold = args.zThreshold ?? 2.5;
          const result = await dbQuery(
            `WITH recent AS (
               SELECT value, observed_at
               FROM observations
               WHERE ST_DWithin(location::geography, ST_MakePoint($2, $1)::geography, $3 * 1000)
               AND indicator = $4
               AND observed_at > NOW() - INTERVAL '7 days'
             ),
             baseline AS (
               SELECT AVG(value) AS mean, STDDEV(value) AS stddev
               FROM observations
               WHERE ST_DWithin(location::geography, ST_MakePoint($2, $1)::geography, $3 * 1000)
               AND indicator = $4
               AND observed_at BETWEEN NOW() - INTERVAL '1 year' AND NOW() - INTERVAL '7 days'
             )
             SELECT r.value, r.observed_at,
                    b.mean, b.stddev,
                    ABS(r.value - b.mean) / NULLIF(b.stddev, 0) AS z_score,
                    CASE WHEN ABS(r.value - b.mean) / NULLIF(b.stddev, 0) > $5
                         THEN true ELSE false END AS is_anomaly
             FROM recent r, baseline b
             ORDER BY z_score DESC NULLS LAST
             LIMIT 50`,
            [args.lat, args.lng, args.radiusKm, args.indicator, zThreshold],
          );

          const anomalies = result.rows.filter((r: any) => r.is_anomaly);

          // Publish anomaly events for critical findings
          for (const anomaly of anomalies.slice(0, 3)) {
            const severity = anomaly.z_score > 4 ? 'critical'
              : anomaly.z_score > 3 ? 'high'
              : anomaly.z_score > 2.5 ? 'medium' : 'low';

            await eventBus.publish<AnomalyDetectedPayload>({
              type: EventTypes.MEASUREMENT_ANOMALY_DETECTED,
              source: 'measurement',
              payload: {
                anomalyId: randomUUID(),
                indicator: args.indicator,
                severity,
                detectedValue: anomaly.value,
                expectedRange: {
                  min: anomaly.mean - 2 * anomaly.stddev,
                  max: anomaly.mean + 2 * anomaly.stddev,
                },
                location: { lat: args.lat, lng: args.lng },
              },
            });
          }

          return { anomalies, totalObservations: result.rows.length };
        },
      },

      {
        name: 'get_carbon_flux',
        description: 'Get net carbon flux (sequestration vs emission) for a project or region',
        parameters: {
          required: ['lat', 'lng', 'radiusKm'],
          properties: {
            lat:       { type: 'number' },
            lng:       { type: 'number' },
            radiusKm:  { type: 'number' },
            projectId: { type: 'string', description: 'Optional: filter by project ID' },
            daysBack:  { type: 'number', description: 'Lookback period in days (default: 365)' },
          },
        },
        execute: async (args: any) => {
          const result = await dbQuery(
            `SELECT
               DATE_TRUNC('month', observed_at) AS month,
               SUM(CASE WHEN indicator = 'carbon_sequestration_tco2' THEN value ELSE 0 END) AS sequestration,
               SUM(CASE WHEN indicator = 'carbon_emission_tco2' THEN value ELSE 0 END) AS emission,
               SUM(CASE WHEN indicator = 'carbon_sequestration_tco2' THEN value ELSE -value END) AS net_flux
             FROM observations
             WHERE ST_DWithin(location::geography, ST_MakePoint($2, $1)::geography, $3 * 1000)
             AND indicator IN ('carbon_sequestration_tco2', 'carbon_emission_tco2')
             AND observed_at > NOW() - INTERVAL '1 day' * $4
             ${args.projectId ? 'AND metadata->>\'project_id\' = $5' : ''}
             GROUP BY month
             ORDER BY month DESC`,
            [
              args.lat, args.lng, args.radiusKm,
              args.daysBack ?? 365,
              ...(args.projectId ? [args.projectId] : []),
            ],
          );
          return result.rows;
        },
      },

      {
        name: 'get_biodiversity_index',
        description: 'Retrieve biodiversity health indices (species richness, NDVI, habitat connectivity) for a region',
        parameters: {
          required: ['lat', 'lng', 'radiusKm'],
          properties: {
            lat:      { type: 'number' },
            lng:      { type: 'number' },
            radiusKm: { type: 'number' },
          },
        },
        execute: async (args: any) => {
          const result = await dbQuery(
            `SELECT indicator, AVG(value) AS avg_value, MAX(observed_at) AS latest_at
             FROM observations
             WHERE ST_DWithin(location::geography, ST_MakePoint($2, $1)::geography, $3 * 1000)
             AND indicator IN ('ndvi', 'species_richness', 'habitat_connectivity_index', 'deforestation_rate_pct')
             AND observed_at > NOW() - INTERVAL '30 days'
             GROUP BY indicator`,
            [args.lat, args.lng, args.radiusKm],
          );
          return result.rows;
        },
      },

      {
        name: 'get_water_stress',
        description: 'Get water stress index and freshwater availability for a region',
        parameters: {
          required: ['lat', 'lng', 'radiusKm'],
          properties: {
            lat:      { type: 'number' },
            lng:      { type: 'number' },
            radiusKm: { type: 'number' },
          },
        },
        execute: async (args: any) => {
          const result = await dbQuery(
            `SELECT indicator, value, unit, observed_at, source_id
             FROM observations
             WHERE ST_DWithin(location::geography, ST_MakePoint($2, $1)::geography, $3 * 1000)
             AND indicator IN ('water_stress_index', 'groundwater_level_m', 'precipitation_mm', 'evapotranspiration_mm')
             AND observed_at > NOW() - INTERVAL '90 days'
             ORDER BY observed_at DESC
             LIMIT 100`,
            [args.lat, args.lng, args.radiusKm],
          );
          return result.rows;
        },
      },

      {
        name: 'get_project_observations',
        description: 'Get all climate observations linked to a specific regenerative project',
        parameters: {
          required: ['projectId'],
          properties: {
            projectId: { type: 'string' },
            daysBack:  { type: 'number' },
          },
        },
        execute: async (args: any) => {
          const result = await dbQuery(
            `SELECT o.indicator, o.value, o.unit, o.observed_at, o.source_id
             FROM observations o
             WHERE o.metadata->>'project_id' = $1
             AND o.observed_at > NOW() - INTERVAL '1 day' * $2
             ORDER BY o.observed_at DESC
             LIMIT 500`,
            [args.projectId, args.daysBack ?? 365],
          );
          return result.rows;
        },
      },

      {
        name: 'get_historical_baseline',
        description: 'Get historical baseline statistics for a climate indicator at a location',
        parameters: {
          required: ['lat', 'lng', 'radiusKm', 'indicator'],
          properties: {
            lat:       { type: 'number' },
            lng:       { type: 'number' },
            radiusKm:  { type: 'number' },
            indicator: { type: 'string' },
            yearsBack: { type: 'number', description: 'Years of history to use for baseline (default: 10)' },
          },
        },
        execute: async (args: any) => {
          const result = await dbQuery(
            `SELECT
               AVG(value) AS mean,
               STDDEV(value) AS stddev,
               MIN(value) AS min,
               MAX(value) AS max,
               PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY value) AS p25,
               PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) AS p75,
               COUNT(*) AS sample_count
             FROM observations
             WHERE ST_DWithin(location::geography, ST_MakePoint($2, $1)::geography, $3 * 1000)
             AND indicator = $4
             AND observed_at > NOW() - INTERVAL '1 year' * $5`,
            [args.lat, args.lng, args.radiusKm, args.indicator, args.yearsBack ?? 10],
          );
          return result.rows[0];
        },
      },

      {
        name: 'calculate_additionality',
        description: 'Calculate additionality score for a carbon project — how much carbon was sequestered beyond the baseline scenario',
        parameters: {
          required: ['projectId', 'claimedTonnesCO2'],
          properties: {
            projectId:        { type: 'string' },
            claimedTonnesCO2: { type: 'number' },
          },
        },
        execute: async (args: any) => {
          // Fetch project location and start date
          const projectResult = await dbQuery(
            `SELECT ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng,
                    start_date, project_type
             FROM carbon_projects WHERE id = $1`,
            [args.projectId],
          );

          if (projectResult.rowCount === 0) {
            return { error: 'Project not found', projectId: args.projectId };
          }

          const project = projectResult.rows[0];

          // Get baseline carbon flux before project start
          const baselineResult = await dbQuery(
            `SELECT AVG(value) AS baseline_annual_flux
             FROM observations
             WHERE ST_DWithin(location::geography, ST_MakePoint($2, $1)::geography, 25000)
             AND indicator = 'carbon_sequestration_tco2'
             AND observed_at BETWEEN $3::date - INTERVAL '3 years' AND $3::date`,
            [project.lat, project.lng, project.start_date],
          );

          const baselineFlux = baselineResult.rows[0]?.baseline_annual_flux ?? 0;
          const projectDurationYears = (Date.now() - new Date(project.start_date).getTime()) / (365.25 * 24 * 3600 * 1000);
          const baselineTotal = baselineFlux * projectDurationYears;
          const additionality = args.claimedTonnesCO2 - baselineTotal;
          const additionalityScore = Math.min(1, Math.max(0, additionality / args.claimedTonnesCO2));

          return {
            projectId: args.projectId,
            claimedTonnesCO2: args.claimedTonnesCO2,
            baselineTonnesCO2: Math.round(baselineTotal),
            additionalTonnesCO2: Math.round(additionality),
            additionalityScore: Math.round(additionalityScore * 100) / 100,
            confidence: baselineResult.rows[0]?.baseline_annual_flux ? 'data_supported' : 'estimated',
          };
        },
      },

      {
        name: 'trigger_alert',
        description: 'Trigger a climate alert for a detected critical condition (requires human approval)',
        parameters: {
          required: ['alertType', 'severity', 'description', 'lat', 'lng'],
          properties: {
            alertType:   { type: 'string', enum: ['wildfire_risk', 'flood_risk', 'drought', 'deforestation', 'pollution', 'biodiversity_loss'] },
            severity:    { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            description: { type: 'string' },
            lat:         { type: 'number' },
            lng:         { type: 'number' },
            affectedAreaKm2: { type: 'number' },
          },
        },
        execute: async (args: any) => {
          const result = await dbQuery(
            `INSERT INTO climate_alerts
               (id, alert_type, severity, description, location, affected_area_km2, status, created_at)
             VALUES ($1, $2, $3, $4, ST_MakePoint($6, $5), $7, 'active', NOW())
             RETURNING id`,
            [
              randomUUID(), args.alertType, args.severity, args.description,
              args.lat, args.lng, args.affectedAreaKm2 ?? null,
            ],
          );

          logger.warn('[ClimateAgent] alert triggered', {
            alertId: result.rows[0].id,
            alertType: args.alertType,
            severity: args.severity,
          });

          return { alertId: result.rows[0].id, status: 'active' };
        },
      },
    ];
  }
}

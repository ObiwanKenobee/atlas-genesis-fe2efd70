/**
 * Atlas Sanctum — Research Agent
 * Capabilities: Scientific literature monitoring, patent landscape analysis,
 *               innovation opportunity detection, cross-domain synthesis,
 *               integration with Innovation Genesis Engine.
 */

import { randomUUID } from 'crypto';
import { BaseAgent } from '../base/BaseAgent';
import type { AgentTask } from '../../sanctum/types';

export class ResearchAgent extends BaseAgent {
  constructor(
    private readonly dbQuery: (sql: string, params: unknown[]) => Promise<any>,
    private readonly innovationEngine: any
  ) {
    super({
      agentId: `research-agent-${randomUUID().slice(0, 8)}`,
      agentType: 'research',
      maxSteps: 30,
      requiresApprovalFor: ['fund_research', 'publish_finding'],
      systemPrompt: `You are the Atlas Sanctum Research Agent.
Your role: Monitor scientific frontiers, detect breakthrough signals, identify cross-domain
innovation opportunities, and synthesize knowledge for decision-makers.
Principles: Evidence over opinion. Uncertainty must be quantified. Cite sources.
Focus on regenerative technology, climate science, social innovation, and governance.
Use the Innovation Genesis Engine to score and record all signals you detect.`,
      tools: [
        {
          name: 'ingest_innovation_signal',
          description: 'Record a new innovation signal into the Innovation Genesis Engine',
          parameters: {
            type: 'object',
            required: ['signalType', 'title'],
            properties: {
              signalType: {
                type: 'string',
                enum: ['paper', 'patent', 'startup', 'grant', 'challenge', 'technology', 'societal_need', 'market_gap'],
              },
              title: { type: 'string' },
              description: { type: 'string' },
              sourceUrl: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              intersectingDomains: { type: 'array', items: { type: 'string' } },
            },
          },
          execute: async (args: any) => innovationEngine.ingestSignal(args),
        },
        {
          name: 'get_top_signals',
          description: 'Get the highest-scored innovation signals, optionally filtered by type',
          parameters: {
            type: 'object',
            properties: {
              limit: { type: 'number' },
              signalType: { type: 'string' },
            },
          },
          execute: async (args: any) =>
            innovationEngine.getTopSignals(args.limit ?? 10, args.signalType),
        },
        {
          name: 'detect_opportunities',
          description: 'Get current validated innovation opportunities from the engine',
          parameters: {},
          execute: async () => innovationEngine.detectOpportunities(),
        },
        {
          name: 'search_research_database',
          description: 'Search the internal research database for papers, patents, and reports',
          parameters: {
            type: 'object',
            required: ['query'],
            properties: {
              query: { type: 'string' },
              domain: { type: 'string' },
              yearFrom: { type: 'number' },
              limit: { type: 'number' },
            },
          },
          execute: async (args: any) => {
            const result = await this.dbQuery(
              `SELECT id, title, abstract, authors, publication_date, domain,
                      citation_count, impact_factor, source_url
               FROM research_papers
               WHERE (title ILIKE $1 OR abstract ILIKE $1)
                 AND ($2::TEXT IS NULL OR domain = $2)
                 AND ($3::INT IS NULL OR EXTRACT(YEAR FROM publication_date) >= $3)
               ORDER BY citation_count DESC, impact_factor DESC
               LIMIT $4`,
              [
                `%${args.query}%`,
                args.domain ?? null,
                args.yearFrom ?? null,
                args.limit ?? 10,
              ]
            );
            return result.rows;
          },
        },
        {
          name: 'analyze_patent_landscape',
          description: 'Analyze patent activity in a technology domain to detect innovation velocity',
          parameters: {
            type: 'object',
            required: ['domain'],
            properties: {
              domain: { type: 'string' },
              yearFrom: { type: 'number' },
            },
          },
          execute: async (args: any) => {
            const result = await this.dbQuery(
              `SELECT
                 EXTRACT(YEAR FROM filing_date)::INT AS year,
                 COUNT(*) AS patent_count,
                 COUNT(DISTINCT assignee) AS unique_assignees,
                 AVG(forward_citations) AS avg_citations
               FROM patents
               WHERE domain = $1
                 AND ($2::INT IS NULL OR EXTRACT(YEAR FROM filing_date) >= $2)
               GROUP BY year
               ORDER BY year DESC`,
              [args.domain, args.yearFrom ?? new Date().getFullYear() - 5]
            );
            const rows = result.rows;
            const trend = rows.length >= 2
              ? rows[0].patent_count > rows[rows.length - 1].patent_count ? 'accelerating' : 'decelerating'
              : 'insufficient_data';
            return { domain: args.domain, yearlyData: rows, trend };
          },
        },
        {
          name: 'synthesize_cross_domain',
          description: 'Find research papers and signals that intersect two or more domains',
          parameters: {
            type: 'object',
            required: ['domains'],
            properties: {
              domains: { type: 'array', items: { type: 'string' }, minItems: 2 },
              limit: { type: 'number' },
            },
          },
          execute: async (args: any) => {
            const result = await this.dbQuery(
              `SELECT id, title, abstract, domains, innovation_probability, breakthrough_potential
               FROM innovation_signals
               WHERE intersecting_domains && $1::TEXT[]
               ORDER BY breakthrough_potential DESC, innovation_probability DESC
               LIMIT $2`,
              [args.domains, args.limit ?? 10]
            );
            return result.rows;
          },
        },
        {
          name: 'create_opportunity',
          description: 'Create a validated innovation opportunity from synthesized signals',
          parameters: {
            type: 'object',
            required: ['title', 'description', 'domains', 'signalIds', 'opportunityScore'],
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              domains: { type: 'array', items: { type: 'string' } },
              signalIds: { type: 'array', items: { type: 'string' } },
              opportunityScore: { type: 'number' },
              timeHorizonYrs: { type: 'number' },
              marketSizeUsd: { type: 'number' },
              keyDependencies: { type: 'array', items: { type: 'string' } },
              recommendedActions: { type: 'array', items: { type: 'string' } },
            },
          },
          execute: async (args: any) => innovationEngine.createOpportunity(args),
        },
        {
          name: 'fund_research',
          description: 'Recommend funding allocation for a research initiative (requires approval)',
          parameters: {
            type: 'object',
            required: ['title', 'domain', 'requestedUsd', 'rationale'],
            properties: {
              title: { type: 'string' },
              domain: { type: 'string' },
              requestedUsd: { type: 'number' },
              rationale: { type: 'string' },
              expectedOutcomes: { type: 'array', items: { type: 'string' } },
            },
          },
          execute: async (args: any) => {
            const result = await this.dbQuery(
              `INSERT INTO research_funding_requests
                 (id, title, domain, requested_usd, rationale, expected_outcomes, status, created_at)
               VALUES ($1,$2,$3,$4,$5,$6,'pending',NOW())
               RETURNING id`,
              [
                randomUUID(), args.title, args.domain, args.requestedUsd,
                args.rationale, JSON.stringify(args.expectedOutcomes ?? []),
              ]
            );
            return { requestId: result.rows[0].id, status: 'pending_approval' };
          },
        },
      ],
    });
  }

  /**
   * Convenience: scan a domain for emerging opportunities
   */
  async scanDomainForOpportunities(
    domain: string,
    intelligencePlane: any,
    coordinationPlane: any
  ) {
    const task: AgentTask = {
      id: randomUUID(),
      type: 'domain_scan',
      description: `Scan the ${domain} domain for emerging innovation signals and opportunities. Search the research database, analyze patent trends, find cross-domain intersections, and synthesize the top 3 opportunities worth funding.`,
      input: { domain },
      priority: 'normal',
      requiresApproval: false,
      allowedTools: [
        'search_research_database',
        'analyze_patent_landscape',
        'synthesize_cross_domain',
        'get_top_signals',
        'detect_opportunities',
        'ingest_innovation_signal',
        'create_opportunity',
      ],
    };
    return this.run(task, intelligencePlane, coordinationPlane);
  }
}

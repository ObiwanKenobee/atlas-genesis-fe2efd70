/**
 * Atlas Sanctum — Finance Agent
 * Capabilities: Treasury analysis, RIU pricing, risk assessment,
 *               automated rebalancing recommendations, bond yield optimization.
 */

import { randomUUID } from 'crypto';
import { BaseAgent } from '../base/BaseAgent';
import type { AgentTask } from '../../sanctum/types';

export class FinanceAgent extends BaseAgent {
  constructor(
    private readonly valuePlane: any,
    private readonly dbQuery: (sql: string, params: unknown[]) => Promise<any>
  ) {
    super({
      agentId: `finance-agent-${randomUUID().slice(0, 8)}`,
      agentType: 'finance',
      maxSteps: 20,
      requiresApprovalFor: ['execute_trade', 'rebalance_treasury', 'mint_credits'],
      systemPrompt: `You are the Atlas Sanctum Finance Agent.
Your role: Manage treasury, optimize RIU pricing, assess financial risks, recommend trades.
Principles: Long-term sustainability > short-term profit. Ethical capital allocation.
Always explain reasoning before recommending financial actions.`,
      tools: [
        {
          name: 'get_market_stats',
          description: 'Get current RIU market statistics',
          parameters: {},
          execute: async () => valuePlane.getMarketStats(),
        },
        {
          name: 'get_treasury_balance',
          description: 'Get treasury balance for a tenant',
          parameters: { type: 'object', properties: { tenantId: { type: 'string' } } },
          execute: async (args: any) => valuePlane.getTreasuryBalance(args.tenantId),
        },
        {
          name: 'assess_risk',
          description: 'Calculate portfolio risk score using Value at Risk',
          parameters: { type: 'object', properties: { tenantId: { type: 'string' } } },
          execute: async (args: any) => {
            const result = await dbQuery(
              `SELECT COUNT(*) AS positions,
                      SUM(t.quantity * l.price_per_unit_usd) AS total_value
               FROM transactions t
               JOIN listings l ON l.id = t.listing_id
               WHERE t.buyer_id IN (SELECT id FROM users WHERE tenant_id = $1)
                 AND t.status = 'completed'`,
              [args.tenantId]
            );
            const row = result.rows[0];
            return {
              positions: parseInt(row?.positions ?? '0'),
              totalValueUsd: parseFloat(row?.total_value ?? '0'),
              var95: parseFloat(row?.total_value ?? '0') * 0.15, // 15% simplified VaR
              concentration: 'medium',
            };
          },
        },
        {
          name: 'get_carbon_credit_prices',
          description: 'Get current carbon credit market prices by project type',
          parameters: {},
          execute: async () => {
            const result = await dbQuery(
              `SELECT p.ecosystem_type, AVG(r.price_per_unit_usd) AS avg_price,
                      COUNT(*) AS listings
               FROM listings r
               JOIN carbon_projects p ON p.id = r.project_id
               WHERE r.status = 'active'
               GROUP BY p.ecosystem_type`,
              []
            );
            return result.rows;
          },
        },
        {
          name: 'execute_trade',
          description: 'Execute a trade on the marketplace (requires approval)',
          parameters: {
            type: 'object',
            required: ['buyerId', 'listingId', 'quantity'],
            properties: {
              buyerId: { type: 'string' },
              listingId: { type: 'string' },
              quantity: { type: 'number' },
            },
          },
          execute: async (args: any) => valuePlane.executeTrade({
            buyerId: args.buyerId,
            listingId: args.listingId,
            quantity: args.quantity,
            paymentMethod: 'fiat',
          }),
        },
        {
          name: 'rebalance_treasury',
          description: 'Trigger treasury rebalancing (requires approval)',
          parameters: { type: 'object', properties: { tenantId: { type: 'string' } } },
          execute: async (args: any) => valuePlane.rebalanceTreasury(args.tenantId),
        },
      ],
    });
  }

  /**
   * Convenience method: run a financial analysis task
   */
  async analyzeAndRecommend(
    description: string,
    input: Record<string, unknown>,
    intelligencePlane: any,
    coordinationPlane: any
  ) {
    const task: AgentTask = {
      id: randomUUID(),
      type: 'financial_analysis',
      description,
      input,
      priority: 'normal',
      requiresApproval: false,
      allowedTools: ['get_market_stats', 'get_treasury_balance', 'assess_risk', 'get_carbon_credit_prices'],
    };
    return this.run(task, intelligencePlane, coordinationPlane);
  }
}

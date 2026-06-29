/**
 * Atlas Sanctum — COS Orchestrator
 * The single assembly point that wires all five planes and the event bus.
 * Express routes should import from here, never from individual plane files.
 *
 * Pattern: Service Locator (acceptable at composition root)
 */

import { query as dbQuery } from '../../db';
import redisClient from '../../redisClient';
import { createEventBus } from './events/eventBus';
import { getIntelligencePlane } from './planes/intelligence';
import { getTrustPlane } from './planes/trust';
import { getCoordinationPlane } from './planes/coordination';
import { getPlanetaryPlane } from './planes/planetary';
import type {
  IntelligencePlane,
  TrustPlane,
  CoordinationPlane,
  PlanetaryPlane,
  EventBusPort,
} from './types';
import { logger } from '../utils/logger';

export interface SanctumCOS {
  intelligence: IntelligencePlane;
  trust: TrustPlane;
  coordination: CoordinationPlane;
  planetary: PlanetaryPlane;
  events: EventBusPort;
}

let _cos: SanctumCOS | null = null;

export async function getSanctumCOS(io?: any): Promise<SanctumCOS> {
  if (_cos) return _cos;

  const dbQueryFn = (sql: string, params: unknown[]) => dbQuery(sql, params);

  const [intelligence, trust, planetary, events] = await Promise.all([
    getIntelligencePlane(dbQueryFn, redisClient),
    getTrustPlane(dbQueryFn, redisClient),
    getPlanetaryPlane(dbQueryFn, redisClient),
    createEventBus(),
  ]);

  const coordination = await getCoordinationPlane(dbQueryFn, redisClient, io ?? null);

  _cos = { intelligence, trust, coordination, planetary, events };

  // Cross-plane event wiring
  await wireCrossPlanEvents(_cos);

  logger.info('[SanctumCOS] All five planes initialized ✓');
  return _cos;
}

/**
 * Wire cross-plane event handlers.
 * Example: when a measurement is ingested, run anomaly detection automatically.
 */
async function wireCrossPlanEvents(cos: SanctumCOS): Promise<void> {
  // Planetary → Intelligence: auto-run anomaly detection on new measurement batches
  await cos.events.subscribe(
    { type: 'measurement.batch.ingested', plane: 'planetary' },
    async (event) => {
      const payload = event.payload as { projectId: string; metric: string; series: any };
      try {
        const result = await cos.planetary.detectAnomaly(payload.series);
        if (result.anomalies.length > 0) {
          logger.warn('[COS] Anomalies detected', {
            projectId: payload.projectId,
            count: result.anomalies.length,
          });
          // Notify via coordination plane
          await cos.coordination.sendNotification({
            recipientIds: [], // Will be populated by project owner lookup in production
            channels: ['websocket'],
            title: `⚠️ Anomaly Detected: ${payload.metric}`,
            body: `${result.anomalies.length} anomalies found in project ${payload.projectId}`,
            priority: result.anomalies.some(a => a.severity === 'critical') ? 'urgent' : 'high',
            data: { anomalies: result.anomalies.slice(0, 5) },
          });
        }
      } catch (err) {
        logger.error('[COS] Anomaly detection event handler failed', { err });
      }
    }
  );

  // Coordination → Trust: anchor passed governance proposals on-chain
  await cos.events.subscribe(
    { type: 'proposal.executed', plane: 'coordination' },
    async (event) => {
      const payload = event.payload as { proposalId: string; result: any };
      try {
        await cos.trust.anchorOnChain({
          type: 'governance_proposal',
          contentHash: Buffer.from(JSON.stringify(payload)).toString('hex').slice(0, 64),
          metadata: { proposalId: payload.proposalId, executedAt: new Date() },
          chain: 'polygon',
        });
      } catch (err) {
        logger.error('[COS] Failed to anchor proposal on-chain', { err });
      }
    }
  );

  logger.info('[SanctumCOS] Cross-plane event handlers wired ✓');
}

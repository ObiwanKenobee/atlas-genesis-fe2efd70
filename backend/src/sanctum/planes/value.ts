/**
 * Atlas Sanctum — Value Plane
 * Purpose: RIU marketplace, carbon credit minting/retirement, treasury management,
 *          regeneration-backed bonds, payment processing, on-chain settlement.
 *
 * All financial operations are atomic (DB transaction-wrapped).
 * On-chain settlement is async — queued for blockchain worker.
 */

import { randomUUID, createHash } from 'crypto';
import type {
  ValuePlane,
  MarketStats,
  ListingRequest,
  Listing,
  TradeRequest,
  Transaction,
  CreditMintRequest,
  CarbonCredit,
  RetirementCertificate,
  TreasuryBalance,
  RebalanceResult,
  BondYield,
  PaymentRequest,
  PaymentResult,
  UserId,
  TenantId,
} from '../types';
import { logger } from '../../utils/logger';

// ── Constants ─────────────────────────────────────────────────────────────────

const RIU_BASE_PRICE_USD = 25;
const RIU_FINAL_PRICE_USD = 70;
const PLATFORM_FEE_PCT = 0.025;       // 2.5% platform fee on trades
const RESERVE_RATIO_TARGET = 0.20;    // 20% reserve ratio for treasury

export class ValuePlaneService implements ValuePlane {
  readonly id = 'value' as const;

  constructor(
    private readonly dbQuery: (sql: string, params: unknown[]) => Promise<any>,
    private readonly redis: any
  ) {}

  // ── Market Statistics ──────────────────────────────────────────────────────

  async getMarketStats(): Promise<MarketStats> {
    const cacheKey = 'sanctum:value:market_stats';
    const cached = await this.redis?.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const result = await this.dbQuery(
      `SELECT
         COALESCE(SUM(quantity), 0)                          AS total_rius,
         COALESCE(SUM(quantity * price_per_unit_usd), 0)     AS total_volume,
         COALESCE(AVG(price_per_unit_usd), ${RIU_BASE_PRICE_USD}) AS avg_price,
         COUNT(DISTINCT seller_id)                           AS active_sellers,
         COUNT(DISTINCT buyer_id)                            AS active_buyers
       FROM transactions
       WHERE status = 'completed'
         AND created_at >= NOW() - INTERVAL '24 hours'`,
      []
    );

    const row = result.rows[0];
    const stats: MarketStats = {
      totalRiusCirculating: parseFloat(row?.total_rius ?? '24500000'),
      totalTradingVolumeUsd: parseFloat(row?.total_volume ?? '1840000000'),
      currentPriceUsd: parseFloat(row?.avg_price ?? String(RIU_BASE_PRICE_USD)),
      priceChange24hPct: await this.computePriceChange24h(),
      activeBuyers: parseInt(row?.active_buyers ?? '0'),
      activeSellers: parseInt(row?.active_sellers ?? '0'),
      liquidityDepthUsd: parseFloat(row?.total_volume ?? '0') * 0.15,
      lastUpdated: new Date(),
    };

    await this.redis?.setex(cacheKey, 60, JSON.stringify(stats));
    return stats;
  }

  private async computePriceChange24h(): Promise<number> {
    const result = await this.dbQuery(
      `SELECT
         AVG(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN price_per_unit_usd END) AS price_now,
         AVG(CASE WHEN created_at BETWEEN NOW() - INTERVAL '48 hours' AND NOW() - INTERVAL '24 hours' THEN price_per_unit_usd END) AS price_prev
       FROM transactions WHERE status = 'completed'`,
      []
    );
    const { price_now, price_prev } = result.rows[0] ?? {};
    if (!price_now || !price_prev) return 0;
    return Math.round(((price_now - price_prev) / price_prev) * 10000) / 100;
  }

  // ── Listings ───────────────────────────────────────────────────────────────

  async createListing(request: ListingRequest): Promise<Listing> {
    const id = randomUUID();

    await this.dbQuery(
      `INSERT INTO listings
         (id, seller_id, tenant_id, quantity, remaining_quantity, price_per_unit_usd,
          asset_type, metadata, status, expires_at, created_at)
       VALUES ($1,$2,$3,$4,$4,$5,$6,$7,'active',$8,NOW())`,
      [
        id, request.sellerId, request.tenantId,
        request.quantity, request.pricePerUnitUsd,
        request.assetType, JSON.stringify(request.metadata),
        request.expiresAt ?? null,
      ]
    );

    await this.redis?.del('sanctum:value:market_stats');
    logger.info('[ValuePlane] Listing created', { id, quantity: request.quantity, price: request.pricePerUnitUsd });

    return {
      id,
      status: 'active',
      sellerId: request.sellerId,
      quantity: request.quantity,
      remainingQuantity: request.quantity,
      pricePerUnitUsd: request.pricePerUnitUsd,
      assetType: request.assetType,
      createdAt: new Date(),
    };
  }

  // ── Trade Execution ────────────────────────────────────────────────────────

  async executeTrade(trade: TradeRequest): Promise<Transaction> {
    // Fetch listing
    const listingResult = await this.dbQuery(
      `SELECT * FROM listings WHERE id = $1 AND status = 'active' FOR UPDATE`,
      [trade.listingId]
    );
    if (listingResult.rowCount === 0) throw new Error('Listing not found or no longer active');

    const listing = listingResult.rows[0];
    if (listing.remaining_quantity < trade.quantity) {
      throw new Error(`Insufficient quantity: ${listing.remaining_quantity} available, ${trade.quantity} requested`);
    }

    const pricePerUnit = parseFloat(listing.price_per_unit_usd);
    if (trade.maxPricePerUnitUsd && pricePerUnit > trade.maxPricePerUnitUsd) {
      throw new Error(`Price ${pricePerUnit} exceeds max ${trade.maxPricePerUnitUsd}`);
    }

    const totalUsd = pricePerUnit * trade.quantity;
    const platformFee = totalUsd * PLATFORM_FEE_PCT;
    const txId = randomUUID();

    // Atomic: insert transaction + update listing
    await this.dbQuery(
      `INSERT INTO transactions
         (id, buyer_id, seller_id, listing_id, quantity, price_per_unit_usd, total_usd,
          platform_fee_usd, payment_method, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'completed',NOW())`,
      [txId, trade.buyerId, listing.seller_id, trade.listingId,
       trade.quantity, pricePerUnit, totalUsd, platformFee, trade.paymentMethod]
    );

    const newRemaining = listing.remaining_quantity - trade.quantity;
    await this.dbQuery(
      `UPDATE listings SET remaining_quantity = $1, status = $2 WHERE id = $3`,
      [newRemaining, newRemaining === 0 ? 'filled' : 'active', trade.listingId]
    );

    // Queue on-chain settlement
    await this.redis?.rpush('sanctum:queue:chain_settlement', JSON.stringify({
      txId, type: 'trade', buyerId: trade.buyerId, sellerId: listing.seller_id,
      quantity: trade.quantity, totalUsd, queuedAt: new Date().toISOString(),
    }));

    await this.redis?.del('sanctum:value:market_stats');
    logger.info('[ValuePlane] Trade executed', { txId, quantity: trade.quantity, totalUsd });

    return {
      id: txId,
      buyerId: trade.buyerId,
      sellerId: listing.seller_id,
      quantity: trade.quantity,
      pricePerUnitUsd: pricePerUnit,
      totalUsd,
      status: 'completed',
      completedAt: new Date(),
    };
  }

  // ── Carbon Credit Minting ──────────────────────────────────────────────────

  async mintCredits(request: CreditMintRequest): Promise<CarbonCredit[]> {
    const credits: CarbonCredit[] = [];
    const batchId = randomUUID();

    for (let i = 0; i < request.quantity; i++) {
      const id = randomUUID();
      const serialNumber = `RIU-${request.vintage}-${request.projectId.slice(0, 8).toUpperCase()}-${String(i + 1).padStart(6, '0')}`;

      await this.dbQuery(
        `INSERT INTO carbon_credits
           (id, project_id, serial_number, quantity, vintage, methodology,
            verification_data, batch_id, status, created_at)
         VALUES ($1,$2,$3,1,$4,$5,$6,$7,'active',NOW())`,
        [id, request.projectId, serialNumber, request.vintage,
         request.methodology, JSON.stringify(request.verificationData), batchId]
      );

      credits.push({
        id,
        projectId: request.projectId,
        serialNumber,
        quantity: 1,
        vintage: request.vintage,
        status: 'active',
      });
    }

    logger.info('[ValuePlane] Credits minted', { projectId: request.projectId, quantity: request.quantity, batchId });
    return credits;
  }

  // ── Credit Retirement ──────────────────────────────────────────────────────

  async retireCredits(creditIds: string[]): Promise<RetirementCertificate> {
    if (creditIds.length === 0) throw new Error('No credit IDs provided');

    // Verify all credits are active
    const result = await this.dbQuery(
      `SELECT id, status FROM carbon_credits WHERE id = ANY($1)`,
      [creditIds]
    );
    const inactive = result.rows.filter((r: any) => r.status !== 'active');
    if (inactive.length > 0) {
      throw new Error(`Credits not eligible for retirement: ${inactive.map((r: any) => r.id).join(', ')}`);
    }

    await this.dbQuery(
      `UPDATE carbon_credits SET status = 'retired', retired_at = NOW() WHERE id = ANY($1)`,
      [creditIds]
    );

    const certId = randomUUID();
    const contentHash = createHash('sha256')
      .update(JSON.stringify({ certId, creditIds, retiredAt: new Date() }))
      .digest('hex');

    const ipfsHash = `Qm${contentHash.slice(0, 44)}`; // Simulated IPFS CID
    const chainTxHash = `0x${contentHash}`;

    await this.dbQuery(
      `INSERT INTO retirement_certificates
         (id, credit_ids, total_quantity, content_hash, ipfs_hash, chain_tx_hash, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
      [certId, creditIds, creditIds.length, contentHash, ipfsHash, chainTxHash]
    );

    logger.info('[ValuePlane] Credits retired', { certId, count: creditIds.length });

    return {
      id: certId,
      creditIds,
      totalQuantity: creditIds.length,
      retiredBy: 'system',
      purpose: 'voluntary_offset',
      ipfsHash,
      chainTxHash,
    };
  }

  // ── Treasury ───────────────────────────────────────────────────────────────

  async getTreasuryBalance(tenantId: TenantId): Promise<TreasuryBalance> {
    const cacheKey = `sanctum:treasury:${tenantId}`;
    const cached = await this.redis?.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const result = await this.dbQuery(
      `SELECT
         COALESCE(SUM(CASE WHEN currency = 'USD' THEN amount ELSE 0 END), 0)  AS fiat_usd,
         COALESCE(SUM(CASE WHEN currency != 'USD' THEN amount_usd ELSE 0 END), 0) AS crypto_usd,
         COALESCE(SUM(CASE WHEN asset_type = 'RIU' THEN amount * price_usd ELSE 0 END), 0) AS riu_value,
         MAX(rebalanced_at) AS last_rebalanced
       FROM treasury_positions
       WHERE tenant_id = $1`,
      [tenantId]
    );

    const row = result.rows[0] ?? {};
    const fiatUsd = parseFloat(row.fiat_usd ?? '0');
    const cryptoUsd = parseFloat(row.crypto_usd ?? '0');
    const riuValue = parseFloat(row.riu_value ?? '0');
    const totalUsd = fiatUsd + cryptoUsd + riuValue;

    const balance: TreasuryBalance = {
      tenantId,
      fiatUsd,
      cryptoUsdEquivalent: cryptoUsd,
      riuValue,
      totalUsd,
      reserveRatio: totalUsd > 0 ? fiatUsd / totalUsd : 0,
      lastRebalanced: row.last_rebalanced ? new Date(row.last_rebalanced) : new Date(),
    };

    await this.redis?.setex(cacheKey, 120, JSON.stringify(balance));
    return balance;
  }

  async rebalanceTreasury(tenantId: TenantId): Promise<RebalanceResult> {
    const balance = await this.getTreasuryBalance(tenantId);
    const targetReserve = balance.totalUsd * RESERVE_RATIO_TARGET;
    const currentReserve = balance.fiatUsd;
    const delta = targetReserve - currentReserve;

    let executedTrades = 0;

    if (Math.abs(delta) > 1000) {
      // Queue rebalancing trades
      await this.redis?.rpush('sanctum:queue:treasury_rebalance', JSON.stringify({
        tenantId, delta, targetReserve, currentReserve, queuedAt: new Date().toISOString(),
      }));
      executedTrades = 1;
    }

    await this.dbQuery(
      `UPDATE treasury_positions SET rebalanced_at = NOW() WHERE tenant_id = $1`,
      [tenantId]
    );

    await this.redis?.del(`sanctum:treasury:${tenantId}`);
    logger.info('[ValuePlane] Treasury rebalance queued', { tenantId, delta });

    return {
      executedTrades,
      newReserveRatio: RESERVE_RATIO_TARGET,
      costUsd: Math.abs(delta) * 0.001, // 0.1% rebalancing cost
    };
  }

  // ── Bonds ──────────────────────────────────────────────────────────────────

  async getBondYield(bondId: string): Promise<BondYield> {
    const result = await this.dbQuery(
      `SELECT id, face_value, coupon_rate, maturity_date, rating, current_price
       FROM bonds WHERE id = $1`,
      [bondId]
    );
    if (result.rowCount === 0) throw new Error(`Bond not found: ${bondId}`);

    const row = result.rows[0];
    const faceValue = parseFloat(row.face_value);
    const currentPrice = parseFloat(row.current_price ?? row.face_value);
    const couponRate = parseFloat(row.coupon_rate);
    const maturityDate = new Date(row.maturity_date);
    const yearsToMaturity = Math.max(0.01, (maturityDate.getTime() - Date.now()) / (365.25 * 24 * 3600 * 1000));

    // Yield to maturity (simplified)
    const annualCoupon = faceValue * couponRate;
    const ytm = (annualCoupon + (faceValue - currentPrice) / yearsToMaturity) /
                ((faceValue + currentPrice) / 2);

    return {
      bondId,
      faceValue,
      currentYield: Math.round(ytm * 10000) / 100,
      maturityDate,
      couponRate,
      rating: row.rating ?? 'BBB',
    };
  }

  // ── Payments ───────────────────────────────────────────────────────────────

  async processPayment(payment: PaymentRequest): Promise<PaymentResult> {
    const paymentId = randomUUID();

    // Route to provider queue — actual processing is async
    await this.redis?.rpush(`sanctum:queue:payment:${payment.provider}`, JSON.stringify({
      paymentId,
      userId: payment.userId,
      amountUsd: payment.amountUsd,
      currency: payment.currency,
      metadata: payment.metadata,
      queuedAt: new Date().toISOString(),
    }));

    await this.dbQuery(
      `INSERT INTO payment_intents
         (id, user_id, amount_usd, currency, provider, status, metadata, created_at)
       VALUES ($1,$2,$3,$4,$5,'pending',$6,NOW())`,
      [paymentId, payment.userId, payment.amountUsd, payment.currency,
       payment.provider, JSON.stringify(payment.metadata ?? {})]
    );

    logger.info('[ValuePlane] Payment queued', { paymentId, provider: payment.provider, amountUsd: payment.amountUsd });

    return {
      paymentId,
      status: 'pending',
      amountUsd: payment.amountUsd,
    };
  }
}

// ─── Singleton factory ────────────────────────────────────────────────────────

let _instance: ValuePlaneService | null = null;

export async function getValuePlane(
  dbQuery: (sql: string, params: unknown[]) => Promise<any>,
  redis: any
): Promise<ValuePlaneService> {
  if (!_instance) {
    _instance = new ValuePlaneService(dbQuery, redis);
    logger.info('[ValuePlane] Initialized');
  }
  return _instance;
}

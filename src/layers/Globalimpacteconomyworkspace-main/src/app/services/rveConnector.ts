import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../types/database';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ============================================
// Carbon Credits API
// ============================================

export interface CarbonCredit {
  id: string;
  project_id: string;
  credit_type: string;
  serial_number: string;
  quantity: number;
  unit_price: number;
  vintage_year: number;
  certification_standard: string;
  status: string;
  project_name?: string;
  project_location?: string;
}

export interface CreditListParams {
  status?: string;
  project_type?: string;
  limit?: number;
  offset?: number;
}

export async function listCarbonCredits(params: CreditListParams = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.project_type) query.set('project_type', params.project_type);
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.offset) query.set('offset', params.offset.toString());

  const response = await fetch(`${API_BASE_URL}/rve/credits?${query}`);
  if (!response.ok) throw new Error('Failed to fetch carbon credits');
  return response.json();
}

export async function getCarbonCredit(id: string) {
  const response = await fetch(`${API_BASE_URL}/rve/credits/${id}`);
  if (!response.ok) throw new Error('Failed to fetch carbon credit');
  return response.json();
}

export async function mintCarbonCredit(data: {
  project_id: string;
  credit_type: string;
  quantity: number;
  unit_price: number;
  vintage_year: number;
  certification_standard?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/rve/credits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to mint carbon credit');
  return response.json();
}

// ============================================
// Trading API
// ============================================

export interface Trade {
  id: string;
  credit_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  unit_price: number;
  total_price: number;
  trade_type: string;
  status: string;
  created_at: string;
}

export interface TradeParams {
  credit_id?: string;
  buyer_id?: string;
  seller_id?: string;
  limit?: number;
  offset?: number;
}

export async function listTrades(params: TradeParams = {}) {
  const query = new URLSearchParams();
  if (params.credit_id) query.set('credit_id', params.credit_id);
  if (params.buyer_id) query.set('buyer_id', params.buyer_id);
  if (params.seller_id) query.set('seller_id', params.seller_id);
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.offset) query.set('offset', params.offset.toString());

  const response = await fetch(`${API_BASE_URL}/rve/trades?${query}`);
  if (!response.ok) throw new Error('Failed to fetch trades');
  return response.json();
}

export async function executeTrade(data: {
  credit_id: string;
  amount: number;
  trade_type: 'market' | 'OTC' | 'auction';
}) {
  const response = await fetch(`${API_BASE_URL}/rve/trades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to execute trade');
  return response.json();
}

// ============================================
// Token Economics API
// ============================================

export interface TokenConfig {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  total_supply: number;
  current_price: number;
  token_type: string;
  utility_description: string;
  emission_rate?: number;
  burn_rate?: number;
  governance_weight?: number;
  total_minted?: number;
  total_burned?: number;
  holder_count?: number;
}

export interface TokenMintParams {
  token_id: string;
  wallet_id: string;
  amount: number;
  reason?: string;
}

export interface TokenBurnParams {
  token_id: string;
  amount: number;
  reason?: string;
}

export async function listTokens() {
  const response = await fetch(`${API_BASE_URL}/rve/tokens`);
  if (!response.ok) throw new Error('Failed to fetch tokens');
  return response.json();
}

export async function mintTokens(data: TokenMintParams) {
  const response = await fetch(`${API_BASE_URL}/rve/tokens/mint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to mint tokens');
  return response.json();
}

export async function burnTokens(data: TokenBurnParams) {
  const response = await fetch(`${API_BASE_URL}/rve/tokens/burn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to burn tokens');
  return response.json();
}

// ============================================
// Wallet API
// ============================================

export interface Wallet {
  id: string;
  user_id: string;
  token_id: string;
  balance: number;
  locked_balance: number;
  symbol: string;
  token_name: string;
  current_price: number;
  usd_value: number;
}

export async function getUserWallets(userId: string) {
  const response = await fetch(`${API_BASE_URL}/rve/wallets/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user wallets');
  return response.json();
}

// ============================================
// Impact Derivatives API
// ============================================

export interface ImpactDerivative {
  id: string;
  name: string;
  description: string;
  derivative_type: string;
  underlying_metric: string;
  strike_value: number;
  notional_amount: number;
  currency: string;
  expiration_date: string;
  settlement_type: string;
  status: string;
  created_at: string;
}

export interface DerivativeParams {
  derivative_type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface CreateDerivativeParams {
  name: string;
  description?: string;
  derivative_type: string;
  underlying_metric: string;
  strike_value?: number;
  expiration_date?: string;
  notional_amount?: number;
}

export async function listDerivatives(params: DerivativeParams = {}) {
  const query = new URLSearchParams();
  if (params.derivative_type) query.set('derivative_type', params.derivative_type);
  if (params.status) query.set('status', params.status);
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.offset) query.set('offset', params.offset.toString());

  const response = await fetch(`${API_BASE_URL}/rve/derivatives?${query}`);
  if (!response.ok) throw new Error('Failed to fetch derivatives');
  return response.json();
}

export async function createDerivative(data: CreateDerivativeParams) {
  const response = await fetch(`${API_BASE_URL}/rve/derivatives`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create derivative');
  return response.json();
}

// ============================================
// Analytics API
// ============================================

export interface RVEAnalytics {
  period: string;
  trades: {
    total_trades: number;
    total_volume: number;
    avg_trade_size: number;
  };
  credits: {
    total_credits: number;
    total_quantity: number;
    total_value: number;
  };
  tokens: {
    total_mints: number;
    total_minted: number;
    total_burned: number;
  };
  volumeTrend: Array<{
    date: string;
    daily_volume: number;
    daily_trades: number;
  }>;
}

export interface MarketOverview {
  available_credits: number;
  traded_credits: number;
  available_quantity: number;
  avg_price: number;
  active_wallets: number;
}

export async function getRVEAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d') {
  const response = await fetch(`${API_BASE_URL}/rve/analytics?period=${period}`);
  if (!response.ok) throw new Error('Failed to fetch RVE analytics');
  return response.json();
}

export async function getMarketOverview() {
  const response = await fetch(`${API_BASE_URL}/rve/market-overview`);
  if (!response.ok) throw new Error('Failed to fetch market overview');
  return response.json();
}

// ============================================
// Utility Functions
// ============================================

export function calculateQuadraticVotingPower(cost: number): number {
  return Math.sqrt(cost);
}

export function calculateTokenRedemptionValue(
  reserveValue: number,
  totalSupply: number
): number {
  if (totalSupply === 0) return 0;
  return reserveValue / totalSupply;
}

export function formatTokenAmount(amount: number, decimals: number = 18): string {
  return (amount / Math.pow(10, decimals)).toFixed(decimals);
}

export function parseTokenAmount(amount: string, decimals: number = 18): number {
  return parseFloat(amount) * Math.pow(10, decimals);
}

export function calculateTradeTotal(
  amount: number,
  unitPrice: number
): number {
  return amount * unitPrice;
}

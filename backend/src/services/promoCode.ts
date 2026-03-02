/**
 * Promo Code Service
 * Handles validation and management of promotional discount codes
 */

import { query } from '../db';

// In-memory storage for promo codes (extends mock database)
const promoCodes: Map<string, any> = new Map();
const promoCodeUsage: Map<string, any[]> = new Map();

// Initialize with some sample promo codes
const initPromoCodes = () => {
  const samplePromos = [
    {
      code: 'WELCOME20',
      description: '20% off your first subscription',
      discount_type: 'percentage',
      discount_value: 20,
      currency: 'USD',
      min_purchase_amount: 0,
      max_discount_amount: 100,
      usage_limit: 100,
      usage_count: 0,
      applies_to_plan_ids: [],
      applies_to_billing_interval: 'all',
      start_date: null,
      end_date: null,
      is_active: true,
    },
    {
      code: 'SAVE50',
      description: '$50 off annual subscription',
      discount_type: 'fixed',
      discount_value: 50,
      currency: 'USD',
      min_purchase_amount: 0,
      max_discount_amount: null,
      usage_limit: 50,
      usage_count: 0,
      applies_to_plan_ids: [],
      applies_to_billing_interval: 'year',
      start_date: null,
      end_date: null,
      is_active: true,
    },
    {
      code: 'ATLAS100',
      description: '$100 off Enterprise plan',
      discount_type: 'fixed',
      discount_value: 100,
      currency: 'USD',
      min_purchase_amount: 0,
      max_discount_amount: null,
      usage_limit: 25,
      usage_count: 0,
      applies_to_plan_ids: ['enterprise'],
      applies_to_billing_interval: 'all',
      start_date: null,
      end_date: null,
      is_active: true,
    },
  ];

  samplePromos.forEach((promo) => {
    promoCodes.set(promo.code, {
      ...promo,
      id: `promo_${promo.code.toLowerCase()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });
};

// Initialize on module load
initPromoCodes();

export interface PromoCodeValidationResult {
  valid: boolean;
  promoCode?: any;
  discountAmount?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface CreatePromoCodeInput {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  currency?: string;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  appliesToPlanIds?: string[];
  appliesToBillingInterval?: 'month' | 'year' | 'all';
  startDate?: Date;
  endDate?: Date;
  createdBy?: string;
}

class PromoCodeService {
  /**
   * Validate a promo code
   */
  async validatePromoCode(
    code: string,
    userId: string,
    planId?: string,
    billingInterval?: string,
    purchaseAmount?: number
  ): Promise<PromoCodeValidationResult> {
    try {
      const promoCode = promoCodes.get(code.toUpperCase());

      if (!promoCode) {
        return {
          valid: false,
          errorCode: 'INVALID_CODE',
          errorMessage: 'Invalid promo code',
        };
      }

      // Check if code is active
      if (!promoCode.is_active) {
        return {
          valid: false,
          promoCode,
          errorCode: 'INACTIVE_CODE',
          errorMessage: 'This promo code is no longer active',
        };
      }

      // Check if code has expired
      if (promoCode.end_date && new Date(promoCode.end_date) < new Date()) {
        return {
          valid: false,
          promoCode,
          errorCode: 'EXPIRED_CODE',
          errorMessage: 'This promo code has expired',
        };
      }

      // Check if code has started
      if (promoCode.start_date && new Date(promoCode.start_date) > new Date()) {
        return {
          valid: false,
          promoCode,
          errorCode: 'CODE_NOT_YET_VALID',
          errorMessage: 'This promo code is not yet valid',
        };
      }

      // Check usage limit
      if (promoCode.usage_limit && promoCode.usage_count >= promoCode.usage_limit) {
        return {
          valid: false,
          promoCode,
          errorCode: 'USAGE_LIMIT_REACHED',
          errorMessage: 'This promo code has reached its usage limit',
        };
      }

      // Check if user has already used this code
      const userUsage = promoCodeUsage.get(promoCode.id) || [];
      const hasUsed = userUsage.some((usage: any) => usage.user_id === userId);
      
      if (hasUsed) {
        return {
          valid: false,
          promoCode,
          errorCode: 'ALREADY_USED',
          errorMessage: 'You have already used this promo code',
        };
      }

      // Check if code applies to specific plans
      if (promoCode.applies_to_plan_ids && promoCode.applies_to_plan_ids.length > 0) {
        if (planId && !promoCode.applies_to_plan_ids.includes(planId)) {
          return {
            valid: false,
            promoCode,
            errorCode: 'INELIGIBLE_PLAN',
            errorMessage: 'This promo code is not valid for the selected plan',
          };
        }
      }

      // Check billing interval
      if (promoCode.applies_to_billing_interval && promoCode.applies_to_billing_interval !== 'all') {
        if (billingInterval && promoCode.applies_to_billing_interval !== billingInterval) {
          return {
            valid: false,
            promoCode,
            errorCode: 'INELIGIBLE_BILLING',
            errorMessage: 'This promo code is not valid for the selected billing period',
          };
        }
      }

      // Check minimum purchase amount
      if (purchaseAmount !== undefined && promoCode.min_purchase_amount) {
        if (purchaseAmount < promoCode.min_purchase_amount) {
          return {
            valid: false,
            promoCode,
            errorCode: 'MIN_PURCHASE_NOT_MET',
            errorMessage: `Minimum purchase of $${promoCode.min_purchase_amount} required`,
          };
        }
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (promoCode.discount_type === 'percentage') {
        discountAmount = Math.floor(purchaseAmount || 0 * (promoCode.discount_value / 100));
        // Apply max discount limit
        if (promoCode.max_discount_amount && discountAmount > promoCode.max_discount_amount) {
          discountAmount = promoCode.max_discount_amount;
        }
      } else {
        discountAmount = promoCode.discount_value;
      }

      return {
        valid: true,
        promoCode,
        discountAmount,
      };
    } catch (error) {
      console.error('Error validating promo code:', error);
      return {
        valid: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: 'An error occurred while validating the promo code',
      };
    }
  }

  /**
   * Create a new promo code
   */
  async createPromoCode(input: CreatePromoCodeInput) {
    try {
      const code = input.code.toUpperCase();
      
      if (promoCodes.has(code)) {
        return { success: false, error: 'A promo code with this code already exists' };
      }

      const newPromo = {
        ...input,
        code,
        currency: input.currency || 'USD',
        min_purchase_amount: input.minPurchaseAmount || 0,
        max_discount_amount: input.maxDiscountAmount,
        usage_limit: input.usageLimit,
        usage_count: 0,
        applies_to_plan_ids: input.appliesToPlanIds || [],
        applies_to_billing_interval: input.appliesToBillingInterval || 'all',
        start_date: input.startDate,
        end_date: input.endDate,
        created_by: input.createdBy,
        is_active: true,
        id: `promo_${code.toLowerCase()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      promoCodes.set(code, newPromo);
      return { success: true, promoCode: newPromo };
    } catch (error) {
      console.error('Error creating promo code:', error);
      return { success: false, error: 'Failed to create promo code' };
    }
  }

  /**
   * Record promo code usage
   */
  async recordUsage(
    promoCodeId: string,
    userId: string,
    organizationId?: string,
    subscriptionId?: string,
    discountAmount: number
  ) {
    try {
      // Find and update promo code
      for (const [code, promo] of promoCodes.entries()) {
        if (promo.id === promoCodeId) {
          promo.usage_count = (promo.usage_count || 0) + 1;
          promo.updated_at = new Date().toISOString();
          promoCodes.set(code, promo);
          break;
        }
      }

      // Record usage
      const usage = {
        id: `usage_${Date.now()}`,
        promo_code_id: promoCodeId,
        user_id: userId,
        organization_id: organizationId,
        subscription_id: subscriptionId,
        discount_amount: discountAmount,
        used_at: new Date().toISOString(),
      };

      const existingUsage = promoCodeUsage.get(promoCodeId) || [];
      existingUsage.push(usage);
      promoCodeUsage.set(promoCodeId, existingUsage);

      return { success: true };
    } catch (error) {
      console.error('Error recording promo code usage:', error);
      return { success: false, error: 'Failed to record promo code usage' };
    }
  }

  /**
   * Get all active promo codes
   */
  async getActivePromoCodes() {
    try {
      const activePromos: any[] = [];
      for (const promo of promoCodes.values()) {
        if (promo.is_active) {
          // Check expiration
          if (!promo.end_date || new Date(promo.end_date) >= new Date()) {
            activePromos.push(promo);
          }
        }
      }
      return { success: true, promoCodes: activePromos };
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      return { success: false, error: 'Failed to fetch promo codes', promoCodes: [] };
    }
  }

  /**
   * Deactivate a promo code
   */
  async deactivatePromoCode(code: string) {
    try {
      const upperCode = code.toUpperCase();
      const promo = promoCodes.get(upperCode);
      if (promo) {
        promo.is_active = false;
        promo.updated_at = new Date().toISOString();
        promoCodes.set(upperCode, promo);
      }
      return { success: true };
    } catch (error) {
      console.error('Error deactivating promo code:', error);
      return { success: false, error: 'Failed to deactivate promo code' };
    }
  }
}

export const promoCodeService = new PromoCodeService();

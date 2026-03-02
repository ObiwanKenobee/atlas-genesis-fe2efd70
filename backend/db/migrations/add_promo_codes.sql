-- Promo Codes Table Migration
-- This migration adds tables for promo codes and discounts

-- Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  discount_type VARCHAR(10) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  min_purchase_amount INTEGER DEFAULT 0,
  max_discount_amount INTEGER,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  applies_to_plan_ids UUID[] DEFAULT '{}',
  applies_to_billing_interval VARCHAR(10) CHECK (applies_to_billing_interval IN ('month', 'year', 'all')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for Promo Codes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_start_date ON promo_codes(start_date);
CREATE INDEX IF NOT EXISTS idx_promo_codes_end_date ON promo_codes(end_date);

-- Promo Code Usage Table (tracks who used which code)
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  discount_amount INTEGER NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for Promo Code Usage
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_promo_code_id ON promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user_id ON promo_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_organization_id ON promo_code_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_used_at ON promo_code_usage(used_at);

-- Triggers for updated_at
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE promo_codes IS 'Stores promotional discount codes';
COMMENT ON TABLE promo_code_usage IS 'Tracks usage of promo codes by users';
COMMENT ON COLUMN promo_codes.discount_type IS 'Type of discount: percentage or fixed amount';
COMMENT ON COLUMN promo_codes.discount_value IS 'Discount value (percentage or fixed amount)';
COMMENT ON COLUMN promo_codes.usage_limit IS 'Maximum number of times this code can be used';
COMMENT ON COLUMN promo_codes.usage_count IS 'Current number of times this code has been used';
COMMENT ON COLUMN promo_codes.applies_to_plan_ids IS 'Array of plan IDs this code applies to (empty = all plans)';
COMMENT ON COLUMN promo_codes.applies_to_billing_interval IS 'Billing interval this code applies to (month/year/all)';
COMMENT ON COLUMN promo_codes.start_date IS 'When the promo code becomes valid';
COMMENT ON COLUMN promo_codes.end_date IS 'When the promo code expires';

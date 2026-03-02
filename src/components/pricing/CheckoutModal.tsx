import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  X,
  Shield,
  Lock,
  CheckCircle,
  Building2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Tag,
  AlertCircle,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePayment, PaymentProvider } from '@/hooks/usePayment';
import { useAuth } from '@/hooks/useAuth';

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanDetails | null;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'KE', name: 'Kenya' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
];

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
  { id: 'paypal', name: 'PayPal', icon: Building2, description: 'Pay with PayPal account' },
  { id: 'paystack', name: 'Paystack', icon: CreditCard, description: 'Cards, Bank, USSD (Africa)' },
  { id: 'bank', name: 'Bank Transfer', icon: Building2, description: 'Direct bank transfer' },
];

export function CheckoutModal({ isOpen, onClose, plan }: CheckoutModalProps) {
  const { user } = useAuth();
  const { initiatePayment, status, isProcessing, error, resetPayment } = usePayment();
  const [step, setStep] = useState<'billing' | 'payment' | 'processing'>('billing');
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>('card');
  
  const [billingDetails, setBillingDetails] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    taxId: '',
  });

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
  } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.email) {
      setBillingDetails(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user?.email]);

  useEffect(() => {
    if (!isOpen) {
      setStep('billing');
      resetPayment();
      setPromoCode('');
      setAppliedPromo(null);
      setPromoError('');
    }
  }, [isOpen, resetPayment]);

  const validateBilling = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!billingDetails.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!billingDetails.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!billingDetails.email.trim()) newErrors.email = 'Email is required';
    if (!billingDetails.address.trim()) newErrors.address = 'Address is required';
    if (!billingDetails.city.trim()) newErrors.city = 'City is required';
    if (!billingDetails.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setIsValidatingPromo(true);
    setPromoError('');

    try {
      const response = await fetch('/api/promocodes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode,
          planId: plan?.id,
          billingInterval: plan?.billingPeriod,
          purchaseAmount: plan?.price,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedPromo({
          code: data.promoCode.code,
          discountAmount: data.discountAmount,
          discountType: data.promoCode.discountType,
        });
      } else {
        setPromoError(data.errorMessage || 'Invalid promo code');
      }
    } catch (err) {
      setPromoError('Failed to validate promo code');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const calculateTotal = () => {
    if (!plan) return 0;
    const subtotal = plan.price;
    const discount = appliedPromo?.discountAmount || 0;
    return Math.max(0, subtotal - discount);
  };

  const handleContinueToPayment = () => {
    if (validateBilling()) {
      setStep('payment');
    }
  };

  const handleProcessPayment = async () => {
    if (!plan) return;

    setStep('processing');

    const result = await initiatePayment({
      provider: paymentMethod,
      amount: calculateTotal(),
      currency: 'USD',
      metadata: {
        planId: plan.id,
        planName: plan.name,
        billingPeriod: plan.billingPeriod,
        promoCode: appliedPromo?.code,
        discountAmount: appliedPromo?.discountAmount,
      },
      billingDetails: {
        firstName: billingDetails.firstName,
        lastName: billingDetails.lastName,
        email: billingDetails.email,
        phone: billingDetails.phone,
        company: billingDetails.company,
        address: billingDetails.address,
        city: billingDetails.city,
        state: billingDetails.state,
        postalCode: billingDetails.postalCode,
        country: billingDetails.country,
        taxId: billingDetails.taxId,
      },
    });

    if (!result?.success) {
      setStep('payment');
    }
  };

  if (!plan) return null;

  const subtotal = plan.price;
  const discount = appliedPromo?.discountAmount || 0;
  const total = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Checkout - {plan.name}
          </DialogTitle>
          <DialogDescription>
            Complete your subscription to {plan.name}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {['Billing', 'Payment', 'Confirm'].map((label, index) => {
            const stepIndex = index === 0 ? 'billing' : index === 1 ? 'payment' : 'processing';
            const isActive = step === stepIndex || 
              (step === 'payment' && index < 1) || 
              (step === 'processing' && index < 2);
            const isCurrent = step === stepIndex;

            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isCurrent 
                    ? 'bg-primary text-primary-foreground' 
                    : isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {isActive && !isCurrent ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`text-sm ${isCurrent ? 'font-medium' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {index < 2 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            );
          })}
        </div>

        <Separator />

        <AnimatePresence mode="wait">
          {/* Billing Step */}
          {step === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 py-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={billingDetails.firstName}
                    onChange={(e) => setBillingDetails({ ...billingDetails, firstName: e.target.value })}
                    className={errors.firstName ? 'border-destructive' : ''}
                  />
                  {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={billingDetails.lastName}
                    onChange={(e) => setBillingDetails({ ...billingDetails, lastName: e.target.value })}
                    className={errors.lastName ? 'border-destructive' : ''}
                  />
                  {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={billingDetails.email}
                    onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={billingDetails.phone}
                    onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  value={billingDetails.company}
                  onChange={(e) => setBillingDetails({ ...billingDetails, company: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={billingDetails.address}
                  onChange={(e) => setBillingDetails({ ...billingDetails, address: e.target.value })}
                  className={errors.address ? 'border-destructive' : ''}
                />
                {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={billingDetails.city}
                    onChange={(e) => setBillingDetails({ ...billingDetails, city: e.target.value })}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={billingDetails.state}
                    onChange={(e) => setBillingDetails({ ...billingDetails, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={billingDetails.postalCode}
                    onChange={(e) => setBillingDetails({ ...billingDetails, postalCode: e.target.value })}
                    className={errors.postalCode ? 'border-destructive' : ''}
                  />
                  {errors.postalCode && <p className="text-xs text-destructive mt-1">{errors.postalCode}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={billingDetails.country}
                    onValueChange={(value) => setBillingDetails({ ...billingDetails, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxId">Tax ID / VAT (Optional)</Label>
                  <Input
                    id="taxId"
                    value={billingDetails.taxId}
                    onChange={(e) => setBillingDetails({ ...billingDetails, taxId: e.target.value })}
                    placeholder="EU123456789"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleContinueToPayment} className="flex-1">
                  Continue to Payment
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 py-4"
            >
              {/* Promo Code Section */}
              {!appliedPromo ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4" />
                    Have a promo code?
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={validatePromoCode}
                      disabled={isValidatingPromo || !promoCode.trim()}
                    >
                      {isValidatingPromo ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {promoError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="font-medium text-emerald-700 dark:text-emerald-400">
                          Promo code applied: {appliedPromo.code}
                        </p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-500">
                          You save ${appliedPromo.discountAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAppliedPromo(null);
                        setPromoCode('');
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Order Summary
                </h3>
                <div className="flex justify-between text-sm">
                  <span>{plan.name} ({plan.billingPeriod})</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Platform fee</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)} / {plan.billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <Label className="text-base font-semibold">Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentProvider)}
                  className="grid grid-cols-2 gap-4 mt-3"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className={`relative flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === method.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setPaymentMethod(method.id as PaymentProvider)}
                    >
                      <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                      <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{method.name}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <CheckCircle className="w-4 h-4 text-primary absolute top-2 right-2" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg text-sm">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-700 dark:text-emerald-400">
                  Your payment is secured with 256-bit SSL encryption
                </span>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setStep('billing')} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleProcessPayment} disabled={isProcessing} className="flex-1">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pay ${total.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              {status === 'redirecting' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold">Redirecting to Payment</h3>
                  <p className="text-muted-foreground text-center">
                    You will be redirected to complete your payment securely.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold">Processing Payment</h3>
                  <p className="text-muted-foreground text-center">
                    Please wait while we process your payment...
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

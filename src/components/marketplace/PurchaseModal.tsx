import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Leaf, ShieldCheck, CreditCard, Wallet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CarbonProject } from '@/types/marketplace';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/api/client';
import { toast } from 'sonner';

interface PurchaseModalProps {
  project: CarbonProject;
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = 'paystack' | 'paypal';

export function PurchaseModal({ project, isOpen, onClose }: PurchaseModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const totalPrice = quantity * project.price_per_credit;
  const totalOffset = quantity * project.co2_offset_per_credit;
  const maxQuantity = Math.min(project.available_credits, 1000);

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in to purchase credits');
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod !== 'paystack') {
        toast.error('Only Paystack payments are currently supported');
        setIsProcessing(false);
        return;
      }

      const data = await apiService.payments.initializePayment({
        listingId: project.id,
        quantity,
        buyerId: user.id,
        email: user.email,
        amount: totalPrice,
      });

      if (!data.success) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      const redirectUrl = data.payment.authorization_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to process payment');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground">Purchase Carbon Credits</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {project.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="border-border/50"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <label className="sr-only" htmlFor="quantity-input">Quantity of carbon credits</label>
            <Input
              id="quantity-input"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
              className="w-24 text-center bg-muted border-border/50"
              min={1}
              max={maxQuantity}
              autoComplete="off"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
              className="border-border/50"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per credit</span>
              <span className="text-foreground">${project.price_per_credit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity</span>
              <span className="text-foreground">{quantity} credits</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border/30">
              <span className="text-foreground font-medium">Total</span>
              <span className="text-2xl font-bold text-gradient-gold">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Select Payment Method</p>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Select payment method">
              <button
                onClick={() => setPaymentMethod('paystack')}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === 'paystack'
                    ? 'border-primary bg-primary/10'
                    : 'border-border/50 hover:border-border'
                }`}
                role="radio"
                aria-checked={paymentMethod === 'paystack' ? 'true' : 'false'}
                aria-label="Paystack - Cards, Bank Transfer"
              >
                <CreditCard className={`w-6 h-6 ${paymentMethod === 'paystack' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${paymentMethod === 'paystack' ? 'text-primary' : 'text-foreground'}`}>
                  Paystack
                </span>
                <span className="text-xs text-muted-foreground">Cards, Bank Transfer</span>
              </button>
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === 'paypal'
                    ? 'border-primary bg-primary/10'
                    : 'border-border/50 hover:border-border'
                }`}
                role="radio"
                aria-checked={paymentMethod === 'paypal' ? 'true' : 'false'}
                aria-label="PayPal - PayPal Balance, Cards"
              >
                <Wallet className={`w-6 h-6 ${paymentMethod === 'paypal' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${paymentMethod === 'paypal' ? 'text-primary' : 'text-foreground'}`}>
                  PayPal
                </span>
                <span className="text-xs text-muted-foreground">PayPal Balance, Cards</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Leaf className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground/80">
              This purchase will offset <strong>{totalOffset.toFixed(1)} tonnes</strong> of CO₂
            </p>
          </div>

          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 text-primary"
              >
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Redirecting to {paymentMethod === 'paystack' ? 'Paystack' : 'PayPal'}...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border/50"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isProcessing || !user}
            >
              {paymentMethod === 'paystack' ? (
                <CreditCard className="w-4 h-4 mr-2" />
              ) : (
                <Wallet className="w-4 h-4 mr-2" />
              )}
              Pay ${totalPrice.toFixed(2)}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure payment via {paymentMethod === 'paystack' ? 'Paystack' : 'PayPal'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

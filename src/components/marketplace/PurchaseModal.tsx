import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Leaf, ShieldCheck, CreditCard } from 'lucide-react';
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
import { usePurchaseCredits } from '@/hooks/useMarketplace';

interface PurchaseModalProps {
  project: CarbonProject;
  isOpen: boolean;
  onClose: () => void;
}

export function PurchaseModal({ project, isOpen, onClose }: PurchaseModalProps) {
  const [quantity, setQuantity] = useState(1);
  const purchaseMutation = usePurchaseCredits();

  const totalPrice = quantity * project.price_per_credit;
  const totalOffset = quantity * project.co2_offset_per_credit;
  const maxQuantity = Math.min(project.available_credits, 1000);

  const handlePurchase = async () => {
    await purchaseMutation.mutateAsync({
      projectId: project.id,
      quantity,
      pricePerCredit: project.price_per_credit,
    });
    onClose();
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
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
              className="w-24 text-center bg-muted border-border/50"
              min={1}
              max={maxQuantity}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
              className="border-border/50"
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

          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Leaf className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground/80">
              This purchase will offset <strong>{totalOffset.toFixed(1)} tonnes</strong> of CO₂
            </p>
          </div>

          <AnimatePresence>
            {purchaseMutation.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 text-primary"
              >
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Processing transaction...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border/50"
              disabled={purchaseMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={purchaseMutation.isPending}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Complete Purchase
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure demo transaction</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Network, Shield, Check, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import PaymentProcessAnimation from "@/components/PaymentProcessAnimation";
import AuthenticationBuildup from "@/components/AuthenticationBuildup";

type PaymentMethod = 'paystack' | 'stripe' | 'coinbase' | 'wallet';

interface PaymentData {
  order: {
    id: string;
    amount: number;
    quantity: number;
  };
  payment: {
    reference: string;
    authorization_url?: string;
    payment_method: string;
    network?: string;
    contract_address?: string;
  };
  paymentMethod: string;
}

export default function Payment() {
  const { user, tokens } = useAuth();
  const navigate = useNavigate();
  const { reference } = useParams();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if we're in callback mode with payment verification
    if (reference) {
      verifyPayment(reference);
    }
  }, [user, navigate, reference]);

  const verifyPayment = async (paymentReference: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/payments/verify/${paymentReference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setPaymentData(result);
        setIsVerified(result.payment.status === 'success');
      } else {
        setError(result.error || 'Payment verification failed');
      }
    } catch (error) {
      setError('Failed to verify payment');
      console.error('Verification error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const initializePayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Get payment parameters from URL or context
      const listingId = searchParams.get('listingId');
      const quantity = parseInt(searchParams.get('quantity') || '1');
      const amount = parseFloat(searchParams.get('amount') || '0');

      if (!listingId || !amount) {
        throw new Error('Missing payment parameters');
      }

      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify({
          listingId,
          quantity,
          buyerId: user?.id,
          email: user?.email,
          amount,
          paymentMethod,
          currency: paymentMethod === 'wallet' ? 'ETH' : 'USD',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPaymentData(result);
        
        // Redirect to payment provider if needed
        if (result.payment.authorization_url) {
          window.location.href = result.payment.authorization_url;
        }
      } else {
        setError(result.error || 'Payment initialization failed');
      }
    } catch (error) {
      setError('Failed to initialize payment');
      console.error('Initialization error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoPayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // This would normally interact with MetaMask or other wallet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsVerified(true);
    } catch (error) {
      setError('Failed to connect wallet or process payment');
      console.error('Crypto payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    if (reference) {
      verifyPayment(reference);
    } else {
      initializePayment();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-semibold text-foreground mb-4">
            Payment Processing
          </h1>
          <p className="text-muted-foreground">
            {isVerified ? 'Your payment has been processed successfully!' : 
             isProcessing ? 'Processing your payment...' : 
             'Complete your payment to support regenerative projects'}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Details */}
          <div className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentData ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="font-mono text-sm">{paymentData.payment.reference}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium">
                        ${paymentData.order.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Quantity</span>
                      <span>{paymentData.order.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Payment Method</span>
                      <Badge variant="secondary">
                        {paymentData.paymentMethod}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Payment details will be displayed here
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Security Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>All payments are encrypted and secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Your payment information is never stored</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Transactions are processed by secure payment gateways</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-4 h-4 text-red-500" />
                  <h3 className="font-medium text-red-800">Payment Failed</h3>
                </div>
                <p className="text-sm text-red-700">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </motion.div>
            )}

            {isVerified ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
              >
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-green-700 mb-4">
                  Your transaction has been processed successfully.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-green-600">
                    Reference: <span className="font-mono">{paymentData?.payment.reference}</span>
                  </p>
                  <p className="text-sm text-green-600">
                    Amount: ${paymentData?.order.amount.toFixed(2)}
                  </p>
                </div>
                <Button
                  className="mt-6"
                  onClick={() => navigate('/marketplace')}
                >
                  Continue Shopping
                </Button>
              </motion.div>
            ) : isProcessing ? (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Processing Payment...
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Please wait while we process your transaction
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Select Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Fiat Payment Methods */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Fiat Payments
                    </h4>
                    <Button
                      variant={paymentMethod === 'paystack' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setPaymentMethod('paystack')}
                    >
                      <CreditCard className="w-5 h-5 mr-3" />
                      Paystack
                      <span className="ml-auto text-sm text-muted-foreground">
                        Best for African payments
                      </span>
                    </Button>
                    <Button
                      variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setPaymentMethod('stripe')}
                    >
                      <CreditCard className="w-5 h-5 mr-3" />
                      Stripe
                      <span className="ml-auto text-sm text-muted-foreground">
                        Credit & debit cards
                      </span>
                    </Button>
                  </div>

                  {/* Crypto Payment Methods */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Crypto Payments
                    </h4>
                    <Button
                      variant={paymentMethod === 'coinbase' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setPaymentMethod('coinbase')}
                    >
                      <Network className="w-5 h-5 mr-3" />
                      Coinbase
                      <span className="ml-auto text-sm text-muted-foreground">
                        Multiple cryptocurrencies
                      </span>
                    </Button>
                    <Button
                      variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setPaymentMethod('wallet')}
                    >
                      <Network className="w-5 h-5 mr-3" />
                      MetaMask
                      <span className="ml-auto text-sm text-muted-foreground">
                        Web3 wallet
                      </span>
                    </Button>
                  </div>

                  <Button
                    className="w-full mt-6"
                    onClick={paymentMethod === 'wallet' ? handleCryptoPayment : initializePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Complete Payment'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    </div>
  );
}

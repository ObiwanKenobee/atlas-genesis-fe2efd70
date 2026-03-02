import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { CreditCard, Wallet, Building2, CheckCircle2, Clock, ArrowRight, Shield, Zap, DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  name: string;
  icon: typeof CreditCard;
  processingTime: string;
  fees: string;
  limits: { min: number; max: number };
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  crypto: string;
  cryptoAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
  method: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    processingTime: 'Instant',
    fees: '3.5%',
    limits: { min: 50, max: 10000 }
  },
  {
    id: 'bank',
    type: 'bank',
    name: 'Bank Transfer (ACH)',
    icon: Building2,
    processingTime: '1-3 business days',
    fees: '1.0%',
    limits: { min: 100, max: 50000 }
  },
  {
    id: 'wallet',
    type: 'wallet',
    name: 'Digital Wallet',
    icon: Wallet,
    processingTime: '< 5 minutes',
    fees: '2.5%',
    limits: { min: 25, max: 5000 }
  }
];

const mockTransactions: Transaction[] = [
  {
    id: 'TX001',
    amount: 500,
    currency: 'USD',
    crypto: 'RVE',
    cryptoAmount: 125.5,
    status: 'completed',
    timestamp: new Date('2026-01-31T10:30:00'),
    method: 'Credit Card'
  },
  {
    id: 'TX002',
    amount: 1000,
    currency: 'USD',
    crypto: 'RVE',
    cryptoAmount: 251.0,
    status: 'processing',
    timestamp: new Date('2026-02-01T09:15:00'),
    method: 'Bank Transfer'
  },
  {
    id: 'TX003',
    amount: 250,
    currency: 'USD',
    crypto: 'RVE',
    cryptoAmount: 62.75,
    status: 'completed',
    timestamp: new Date('2026-01-28T14:20:00'),
    method: 'Digital Wallet'
  }
];

export function FiatOnRamp() {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [fiatAmount, setFiatAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [cryptoAsset, setCryptoAsset] = useState<string>('RVE');
  const [estimatedCrypto, setEstimatedCrypto] = useState<number>(0);

  const handleAmountChange = (value: string) => {
    setFiatAmount(value);
    const amount = parseFloat(value);
    if (!isNaN(amount)) {
      // Mock exchange rate: 1 USD = 0.251 RVE
      const rate = 0.251;
      setEstimatedCrypto(amount * rate);
    } else {
      setEstimatedCrypto(0);
    }
  };

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400';
      case 'processing':
        return 'text-yellow-400';
      case 'pending':
        return 'text-blue-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white mb-2">Fiat On-Ramp</h2>
        <p className="text-emerald-300/70">
          Purchase RVE tokens and regenerative assets with traditional currency
        </p>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Zap, label: 'Instant Purchase', value: 'Credit card accepted' },
          { icon: Shield, label: 'Secure & Compliant', value: 'KYC verified' },
          { icon: DollarSign, label: 'Low Fees', value: 'Starting at 1%' },
          { icon: Wallet, label: 'Direct to Wallet', value: 'No intermediaries' }
        ].map((feature, idx) => (
          <Card key={idx} className="bg-emerald-900/20 border-emerald-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="text-sm text-emerald-300/70 mb-1">{feature.label}</div>
              <div className="text-white">{feature.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="buy" className="space-y-6">
        <TabsList className="bg-emerald-900/20 border border-emerald-500/20">
          <TabsTrigger value="buy">Buy Crypto</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="limits">Limits & Fees</TabsTrigger>
        </TabsList>

        {/* Buy Crypto Tab */}
        <TabsContent value="buy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Purchase Form */}
            <div className="lg:col-span-2">
              <Card className="bg-emerald-900/20 border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Purchase Details</CardTitle>
                  <CardDescription className="text-emerald-300/70">
                    Enter the amount you want to purchase
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label className="text-emerald-300/90">You Pay</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={fiatAmount}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          className="bg-emerald-950/50 border-emerald-500/30 text-white"
                        />
                      </div>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-32 bg-emerald-950/50 border-emerald-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Crypto Asset Selection */}
                  <div className="space-y-2">
                    <Label className="text-emerald-300/90">You Receive</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center px-4 py-2 bg-emerald-950/50 border border-emerald-500/30 rounded-md">
                        <span className="text-white">
                          {estimatedCrypto.toFixed(4)}
                        </span>
                      </div>
                      <Select value={cryptoAsset} onValueChange={setCryptoAsset}>
                        <SelectTrigger className="w-32 bg-emerald-950/50 border-emerald-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RVE">RVE</SelectItem>
                          <SelectItem value="CARBON">CARBON</SelectItem>
                          <SelectItem value="BIO">BIO</SelectItem>
                          <SelectItem value="CULTURE">CULTURE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-emerald-300/50">
                      Rate: 1 {currency} = 0.251 {cryptoAsset}
                    </p>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label className="text-emerald-300/90">Payment Method</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              selectedMethod === method.id
                                ? 'border-emerald-400 bg-emerald-400/10'
                                : 'border-emerald-500/20 bg-emerald-950/30 hover:border-emerald-500/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5 text-emerald-400" />
                                <div>
                                  <div className="text-white">{method.name}</div>
                                  <div className="text-xs text-emerald-300/50">
                                    {method.processingTime} • {method.fees} fee
                                  </div>
                                </div>
                              </div>
                              {selectedMethod === method.id && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Method Details */}
                  {selectedPaymentMethod && selectedMethod === 'card' && (
                    <div className="space-y-4 p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/20">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label className="text-emerald-300/90">Card Number</Label>
                          <Input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            className="bg-emerald-950/50 border-emerald-500/30 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-emerald-300/90">Expiry Date</Label>
                          <Input
                            type="text"
                            placeholder="MM/YY"
                            className="bg-emerald-950/50 border-emerald-500/30 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-emerald-300/90">CVV</Label>
                          <Input
                            type="text"
                            placeholder="123"
                            className="bg-emerald-950/50 border-emerald-500/30 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod && selectedMethod === 'bank' && (
                    <div className="space-y-4 p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/20">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-emerald-300/90">Bank Name</Label>
                          <Input
                            type="text"
                            placeholder="Your Bank Name"
                            className="bg-emerald-950/50 border-emerald-500/30 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-emerald-300/90">Account Number</Label>
                          <Input
                            type="text"
                            placeholder="1234567890"
                            className="bg-emerald-950/50 border-emerald-500/30 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-emerald-300/90">Routing Number</Label>
                          <Input
                            type="text"
                            placeholder="021000021"
                            className="bg-emerald-950/50 border-emerald-500/30 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Alert className="bg-blue-500/10 border-blue-500/30">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-300/90">
                      Your payment information is encrypted and secure. We partner with regulated payment processors.
                    </AlertDescription>
                  </Alert>

                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                    Complete Purchase
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="bg-emerald-900/20 border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-300/70">Subtotal</span>
                      <span className="text-white">{fiatAmount || '0.00'} {currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-300/70">Processing Fee ({selectedPaymentMethod?.fees})</span>
                      <span className="text-white">
                        {(parseFloat(fiatAmount || '0') * (parseFloat(selectedPaymentMethod?.fees || '0') / 100)).toFixed(2)} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-300/70">Network Fee</span>
                      <span className="text-white">0.50 {currency}</span>
                    </div>
                    <div className="border-t border-emerald-500/20 pt-3">
                      <div className="flex justify-between">
                        <span className="text-emerald-300/90">Total</span>
                        <span className="text-white">
                          {(parseFloat(fiatAmount || '0') * (1 + parseFloat(selectedPaymentMethod?.fees || '0') / 100) + 0.5).toFixed(2)} {currency}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-emerald-500/20 pt-3">
                      <div className="flex justify-between">
                        <span className="text-emerald-300/90">You'll Receive</span>
                        <span className="text-emerald-400">{estimatedCrypto.toFixed(4)} {cryptoAsset}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="text-xs text-emerald-300/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>Processing Time: {selectedPaymentMethod?.processingTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        <span>KYC verification required</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supported Payment Providers */}
              <Card className="bg-emerald-900/20 border-emerald-500/20 mt-4">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Powered By</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {['Stripe', 'Plaid', 'Wyre', 'MoonPay'].map((provider) => (
                      <Badge key={provider} variant="outline" className="border-emerald-500/30 text-emerald-300/70">
                        {provider}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription className="text-emerald-300/70">
                Your fiat on-ramp purchase history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <span className="text-white">{tx.id}</span>
                        <Badge className={`${getStatusColor(tx.status)} bg-transparent border-current`}>
                          {tx.status}
                        </Badge>
                      </div>
                      <span className="text-emerald-300/70 text-sm">
                        {tx.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-emerald-300/50">Paid</div>
                        <div className="text-white">{tx.amount} {tx.currency}</div>
                      </div>
                      <div>
                        <div className="text-emerald-300/50">Received</div>
                        <div className="text-emerald-400">{tx.cryptoAmount} {tx.crypto}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-emerald-300/50">Method</div>
                        <div className="text-white">{tx.method}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limits & Fees Tab */}
        <TabsContent value="limits" className="space-y-4">
          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white">Payment Method Limits & Fees</CardTitle>
              <CardDescription className="text-emerald-300/70">
                Compare different payment options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.id}
                      className="p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/20"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <Icon className="w-5 h-5 text-emerald-400 mt-1" />
                        <div className="flex-1">
                          <h4 className="text-white mb-1">{method.name}</h4>
                          <p className="text-sm text-emerald-300/50">{method.processingTime}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-emerald-300/50 mb-1">Fee</div>
                          <div className="text-white">{method.fees}</div>
                        </div>
                        <div>
                          <div className="text-emerald-300/50 mb-1">Minimum</div>
                          <div className="text-white">${method.limits.min}</div>
                        </div>
                        <div>
                          <div className="text-emerald-300/50 mb-1">Maximum</div>
                          <div className="text-white">${method.limits.max.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white">KYC Verification Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { level: 'Basic', limit: '$1,000/day', requirements: 'Email, Phone' },
                  { level: 'Verified', limit: '$10,000/day', requirements: 'ID Document, Selfie' },
                  { level: 'Premium', limit: '$50,000/day', requirements: 'Enhanced verification, Proof of address' }
                ].map((tier) => (
                  <div key={tier.level} className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-500/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white">{tier.level}</div>
                        <div className="text-xs text-emerald-300/50">{tier.requirements}</div>
                      </div>
                      <div className="text-emerald-400">{tier.limit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

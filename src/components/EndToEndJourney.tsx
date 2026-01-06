import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle, Leaf, Shield, TrendingUp, 
  CreditCard, Globe, Users, Award, Eye, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const EndToEndJourney = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<'individual' | 'enterprise' | null>(null);

  const journeySteps = [
    {
      id: 'discover',
      title: 'Discover Impact',
      description: 'Explore verified regenerative projects',
      component: DiscoveryStep
    },
    {
      id: 'learn',
      title: 'Learn & Verify',
      description: 'Understand project details and verification',
      component: LearningStep
    },
    {
      id: 'select',
      title: 'Select Credits',
      description: 'Choose your regenerative impact portfolio',
      component: SelectionStep
    },
    {
      id: 'purchase',
      title: 'Complete Purchase',
      description: 'Secure transaction and instant verification',
      component: PurchaseStep
    },
    {
      id: 'track',
      title: 'Track Impact',
      description: 'Monitor real-time regenerative outcomes',
      component: TrackingStep
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Journey Progress */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          {journeySteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
              </div>
              {index < journeySteps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 transition-colors ${
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{journeySteps[currentStep].title}</h2>
          <p className="text-muted-foreground">{journeySteps[currentStep].description}</p>
        </div>
      </div>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {React.createElement(journeySteps[currentStep].component, {
            onNext: () => setCurrentStep(Math.min(currentStep + 1, journeySteps.length - 1)),
            onBack: () => setCurrentStep(Math.max(currentStep - 1, 0)),
            userType,
            setUserType,
            currentStep
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const DiscoveryStep = ({ onNext, setUserType }: any) => {
  const projectTypes = [
    {
      title: 'Regenerative Agriculture',
      description: 'Soil carbon sequestration and biodiversity',
      impact: '2.3M tons CO₂',
      projects: 847,
      image: '🌱',
      price: '$42/ton'
    },
    {
      title: 'Forest Restoration',
      description: 'Reforestation and ecosystem recovery',
      impact: '1.8M tons CO₂',
      projects: 234,
      image: '🌳',
      price: '$38/ton'
    },
    {
      title: 'Ocean Recovery',
      description: 'Marine ecosystem restoration',
      impact: '890K tons CO₂',
      projects: 156,
      image: '🌊',
      price: '$55/ton'
    }
  ];

  return (
    <div className="space-y-8">
      {/* User Type Selection */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-4">What brings you to Atlas Sanctum?</h3>
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => setUserType('individual')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Individual Impact
          </Button>
          <Button 
            variant="outline"
            onClick={() => setUserType('enterprise')}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Enterprise Solutions
          </Button>
        </div>
      </div>

      {/* Project Discovery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projectTypes.map((project, index) => (
          <motion.div
            key={index}
            className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-4xl mb-4">{project.image}</div>
            <h4 className="text-lg font-semibold mb-2">{project.title}</h4>
            <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Impact:</span>
                <span className="font-medium text-emerald-600">{project.impact}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Projects:</span>
                <span className="font-medium">{project.projects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Price:</span>
                <span className="font-medium text-primary">{project.price}</span>
              </div>
            </div>
            <Badge variant="secondary" className="w-full justify-center">
              <Eye className="w-3 h-3 mr-1" />
              Explore Projects
            </Badge>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Button variant="hero" size="lg" onClick={onNext}>
          Explore Verified Projects
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const LearningStep = ({ onNext, onBack }: any) => {
  const [selectedProject, setSelectedProject] = useState(0);
  
  const projects = [
    {
      name: 'Amazon Regenerative Farm Network',
      location: 'Brazil',
      verified: '99.7%',
      impact: '2.3M tons CO₂',
      price: '$42',
      details: {
        methodology: 'Verra VCS + Gold Standard',
        monitoring: 'Satellite + IoT sensors',
        timeline: '25-year permanence',
        cobenefits: 'Biodiversity, Water quality, Farmer income'
      }
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Details */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{projects[selectedProject].name}</h3>
                <p className="text-sm text-muted-foreground">{projects[selectedProject].location}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 rounded-lg bg-muted/20">
                <div className="text-xl font-bold text-emerald-600">{projects[selectedProject].verified}</div>
                <div className="text-xs text-muted-foreground">Verified</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/20">
                <div className="text-xl font-bold text-primary">{projects[selectedProject].price}</div>
                <div className="text-xs text-muted-foreground">per ton CO₂</div>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(projects[selectedProject].details).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-medium text-right max-w-xs">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-600">Quantum Verified</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This project uses our proprietary satellite verification system with 99.7% accuracy, 
              ensuring every credit represents real, additional, and permanent carbon removal.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Play className="w-4 h-4 mr-2" />
              View Verification Process
            </Button>
          </div>
        </div>

        {/* Impact Visualization */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h4 className="font-semibold mb-4">Real-Time Impact</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm">Carbon Sequestered</span>
                <span className="font-semibold text-emerald-600">2.3M tons</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm">Biodiversity Index</span>
                <span className="font-semibold text-blue-600">+47%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm">Farmer Income</span>
                <span className="font-semibold text-purple-600">+156%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm">Water Quality</span>
                <span className="font-semibold text-amber-600">+89%</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <h4 className="font-semibold mb-4">Co-Benefits</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm">UN SDG 13: Climate Action</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm">UN SDG 15: Life on Land</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm">UN SDG 1: No Poverty</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Discovery
        </Button>
        <Button variant="hero" onClick={onNext}>
          Select This Project
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const SelectionStep = ({ onNext, onBack, userType }: any) => {
  const [quantity, setQuantity] = useState(10);
  const [duration, setDuration] = useState('monthly');
  
  const pricePerTon = 42;
  const total = quantity * pricePerTon;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Selection Interface */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Configure Your Impact</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Carbon Credits (tons CO₂)</label>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {userType === 'enterprise' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Purchase Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={duration === 'one-time' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDuration('one-time')}
                    >
                      One-time
                    </Button>
                    <Button 
                      variant={duration === 'monthly' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDuration('monthly')}
                    >
                      Monthly
                    </Button>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-muted/20">
                <div className="flex justify-between items-center mb-2">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Platform Fee (2.5%):</span>
                  <span className="font-semibold">${(total * 0.025).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-primary">${(total * 1.025).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Preview */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-emerald-500/20">
            <h4 className="font-semibold text-emerald-600 mb-3">Your Impact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>CO₂ Offset:</span>
                <span className="font-semibold">{quantity} tons</span>
              </div>
              <div className="flex justify-between">
                <span>Trees Equivalent:</span>
                <span className="font-semibold">{quantity * 16} trees</span>
              </div>
              <div className="flex justify-between">
                <span>Cars Off Road:</span>
                <span className="font-semibold">{Math.round(quantity * 0.22)} cars/year</span>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Portfolio Summary</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Amazon Regenerative Farm</div>
                  <div className="text-sm text-muted-foreground">{quantity} tons CO₂</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${total.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">${pricePerTon}/ton</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Portfolio Benefits</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Real-time impact tracking</li>
                <li>• Quarterly impact reports</li>
                <li>• Tax-deductible certificates</li>
                <li>• Priority access to new projects</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Project Details
        </Button>
        <Button variant="hero" onClick={onNext}>
          Proceed to Payment
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const PurchaseStep = ({ onNext, onBack }: any) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  const handlePurchase = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(false);
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              <Button 
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard className="w-4 h-4 mr-1" />
                Card
              </Button>
              <Button 
                variant={paymentMethod === 'crypto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPaymentMethod('crypto')}
              >
                Crypto
              </Button>
              <Button 
                variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPaymentMethod('bank')}
              >
                Bank
              </Button>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Card Number"
                  className="w-full p-3 rounded-lg border border-border bg-background"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    className="p-3 rounded-lg border border-border bg-background"
                  />
                  <input 
                    type="text" 
                    placeholder="CVC"
                    className="p-3 rounded-lg border border-border bg-background"
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Cardholder Name"
                  className="w-full p-3 rounded-lg border border-border bg-background"
                />
              </div>
            )}
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-full p-3 rounded-lg border border-border bg-background"
              />
              <input 
                type="text" 
                placeholder="Company Name (Optional)"
                className="w-full p-3 rounded-lg border border-border bg-background"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Amazon Regenerative Farm (10 tons)</span>
                <span>$420.00</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Platform Fee (2.5%)</span>
                <span>$10.50</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>$430.50</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-600">Instant Verification</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your credits will be verified and issued to your portfolio within 30 seconds of payment confirmation.
              </p>
            </div>

            <Button 
              variant="hero" 
              size="lg" 
              className="w-full"
              onClick={handlePurchase}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Complete Purchase'}
              {!processing && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={processing}>
          Back to Selection
        </Button>
      </div>
    </div>
  );
};

const TrackingStep = ({ onBack }: any) => {
  return (
    <div className="space-y-8">
      {/* Success Message */}
      <div className="text-center p-8 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-emerald-500/20">
        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-emerald-600 mb-2">Purchase Complete!</h2>
        <p className="text-muted-foreground mb-4">
          Your 10 tons of verified carbon credits have been added to your portfolio.
        </p>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
          Transaction ID: ATL-2024-001847
        </Badge>
      </div>

      {/* Impact Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Your Impact Portfolio</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span>Total CO₂ Offset</span>
                <span className="font-semibold text-emerald-600">10 tons</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span>Portfolio Value</span>
                <span className="font-semibold">$430.50</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span>Impact Score</span>
                <span className="font-semibold text-primary">94/100</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <h4 className="font-semibold mb-4">Next Steps</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm">Certificate generated and emailed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm">Credits added to blockchain registry</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Real-time tracking activated</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h4 className="font-semibold mb-4">Real-Time Monitoring</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Satellite Verification</span>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                  Active
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">IoT Sensor Data</span>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                  Live
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">AI Risk Assessment</span>
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                  Low Risk
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-ocean/10 border border-primary/20">
            <h4 className="font-semibold mb-3">Share Your Impact</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Show the world your commitment to regenerative impact.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Share</Button>
              <Button variant="outline" size="sm">Download Certificate</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button variant="hero" size="lg">
          <TrendingUp className="w-4 h-4 mr-2" />
          View Full Dashboard
        </Button>
      </div>
    </div>
  );
};

export default EndToEndJourney;
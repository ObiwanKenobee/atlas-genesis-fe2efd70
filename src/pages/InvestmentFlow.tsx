/**
 * InvestmentFlow Page
 * Multi-step wizard for investing in regenerative projects
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvestments } from '../hooks/useInvestments';
import { useNotifications } from '../hooks/useNotifications';
import { paymentService } from '../services/paymentService';
import projectService from '../services/projectService';
import { Project } from '../types/marketplace';
import { ArrowRight, ArrowLeft, DollarSign, Leaf, Award, CreditCard, Check } from 'lucide-react';

type StepId = 'select' | 'amount' | 'review' | 'payment' | 'confirmation';

const STEPS: { id: StepId; title: string; description: string }[] = [
  { id: 'select', title: 'Select Projects', description: 'Choose projects to invest in' },
  { id: 'amount', title: 'Set Amount', description: 'Choose your investment amount' },
  { id: 'review', title: 'Review', description: 'Review your investment' },
  { id: 'payment', title: 'Payment', description: 'Complete your payment' },
  { id: 'confirmation', title: 'Confirmation', description: 'Investment complete!' },
];

export default function InvestmentFlow() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const {
    wizardState,
    setWizardState,
    clearWizardState,
    addProjectToSelection,
    removeProjectFromSelection,
    updatePaymentMethod,
    advanceStep,
    createInvestment,
    portfolioSummary,
    refreshPortfolio,
  } = useInvestments();

  const [currentStep, setCurrentStep] = useState<StepId>('select');
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [investmentComplete, setInvestmentComplete] = useState(false);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
    // Initialize wizard if not already done
    if (!wizardState) {
      setWizardState({
        step: 'select_project',
        selectedProject: null,
        selectedProjects: [],
        amount: 0,
        lineItems: [],
        completedSteps: [],
      });
    }
    return () => {
      clearWizardState();
    };
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const result = await projectService.getProjects({ status: ['active'] });
      setProjects(result.projects);
      setAvailableCredits(result.projects.reduce((sum, p) => sum + p.available_credits, 0));
    } catch (error) {
      console.error('Error loading projects:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load projects',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleProjectSelect = (project: Project) => {
    if (wizardState?.selectedProjects.find((p) => p.id === project.id)) {
      removeProjectFromSelection(project.id);
    } else {
      addProjectToSelection(project, 1);
    }
  };

  const handleContinue = () => {
    if (currentStep === 'select') {
      if (!wizardState?.selectedProjects.length) {
        showToast({
          type: 'warning',
          title: 'No Projects Selected',
          message: 'Please select at least one project to continue',
        });
        return;
      }
      setCurrentStep('amount');
    } else if (currentStep === 'amount') {
      setCurrentStep('review');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      handlePayment();
    }
  };

  const handleBack = () => {
    const steps: StepId[] = ['select', 'amount', 'review', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handlePayment = async () => {
    if (!wizardState?.lineItems.length) return;

    setIsLoading(true);
    try {
      const investment = await createInvestment(
        wizardState.lineItems,
        wizardState.paymentMethodId
      );
      
      setInvestmentComplete(true);
      setCurrentStep('confirmation');
      refreshPortfolio();
      
      showToast({
        type: 'success',
        title: 'Investment Successful!',
        message: `You have invested $${investment.total.toLocaleString()}`,
      });
    } catch (error) {
      console.error('Payment error:', error);
      showToast({
        type: 'error',
        title: 'Payment Failed',
        message: 'Please try again or use a different payment method',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = wizardState?.lineItems.reduce((sum, li) => sum + li.subtotal, 0) || 0;
  const fees = totalAmount * 0.02; // 2% platform fee
  const total = totalAmount + fees;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Invest in Regeneration</h1>
          <p className="text-slate-600 mt-2">
            Support verified regenerative projects and earn carbon credits
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => {
                    const steps: StepId[] = ['select', 'amount', 'review', 'payment', 'confirmation'];
                    const targetIndex = steps.indexOf(step.id);
                    const currentIndex = steps.indexOf(currentStep);
                    if (targetIndex <= currentIndex && step.id !== 'payment' && step.id !== 'confirmation') {
                      setCurrentStep(step.id);
                    }
                  }}
                  disabled={['payment', 'confirmation'].includes(step.id)}
                  className={`flex items-center ${['payment', 'confirmation'].includes(step.id) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      index < currentStepIndex
                        ? 'bg-emerald-500 text-white'
                        : index === currentStepIndex
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${index <= currentStepIndex ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.title}
                    </p>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${index < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {/* Step 1: Select Projects */}
              {currentStep === 'select' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-slate-900">Select Projects</h2>
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.map((project) => {
                        const isSelected = wizardState?.selectedProjects.find((p) => p.id === project.id);
                        return (
                          <button
                            key={project.id}
                            onClick={() => handleProjectSelect(project)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-slate-900">{project.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                  {project.location}, {project.country}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className="flex items-center text-emerald-600">
                                    <Leaf className="w-4 h-4 mr-1" />
                                    {project.impact_score}% impact
                                  </span>
                                  <span className="flex items-center text-slate-600">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    ${project.price_per_credit}/credit
                                  </span>
                                </div>
                              </div>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                              }`}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Set Amount */}
              {currentStep === 'amount' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-slate-900">Set Investment Amount</h2>
                  
                  <div className="space-y-4">
                    {wizardState?.lineItems.map((item) => (
                      <div key={item.projectId} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-slate-900">{item.projectName}</h3>
                            <p className="text-sm text-slate-500">
                              {item.quantity} credits × ${item.pricePerCredit}
                            </p>
                          </div>
                          <p className="font-semibold text-slate-900">
                            ${item.subtotal.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium">${totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-slate-500">Platform Fee (2%)</span>
                      <span className="font-medium">${fees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t">
                      <span>Total</span>
                      <span className="text-emerald-600">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-slate-900">Review Your Investment</h2>
                  
                  <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                    <h3 className="font-medium text-slate-900">Investment Summary</h3>
                    {wizardState?.lineItems.map((item) => (
                      <div key={item.projectId} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.projectName}</span>
                        <span className="font-medium">${item.subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span>${totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Fees</span>
                        <span>${fees.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total Investment</span>
                        <span className="text-emerald-600">${total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Award className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-blue-900">Estimated Impact</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Your investment will offset approximately{' '}
                          <strong>
                            {wizardState?.lineItems.reduce((sum, li) => sum + li.estimatedImpact.carbonOffset, 0).toLocaleString()}{' '}
                            tons of CO2
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {currentStep === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-slate-900">Complete Payment</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="w-5 h-5 text-slate-400 mr-3" />
                          <div>
                            <p className="font-medium text-slate-900">Credit Card</p>
                            <p className="text-sm text-slate-500">Visa •••• 4242</p>
                          </div>
                        </div>
                        <button className="text-blue-600 text-sm hover:underline">
                          Change
                        </button>
                      </div>
                    </div>

                    <button className="w-full p-4 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors">
                      + Add Payment Method
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">
                      By completing this investment, you agree to our{' '}
                      <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 5: Confirmation */}
              {currentStep === 'confirmation' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Investment Successful!
                  </h2>
                  <p className="text-slate-600 mb-8">
                    Thank you for investing ${total.toLocaleString()} in regenerative projects.
                  </p>
                  
                  <div className="bg-slate-50 rounded-lg p-6 mb-8">
                    <h3 className="font-medium text-slate-900 mb-4">What's Next?</h3>
                    <ul className="text-left space-y-3 text-sm">
                      <li className="flex items-start">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 mr-2" />
                        <span className="text-slate-600">You will receive a confirmation email with your investment details</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 mr-2" />
                        <span className="text-slate-600">Your carbon credits will be allocated to your portfolio within 24 hours</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 mr-2" />
                        <span className="text-slate-600">Track your impact through your portfolio dashboard</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => navigate('/portfolio')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      View Portfolio
                    </button>
                    <button
                      onClick={() => navigate('/marketplace')}
                      className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      Browse More Projects
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              {currentStep !== 'confirmation' && (
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 'select'}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                      currentStep === 'select'
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </button>
                  
                  <button
                    onClick={handleContinue}
                    disabled={isLoading}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {currentStep === 'payment' ? 'Complete Payment' : 'Continue'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-8">
              <h3 className="font-semibold text-slate-900 mb-4">Investment Summary</h3>
              
              {wizardState?.selectedProjects.length ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {wizardState.selectedProjects.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex justify-between text-sm">
                        <span className="text-slate-600 truncate pr-2">{project.title}</span>
                        <span className="font-medium whitespace-nowrap">
                          ${project.price_per_credit}
                        </span>
                      </div>
                    ))}
                    {wizardState.selectedProjects.length > 3 && (
                      <p className="text-sm text-slate-500">
                        +{wizardState.selectedProjects.length - 3} more projects
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Projects</span>
                      <span>{wizardState.selectedProjects.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Credits</span>
                      <span>
                        {wizardState.lineItems.reduce((sum, li) => sum + li.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-emerald-600">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">
                  Select projects to see your investment summary
                </p>
              )}

              {portfolioSummary && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-slate-900 mb-2">Your Portfolio</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Total Invested</p>
                      <p className="font-semibold text-slate-900">
                        ${portfolioSummary.totalInvested.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Carbon Offset</p>
                      <p className="font-semibold text-emerald-600">
                        {portfolioSummary.totalCarbonOffset.toLocaleString()} tons
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

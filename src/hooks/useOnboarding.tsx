import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './useAuth';
import { UserSegment, UserSegmentConfig, USER_SEGMENTS, OnboardingStep } from '@/types/userSegments';

interface OnboardingState {
  currentStep: number;
  completedSteps: string[];
  selectedSegment: UserSegment | null;
  onboardingData: Record<string, unknown>;
  isOnboardingComplete: boolean;
}

interface OnboardingContextType {
  onboardingState: OnboardingState;
  startOnboarding: (segment: UserSegment) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (stepId: string, data?: Record<string, unknown>) => void;
  skipStep: (stepId: string) => void;
  updateOnboardingData: (data: Record<string, unknown>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  getSegmentConfig: () => UserSegmentConfig | null;
  getCurrentStepConfig: () => OnboardingStep | null;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    currentStep: 0,
    completedSteps: [],
    selectedSegment: null,
    onboardingData: {},
    isOnboardingComplete: false,
  });

  // Load onboarding state from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedOnboarding = localStorage.getItem(`onboarding_${user.id}`);
      if (savedOnboarding) {
        try {
          const parsed = JSON.parse(savedOnboarding);
          setOnboardingState(parsed);
        } catch (error) {
          console.error('Failed to parse saved onboarding data:', error);
        }
      }
    }
  }, [user]);

  // Save onboarding state to localStorage whenever it changes
  useEffect(() => {
    if (user && onboardingState.selectedSegment) {
      localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(onboardingState));
    }
  }, [onboardingState, user]);

  const startOnboarding = (segment: UserSegment) => {
    setOnboardingState({
      currentStep: 0,
      completedSteps: [],
      selectedSegment: segment,
      onboardingData: {},
      isOnboardingComplete: false,
    });
  };

  const nextStep = () => {
    const segmentConfig = USER_SEGMENTS[onboardingState.selectedSegment!];
    if (onboardingState.currentStep < segmentConfig.onboardingSteps.length - 1) {
      setOnboardingState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
      }));
    }
  };

  const previousStep = () => {
    if (onboardingState.currentStep > 0) {
      setOnboardingState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
    }
  };

  const completeStep = (stepId: string, data?: Record<string, unknown>) => {
    setOnboardingState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, stepId],
      onboardingData: { ...prev.onboardingData, ...data },
    }));
  };

  const skipStep = (stepId: string) => {
    setOnboardingState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, stepId],
    }));
  };

  const updateOnboardingData = (data: Record<string, unknown>) => {
    setOnboardingState(prev => ({
      ...prev,
      onboardingData: { ...prev.onboardingData, ...data },
    }));
  };

  const completeOnboarding = () => {
    setOnboardingState(prev => ({
      ...prev,
      isOnboardingComplete: true,
    }));
    
    // Save user segment to user profile
    if (user && onboardingState.selectedSegment) {
      const updatedUser = {
        ...user,
        segment: onboardingState.selectedSegment,
        onboardingCompleted: true,
      };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const resetOnboarding = () => {
    setOnboardingState({
      currentStep: 0,
      completedSteps: [],
      selectedSegment: null,
      onboardingData: {},
      isOnboardingComplete: false,
    });
    
    if (user) {
      localStorage.removeItem(`onboarding_${user.id}`);
    }
  };

  const getSegmentConfig = (): UserSegmentConfig | null => {
    if (!onboardingState.selectedSegment) return null;
    return USER_SEGMENTS[onboardingState.selectedSegment];
  };

  const getCurrentStepConfig = (): OnboardingStep | null => {
    const segmentConfig = getSegmentConfig();
    if (!segmentConfig) return null;
    return segmentConfig.onboardingSteps[onboardingState.currentStep] || null;
  };

  const value: OnboardingContextType = {
    onboardingState,
    startOnboarding,
    nextStep,
    previousStep,
    completeStep,
    skipStep,
    updateOnboardingData,
    completeOnboarding,
    resetOnboarding,
    getSegmentConfig,
    getCurrentStepConfig,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export type UserRole = 'producer' | 'investor' | 'institution' | 'knowledge_builder';

export interface User {
  id: string;
  role: UserRole;
  email?: string;
  phone?: string;
  walletAddress?: string;
  name?: string;
  organization?: string;
  jurisdiction?: string;
  purpose?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthenticationMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  isDefault: boolean;
}

export interface ConsentOption {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
}

export interface ConsentState {
  [key: string]: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'form' | 'action';
}

export interface RoleSpecificData {
  role: UserRole;
  title: string;
  description: string;
  icon: string;
  steps: OnboardingStep[];
  firstDayExperience: FirstDayExperience;
}

export interface FirstDayExperience {
  metric: string;
  action: string;
  story: string;
}

export interface AuthenticationData {
  value?: string;
  [key: string]: any;
}

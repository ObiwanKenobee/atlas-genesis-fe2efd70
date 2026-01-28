import { User, UserRole, ConsentOption, ConsentState, AuthenticationMethod, RoleSpecificData, FirstDayExperience } from "@/types/auth";

// Role-specific authentication methods
export const getAuthenticationMethods = (role: UserRole): AuthenticationMethod[] => {
  const baseMethods: AuthenticationMethod[] = [
    {
      id: "sms",
      name: "Phone Number",
      icon: "📱",
      description: "Get a login code via SMS",
      isDefault: role === 'producer'
    },
    {
      id: "email-passkey",
      name: "Email + Passkey",
      icon: "📧",
      description: "Secure login with passkey",
      isDefault: role === 'investor' || role === 'knowledge_builder'
    },
    {
      id: "wallet",
      name: "Wallet Login",
      icon: "🪪",
      description: "Login with Web3 wallet",
      isDefault: false
    }
  ];

  if (role === 'institution') {
    baseMethods.push({
      id: "sso",
      name: "Institutional SSO",
      icon: "🏛️",
      description: "Single Sign-On",
      isDefault: true
    });
  }

  return baseMethods;
};

// Consent options for ethical data collection
export const getConsentOptions = (role: UserRole): ConsentOption[] => {
  const baseOptions: ConsentOption[] = [
    {
      id: "basic",
      title: "Basic Information",
      description: "Share your name and contact information to use the platform",
      isRequired: true
    },
    {
      id: "usage",
      title: "Usage Analytics",
      description: "Help us improve by sharing how you use the platform",
      isRequired: false
    },
    {
      id: "impact",
      title: "Impact Data",
      description: "Share anonymized impact data to contribute to research",
      isRequired: false
    }
  ];

  if (role === 'producer') {
    baseOptions.push({
      id: "location",
      title: "Location Data",
      description: "Share location to find relevant regeneration opportunities",
      isRequired: false
    });
  }

  if (role === 'investor') {
    baseOptions.push({
      id: "investment-profile",
      title: "Investment Profile",
      description: "Share investment preferences to find suitable opportunities",
      isRequired: false
    });
  }

  return baseOptions;
};

// Role-specific onboarding data
export const getRoleSpecificData = (role: UserRole): RoleSpecificData => {
  const roleData: Record<UserRole, RoleSpecificData> = {
    producer: {
      role: 'producer',
      title: "Regenerative Producer",
      description: "Join a community of land and ocean stewards",
      icon: "🌱",
      steps: [
        {
          id: "where-care",
          title: "Where do you care for life?",
          description: "Select your primary environment",
          type: 'form'
        },
        {
          id: "proof-of-place",
          title: "Proof of Place",
          description: "Verify your connection to the land or sea",
          type: 'form'
        },
        {
          id: "immediate-value",
          title: "Immediate Value",
          description: "See the potential benefits",
          type: 'info'
        }
      ],
      firstDayExperience: {
        metric: "Your soil could recover 18% organic matter in 3 years.",
        action: "Explore nearby regeneration opportunities",
        story: "Meet Maria, who increased her farm's yield by 25% using regenerative practices"
      }
    },
    investor: {
      role: 'investor',
      title: "Impact Investor",
      description: "Invest in regenerative impact that matters",
      icon: "💰",
      steps: [
        {
          id: "investment-intent",
          title: "Investment Intent",
          description: "What impact do you want to create?",
          type: 'form'
        },
        {
          id: "risk-profile",
          title: "Risk & Values Profile",
          description: "What are your investment preferences?",
          type: 'form'
        },
        {
          id: "transparency",
          title: "Transparency Preview",
          description: "See how impact is verified",
          type: 'info'
        }
      ],
      firstDayExperience: {
        metric: "This mangrove project protects 12,000 lives from flooding.",
        action: "View verified regeneration projects",
        story: "See how investors are creating lasting impact"
      }
    },
    institution: {
      role: 'institution',
      title: "Public Institution",
      description: "Shape policy and governance",
      icon: "🏛️",
      steps: [
        {
          id: "authority",
          title: "Authority Verification",
          description: "Verify your institutional identity",
          type: 'form'
        },
        {
          id: "jurisdiction",
          title: "Jurisdiction Setup",
          description: "Define your area of responsibility",
          type: 'form'
        },
        {
          id: "governance",
          title: "Governance Mode",
          description: "Choose your role in the ecosystem",
          type: 'form'
        }
      ],
      firstDayExperience: {
        metric: "Your jurisdiction has 45 active regeneration projects.",
        action: "View regional impact data",
        story: "See how policies are driving regeneration"
      }
    },
    knowledge_builder: {
      role: 'knowledge_builder',
      title: "Knowledge Builder",
      description: "Research, teach, and build solutions",
      icon: "🧪",
      steps: [
        {
          id: "purpose",
          title: "Your Purpose",
          description: "What brings you to Atlas Sanctum?",
          type: 'form'
        },
        {
          id: "access",
          title: "Access Level",
          description: "Select your research focus",
          type: 'form'
        },
        {
          id: "sandbox",
          title: "Sandbox Access",
          description: "Get access to tools and data",
          type: 'action'
        }
      ],
      firstDayExperience: {
        metric: "Our ethical AI library has 150+ validated models.",
        action: "Explore AI research tools",
        story: "See how researchers are advancing regeneration"
      }
    }
  };

  return roleData[role];
};

// Helper to create temporary user for offline use
export const createTemporaryUser = (role: UserRole): Partial<User> => {
  return {
    id: `temp-${Date.now()}`,
    role,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };
};

// Validate consent state
export const validateConsent = (consent: ConsentState, options: ConsentOption[]): boolean => {
  const requiredOptions = options.filter(opt => opt.isRequired);
  return requiredOptions.every(opt => consent[opt.id]);
};

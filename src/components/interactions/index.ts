// Interaction System - Complete CRUD & Micro/Macro Interactions

// Context & Hooks
export {
  InteractionProvider,
  useInteractions,
  ToastContainer,
  useToast,
} from './InteractionSystem';

// Micro Interactions
export {
  AnimatedLike,
  AnimatedBookmark,
  AnimatedShare,
  AnimatedViews,
  AnimatedCounter,
  LoadingSpinner,
  SkeletonPulse,
} from './InteractionSystem';

// Macro Interactions
export {
  PurchaseFlow,
  OnboardingTour,
  NotificationCenter,
  CommandPalette,
} from './InteractionSystem';

// Types
export type {
  ToastType,
  AnimatedLikeProps,
  AnimatedBookmarkProps,
  AnimatedShareProps,
  AnimatedViewsProps,
  AnimatedCounterProps,
  LoadingSpinnerProps,
  SkeletonPulseProps,
  PurchaseFlowProps,
  OnboardingTourProps,
  NotificationCenterProps,
  NotificationItem,
  CommandPaletteProps,
  CommandItem,
} from './InteractionSystem';

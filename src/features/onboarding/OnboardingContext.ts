import { createContext, useContext } from 'react';

export type OnboardingArea = 'fazer' | 'memoria' | 'planejar';

export interface OnboardingContextValue {
  isPending: (area: OnboardingArea) => boolean;
  dismissArea: (area: OnboardingArea) => void;
  resetAll: () => void;
}

export const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}


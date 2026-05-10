import { useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { OnboardingContext, type OnboardingArea, type OnboardingContextValue } from './OnboardingContext';

type OnboardingState = Record<OnboardingArea, boolean>;

const STORAGE_KEY = 'orbita-onboarding-state';
const initialState: OnboardingState = {
  fazer: false,
  memoria: false,
  planejar: false,
};

function readInitialState(): OnboardingState {
  if (typeof window === 'undefined') return initialState;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialState;

  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

export function OnboardingProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<OnboardingState>(() => readInitialState());

  function persist(nextState: OnboardingState) {
    setState(nextState);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }

  const value = useMemo<OnboardingContextValue>(
    () => ({
      isPending: (area) => !state[area],
      dismissArea: (area) => persist({ ...state, [area]: true }),
      resetAll: () => persist(initialState),
    }),
    [state],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

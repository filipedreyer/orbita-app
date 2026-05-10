import { createContext } from 'react';
import type { IAContextValue } from './types';

export const IAContext = createContext<IAContextValue | null>(null);


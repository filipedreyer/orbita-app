import { useContext } from 'react';
import { IAContext } from './IAContext';

export function useIA() {
  const context = useContext(IAContext);

  if (!context) {
    throw new Error('useIA must be used within IAProvider');
  }

  return context;
}

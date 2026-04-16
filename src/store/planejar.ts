/**
 * Planejar store access
 *
 * Este modulo concentra o acesso estruturado da camada Planejar ao store.
 * Regras canonicas vivem em `features/planejar/domain/canonical.ts`.
 * Calculos derivados vivem em `features/planejar/domain/derived.ts`.
 * Projecoes de UI vivem em `features/planejar/domain/projections.ts`.
 */
import { today } from '../lib/dates';
import { derivePlanejarDomain } from '../features/planejar/domain/derived';
import { projectPlanejarView } from '../features/planejar/domain/projections';
import { useDataStore } from './index';

export function usePlanejarDomain() {
  const items = useDataStore((state) => state.items);
  return derivePlanejarDomain(items, today());
}

export function usePlanejarProjection() {
  const items = useDataStore((state) => state.items);
  return projectPlanejarView(items, today());
}

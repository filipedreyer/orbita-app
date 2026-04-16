/**
 * Fazer store access
 *
 * Este módulo concentra o acesso estruturado da camada Fazer ao store.
 * Regras canônicas vivem em `features/fazer/domain/canonical.ts`.
 * Cálculos derivados vivem em `features/fazer/domain/derived.ts`.
 * Projeções de UI vivem em `features/fazer/domain/projections.ts`.
 */
import { today } from '../lib/dates';
import { useDataStore } from './index';
import { deriveEncerramentoDomain, deriveHojeDomain, deriveRitualDomain } from '../features/fazer/domain/derived';
import { projectHojeSections } from '../features/fazer/domain/projections';

export function useHojeDomain() {
  const items = useDataStore((state) => state.items);
  const ritualOrder = useDataStore((state) => state.ritualOrder);
  return deriveHojeDomain(items, today(), ritualOrder);
}

export function useHojeProjection() {
  const items = useDataStore((state) => state.items);
  const ritualOrder = useDataStore((state) => state.ritualOrder);
  return projectHojeSections(items, today(), ritualOrder);
}

export function useRitualDomain() {
  const items = useDataStore((state) => state.items);
  const ritualOrder = useDataStore((state) => state.ritualOrder);
  return deriveRitualDomain(items, today(), ritualOrder);
}

export function useEncerramentoDomain() {
  const items = useDataStore((state) => state.items);
  return deriveEncerramentoDomain(items, today());
}

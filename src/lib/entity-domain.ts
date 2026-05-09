export const canonicalEntityTypes = [
  'meta',
  'projeto',
  'tarefa',
  'habito',
  'rotina',
  'evento',
  'lembrete',
  'nota',
  'lista',
] as const;

export type CanonicalEntityType = (typeof canonicalEntityTypes)[number];

export const deprecatedEntityTypes = ['ideia', 'inegociavel'] as const;

export type DeprecatedEntityType = (typeof deprecatedEntityTypes)[number];

export type EntitySurfaceKey = CanonicalEntityType | 'agenda' | 'template' | 'inbox';

export interface CanonicalEntityMatrixEntry {
  key: EntitySurfaceKey;
  label: string;
  persistenceType: CanonicalEntityType | null;
  role: 'entity' | 'category' | 'template' | 'transient-layer';
  status: 'canonical' | 'provisional';
  notes: string;
}

export const canonicalEntityMatrix: CanonicalEntityMatrixEntry[] = [
  { key: 'meta', label: 'Meta', persistenceType: 'meta', role: 'entity', status: 'canonical', notes: 'Direcao e resultado esperado.' },
  { key: 'projeto', label: 'Projeto', persistenceType: 'projeto', role: 'entity', status: 'canonical', notes: 'Frente concreta ligada a direcao.' },
  { key: 'tarefa', label: 'Tarefa', persistenceType: 'tarefa', role: 'entity', status: 'canonical', notes: 'Acao executavel.' },
  { key: 'habito', label: 'Habito', persistenceType: 'habito', role: 'entity', status: 'canonical', notes: 'Ciclo recorrente.' },
  { key: 'rotina', label: 'Rotina', persistenceType: 'rotina', role: 'entity', status: 'canonical', notes: 'Sequencia recorrente.' },
  { key: 'agenda', label: 'Agenda', persistenceType: 'evento', role: 'category', status: 'provisional', notes: 'Categoria de tempo reservada; persiste como evento ate decisao de schema.' },
  { key: 'evento', label: 'Evento', persistenceType: 'evento', role: 'entity', status: 'canonical', notes: 'Compromisso com data e horario.' },
  { key: 'lembrete', label: 'Lembrete', persistenceType: 'lembrete', role: 'entity', status: 'canonical', notes: 'Sinal com data obrigatoria em novos fluxos.' },
  { key: 'nota', label: 'Nota', persistenceType: 'nota', role: 'entity', status: 'canonical', notes: 'Registro livre e recuperavel.' },
  { key: 'lista', label: 'Lista', persistenceType: 'lista', role: 'entity', status: 'canonical', notes: 'Colecao estruturada.' },
  { key: 'template', label: 'Template', persistenceType: 'nota', role: 'template', status: 'provisional', notes: 'Persistido como nota com marcador de template.' },
  { key: 'inbox', label: 'Inbox', persistenceType: null, role: 'transient-layer', status: 'canonical', notes: 'Triagem transitoria; nao e entidade final.' },
];

export const legacyEntityTypeMap: Record<DeprecatedEntityType, CanonicalEntityType> = {
  ideia: 'nota',
  inegociavel: 'rotina',
};

export const migrationWarnings: Record<DeprecatedEntityType, string> = {
  ideia: 'Idea nao e entidade no Olys V2.2. Dados legados do tipo ideia devem ser lidos como material de Caixola/Nota ate migracao segura.',
  inegociavel: 'Inegociavel como entidade e legado. Essencial protegido deve migrar para condicao/flag aplicada a entidades elegiveis.',
};

export function isCanonicalEntityType(type: unknown): type is CanonicalEntityType {
  return typeof type === 'string' && canonicalEntityTypes.includes(type as CanonicalEntityType);
}

export function isLegacyEntityType(type: unknown): type is DeprecatedEntityType {
  return typeof type === 'string' && deprecatedEntityTypes.includes(type as DeprecatedEntityType);
}

export function normalizeEntityType(type: unknown): CanonicalEntityType | null {
  if (isCanonicalEntityType(type)) {
    return type;
  }

  if (isLegacyEntityType(type)) {
    return legacyEntityTypeMap[type];
  }

  return null;
}

export function assertNewEntityType(type: unknown): asserts type is CanonicalEntityType {
  if (isLegacyEntityType(type)) {
    throw new Error(migrationWarnings[type]);
  }

  if (!isCanonicalEntityType(type)) {
    throw new Error(`Tipo de entidade invalido para novo registro: ${String(type)}`);
  }
}

export interface EssentialProtectionMetadata {
  essential_protected?: boolean;
  essencial_protegido?: boolean;
  essential_reason?: string;
}

export function isEssentialProtected(metadata: Record<string, unknown> | null | undefined) {
  return metadata?.essential_protected === true || metadata?.essencial_protegido === true;
}

export interface InboxOriginMetadata {
  capture_origin: 'capturar';
  capture_surface: 'inbox';
  inbox_source_id: string;
  inbox_source_text: string;
  inbox_captured_at: string;
}

export function createInboxOriginMetadata(item: { id: string; text: string; created_at: string }): InboxOriginMetadata {
  return {
    capture_origin: 'capturar',
    capture_surface: 'inbox',
    inbox_source_id: item.id,
    inbox_source_text: item.text,
    inbox_captured_at: item.created_at,
  };
}

export interface AttachmentMetadata {
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_mime_type?: string | null;
  legacy_image_url?: string | null;
}

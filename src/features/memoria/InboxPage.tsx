import { CheckCheck, Clock3, FileImage, FilePlus2, FileText, Inbox, Sparkles, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useActionFeedback } from '../../components/feedback/ActionFeedbackProvider';
import { Badge, Button, Card, Field, Input, PillSelector } from '../../components/ui';
import { resolveInboxAttachment } from '../../lib/inbox-attachments';
import type { EntityType, InboxItem } from '../../lib/types';
import { useAuthStore, useDataStore } from '../../store';
import { extractTags } from '../../utils/helpers';
import { structuredCaptureTypeOptions } from '../capture/capture-types';
import { buildInboxClassificationPayload, classifyInboxWithAI, type InboxClassificationSuggestion } from '../ia/classifyInbox';

const inboxTypeOptions = structuredCaptureTypeOptions.map((option) => ({
  key: option.type,
  label: option.label,
}));

export function InboxPage() {
  const session = useAuthStore((state) => state.session);
  const inbox = useDataStore((state) => state.inbox);
  const items = useDataStore((state) => state.items);
  const addItem = useDataStore((state) => state.addItem);
  const dismissInbox = useDataStore((state) => state.dismissInbox);
  const updateInboxItem = useDataStore((state) => state.updateInboxItem);
  const { showFeedback } = useActionFeedback();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftType, setDraftType] = useState<EntityType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [classificationLoading, setClassificationLoading] = useState(false);
  const [classificationSuggestion, setClassificationSuggestion] = useState<InboxClassificationSuggestion | null>(null);
  const [suggestionTypeApplied, setSuggestionTypeApplied] = useState(false);
  const processingIdRef = useRef<string | null>(null);

  function getInboxTextLabel(item: InboxItem) {
    return item.text.trim() ? item.text : 'Sem texto';
  }

  function resetProcessor() {
    setProcessingId(null);
    processingIdRef.current = null;
    setDraftName('');
    setDraftType(null);
    setSubmitting(false);
    setClassificationLoading(false);
    setClassificationSuggestion(null);
    setSuggestionTypeApplied(false);
  }

  async function beginProcessing(item: InboxItem) {
    setProcessingId(item.id);
    processingIdRef.current = item.id;
    setDraftName(item.text);
    setDraftType(item.ai_suggested_type);
    setClassificationSuggestion(null);
    setSuggestionTypeApplied(false);
    setClassificationLoading(true);

    const knownProjects = items
      .filter((entry) => entry.type === 'projeto' && entry.status !== 'archived')
      .map((entry) => entry.title);
    const knownGoals = items
      .filter((entry) => entry.type === 'meta' && entry.status !== 'archived')
      .map((entry) => entry.title);

    const suggestion = await classifyInboxWithAI(
      buildInboxClassificationPayload({
        text: item.text,
        knownProjects,
        knownGoals,
      }),
    );

    setClassificationLoading(false);

    if (processingIdRef.current !== item.id) {
      return;
    }

    if (!suggestion) {
      return;
    }

    setClassificationSuggestion(suggestion);

    if (!item.ai_suggested_type) {
      setDraftType(suggestion.suggestedType);
      setSuggestionTypeApplied(true);
    }
  }

  function getMinimalMetadata(type: EntityType) {
    if (type === 'habito') {
      return {
        frequency: 'daily',
        streak: 0,
        last_checked: null,
      };
    }

    if (type === 'rotina') {
      return {
        frequency: 'daily',
      };
    }

    if (type === 'evento') {
      return {
        time: null,
        location: null,
      };
    }

    if (type === 'inegociavel') {
      return {};
    }

    return {};
  }

  function getPostponedMetadata(type: EntityType, item: InboxItem) {
    return {
      ...getMinimalMetadata(type),
      // PRODUTO: isto fecha a semantica de dominio do adiamento vindo da inbox.
      // O gap remanescente nao e de dados, mas de UX: o produto ainda precisa
      // de uma superficie de primeira classe para reencontrar e retriar itens
      // com inbox_postponed=true / inbox_needs_revisit=true.
      // Nao implementar aqui; esta marcacao existe para preservar o handoff.
      inbox_postponed: true,
      inbox_postponed_at: new Date().toISOString(),
      inbox_needs_revisit: true,
      inbox_source_id: item.id,
    };
  }

  async function handleKeepInInbox(item: InboxItem) {
    if (submitting) return;
    setSubmitting(true);
    try {
      await updateInboxItem(item.id, {
        text: draftName,
        ai_suggested_type: draftType,
      });
      resetProcessor();
      showFeedback('Item mantido na inbox para triagem posterior.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConvert(item: InboxItem, nextStatus: 'active' | 'done' | 'paused') {
    const name = draftName.trim();
    if (!session?.user || !draftType || !name || submitting) return;

    setSubmitting(true);
    try {
      const sourceText = item.text.trim();
      const mergedTags = [
        ...extractTags(name),
        ...extractTags(sourceText),
        ...(item.ai_suggested_tags?.match(/#[\w-]+/g) || []),
      ];
      const created = await addItem({
        user_id: session.user.id,
        type: draftType,
        title: name,
        description: sourceText && sourceText !== name ? `<p>${sourceText}</p>` : null,
        status: nextStatus,
        priority: null,
        due_date: null,
        completed_at: nextStatus === 'done' ? new Date().toISOString() : null,
        goal_id: null,
        project_id: null,
        tags: [...new Set(mergedTags)],
        reschedule_count: 0,
        metadata: nextStatus === 'paused' ? getPostponedMetadata(draftType, item) : getMinimalMetadata(draftType),
        image_url: item.image_url,
      });

      if (!created) return;

      await dismissInbox(item.id);
      resetProcessor();

      if (nextStatus === 'done') {
        showFeedback(`Item concluido e removido da inbox como ${draftType}.`);
        return;
      }

      if (nextStatus === 'paused') {
        showFeedback(`Item adiado como ${draftType}. Ele saiu da inbox e ficou pausado.`);
        return;
      }

      showFeedback(`Item convertido para ${draftType} e removido da inbox.`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDiscard(item: InboxItem) {
    if (submitting) return;
    await dismissInbox(item.id);
    if (processingId === item.id) {
      resetProcessor();
    }
    showFeedback('Item descartado da inbox.');
  }

  function renderAttachment(item: InboxItem) {
    const attachment = resolveInboxAttachment(item);

    if (!attachment) return null;

    if (attachment.kind === 'image') {
      return (
        <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)]">
          <img src={attachment.url} alt={attachment.name ?? 'Anexo da inbox'} className="h-48 w-full object-cover" />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-2xl)] bg-[var(--surface)] text-[var(--text-secondary)]">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-[var(--text)]">{attachment.name ?? 'Arquivo anexado'}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{attachment.mimeType ?? 'Arquivo salvo na inbox'}</p>
        </div>
      </div>
    );
  }

  const canLeaveInbox = !!draftType && draftName.trim().length > 0;

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Memoria</p>
            <h3 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[var(--text)]">Inbox</h3>
          </div>
          <div className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)]">
            {inbox.length} itens sem tratamento
          </div>
        </div>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          A inbox processa em fila. Cada item pode continuar aqui, virar entidade tipada, ser descartado, concluido ou adiado depois da classificacao.
        </p>
      </Card>

      <div className="space-y-3">
        {inbox.map((item) => (
          <Card key={item.id} className="space-y-4 p-5">
            {renderAttachment(item)}

            {processingId === item.id ? (
              <div className="space-y-3">
                <Field label="Nome minimo para sair da inbox">
                  <Input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    placeholder="Nome do item"
                    aria-invalid={draftName.trim().length === 0}
                  />
                </Field>

                <Field label="Tipo">
                  <PillSelector
                    options={inboxTypeOptions}
                    selected={draftType}
                    onSelect={(key) => {
                      setDraftType((key as EntityType | null) ?? null);
                      setSuggestionTypeApplied(false);
                    }}
                  />
                </Field>

                {classificationLoading ? (
                  <div className="rounded-[var(--radius-2xl)] border border-[var(--accent-border)] bg-[var(--accent-soft)]/60 px-4 py-3 text-sm text-[var(--text-secondary)]">
                    Lendo sugestao de classificacao...
                  </div>
                ) : null}

                {classificationSuggestion ? (
                  <div className="space-y-3 rounded-[var(--radius-2xl)] border border-[var(--accent-border)] bg-[var(--accent-soft)]/50 px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge label="Sugestao IA" color="var(--accent)" bgColor="var(--accent-soft)" />
                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                        {classificationSuggestion.confidence === 'high'
                          ? 'Confianca alta'
                          : classificationSuggestion.confidence === 'medium'
                            ? 'Confianca media'
                            : 'Confianca baixa'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                      <p>
                        Tipo sugerido:{' '}
                        <span className="font-semibold text-[var(--text)]">{classificationSuggestion.suggestedType}</span>
                        {suggestionTypeApplied ? ' · pre-preenchido como sugestao' : ''}
                      </p>
                      <p>
                        Vinculo sugerido:{' '}
                        <span className="font-semibold text-[var(--text)]">
                          {classificationSuggestion.suggestedLink.kind === 'none'
                            ? 'nenhum'
                            : `${classificationSuggestion.suggestedLink.kind} · ${classificationSuggestion.suggestedLink.label}`}
                        </span>
                      </p>
                      <p>{classificationSuggestion.reason}</p>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                  Para sair da inbox, o item precisa de <span className="font-semibold text-[var(--text)]">tipo</span> e <span className="font-semibold text-[var(--text)]">nome</span>. Data continua opcional.
                </div>

                {!draftType ? (
                  <div className="rounded-[var(--radius-2xl)] border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-4 py-3 text-sm text-[var(--text-secondary)]">
                    O adiamento so fica disponivel depois que voce classificar um tipo.
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => void handleKeepInInbox(item)} disabled={submitting}>
                    <Inbox className="h-4 w-4" />
                    Manter na inbox
                  </Button>
                  <Button onClick={() => void handleConvert(item, 'active')} disabled={!canLeaveInbox || submitting}>
                    <FilePlus2 className="h-4 w-4" />
                    Converter
                  </Button>
                  <Button variant="secondary" onClick={() => void handleConvert(item, 'done')} disabled={!canLeaveInbox || submitting}>
                    <CheckCheck className="h-4 w-4" />
                    Concluir
                  </Button>
                  <Button variant="ghost" onClick={() => void handleConvert(item, 'paused')} disabled={!canLeaveInbox || submitting}>
                    <Clock3 className="h-4 w-4" />
                    Adiar
                  </Button>
                  <Button variant="destructive" onClick={() => void handleDiscard(item)} disabled={submitting}>
                    <Trash2 className="h-4 w-4" />
                    Descartar
                  </Button>
                  <Button variant="ghost" onClick={resetProcessor} disabled={submitting}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-base font-semibold text-[var(--text)]">{getInboxTextLabel(item)}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface-alt)] px-2.5 py-1">
                    {item.ai_suggested_type ? `Tipo: ${item.ai_suggested_type}` : 'Sem classificacao'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-1 text-[var(--accent)]">
                    <Sparkles className="h-3 w-3" />
                    Sugestao assistida ao processar
                  </span>
                </div>
                {(() => {
                  const attachment = resolveInboxAttachment(item);
                  if (!attachment) return null;
                  return (
                    <div className="mt-2 inline-flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      {attachment.kind === 'image' ? <FileImage className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                      <span>{attachment.kind === 'image' ? 'Imagem anexada na inbox.' : 'Arquivo anexado na inbox.'}</span>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
              <Button variant="secondary" onClick={() => void beginProcessing(item)}>
                <FilePlus2 className="h-4 w-4" />
                Processar
              </Button>
              <Button variant="destructive" onClick={() => void handleDiscard(item)}>
                <Trash2 className="h-4 w-4" />
                Descartar
              </Button>
            </div>
          </Card>
        ))}

        {inbox.length === 0 ? (
          <Card className="space-y-3 p-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Inbox zero</p>
            <p className="text-base font-semibold text-[var(--text)]">Nenhum item na inbox agora.</p>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">As novas capturas voltam a aparecer aqui para triagem quando necessario.</p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

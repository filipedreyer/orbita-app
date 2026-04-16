import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, Mic } from 'lucide-react';
import { BottomSheet, Button, Card, CardRow, Field, Input, PillSelector } from '../../components/ui';
import { DatePickerField } from '../../components/common/DatePicker';
import { useAuthStore, useDataStore } from '../../store';
import { extractTags } from '../../utils/helpers';
import type { CaptureType, EntityType, FrequencyType, PriorityLevel } from '../../lib/types';

const captureTypes: Array<{ key: string; label: string }> = [
  { key: 'inbox', label: 'Inbox' },
  { key: 'tarefa', label: 'Tarefa' },
  { key: 'nota', label: 'Nota' },
  { key: 'ideia', label: 'Ideia' },
  { key: 'lembrete', label: 'Lembrete' },
  { key: 'habito', label: 'Hábito' },
  { key: 'evento', label: 'Evento' },
  { key: 'meta', label: 'Meta' },
  { key: 'projeto', label: 'Projeto' },
  { key: 'rotina', label: 'Rotina' },
  { key: 'lista', label: 'Lista' },
];

const priorityOptions = [
  { key: 'alta', label: 'Alta', color: 'var(--red)' },
  { key: 'media', label: 'Média', color: 'var(--yellow)' },
  { key: 'baixa', label: 'Baixa', color: '#2563eb' },
];

const freqOptions = [
  { key: 'daily', label: 'Diário' },
  { key: 'weekly', label: 'Semanal' },
  { key: 'monthly', label: 'Mensal' },
];

export function CaptureModal({
  visible,
  onClose,
  initialType = 'tarefa',
}: {
  visible: boolean;
  onClose: () => void;
  initialType?: CaptureType;
}) {
  const session = useAuthStore((state) => state.session);
  const { addItem, addSubItem, addToInbox, uploadImage, items } = useDataStore();

  const [type, setType] = useState<CaptureType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<PriorityLevel | null>(null);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [subItemTexts, setSubItemTexts] = useState<string[]>([]);
  const [newSubItem, setNewSubItem] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showVoiceHint, setShowVoiceHint] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const goals = items.filter((item) => item.type === 'meta' && item.status === 'active');

  useEffect(() => {
    if (!showVoiceHint) return;
    const timeout = window.setTimeout(() => setShowVoiceHint(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [showVoiceHint]);

  function reset() {
    setTitle('');
    setDescription('');
    setDueDate(null);
    setPriority(null);
    setGoalId(null);
    setFrequency('daily');
    setTime('');
    setLocation('');
    setSubItemTexts([]);
    setNewSubItem('');
    setImageUri(null);
    setType(initialType);
  }

  function addSub() {
    if (newSubItem.trim()) {
      setSubItemTexts((state) => [...state, newSubItem.trim()]);
      setNewSubItem('');
    }
  }

  function removeSub(index: number) {
    setSubItemTexts((state) => state.filter((_, currentIndex) => currentIndex !== index));
  }

  function handleImageSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageUri(URL.createObjectURL(file));
    event.target.value = '';
  }

  async function handleSave() {
    if (!title.trim() || !session?.user) return;
    setSaving(true);

    try {
      let imageUrl: string | null = null;
      if (imageUri) {
        imageUrl = await uploadImage(imageUri, `capture_${Date.now()}.jpg`);
      }

      if (type === 'inbox') {
        await addToInbox(title.trim(), imageUrl);
      } else {
        const tags = extractTags(`${title} ${description}`);
        const metadata: Record<string, unknown> = {};
        if (type === 'habito') {
          metadata.frequency = frequency;
          metadata.streak = 0;
          metadata.last_checked = null;
        }
        if (type === 'rotina') {
          metadata.frequency = frequency;
        }
        if (type === 'evento') {
          metadata.time = time || null;
          metadata.location = location || null;
        }

        const created = await addItem({
          user_id: session.user.id,
          type: type as EntityType,
          title: title.trim(),
          description: description || null,
          status: 'active',
          priority: type === 'tarefa' ? priority : null,
          due_date: dueDate,
          completed_at: null,
          goal_id: goalId,
          project_id: null,
          tags,
          reschedule_count: 0,
          metadata,
          image_url: imageUrl,
        });

        if (created && subItemTexts.length > 0) {
          for (const text of subItemTexts) {
            await addSubItem(created.id, text);
          }
        }
      }

      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const showDate = ['tarefa', 'projeto', 'meta', 'evento', 'lembrete'].includes(type);
  const showPriority = type === 'tarefa';
  const showGoal = ['tarefa', 'habito', 'rotina', 'projeto'].includes(type) && goals.length > 0;
  const showFreq = ['habito', 'rotina'].includes(type);
  const showTime = type === 'evento';
  const showSubs = ['tarefa', 'projeto', 'rotina', 'lista'].includes(type);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Nova entrada">
      <div className="space-y-4">
        <Field label="Tipo">
          <PillSelector options={captureTypes} selected={type} onSelect={(key) => setType((key as CaptureType) || 'tarefa')} />
        </Field>

        <Field label="Título">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="O que você quer registrar?" />
              </div>
              <button type="button" className="rounded-full border border-[var(--border)] p-3" onClick={() => setShowVoiceHint(true)}>
                <Mic className="h-4 w-4" />
              </button>
            </div>
            {showVoiceHint ? <p className="text-xs text-[var(--text-secondary)]">Use o microfone do seu teclado para ditar.</p> : null}
          </div>
        </Field>

        {type !== 'inbox' ? (
          <Field label="Descrição">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Detalhes, #tags, @pessoas..."
              className="min-h-24 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm"
            />
          </Field>
        ) : null}

        {showDate ? (
          <Field label="Data">
            <DatePickerField value={dueDate} onChange={setDueDate} />
          </Field>
        ) : null}

        {showTime ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Horário">
              <Input value={time} onChange={(event) => setTime(event.target.value)} placeholder="15:00" />
            </Field>
            <Field label="Local">
              <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Local" />
            </Field>
          </div>
        ) : null}

        {showPriority ? (
          <Field label="Prioridade">
            <PillSelector options={priorityOptions} selected={priority} onSelect={(key) => setPriority(key as PriorityLevel | null)} allowNull />
          </Field>
        ) : null}

        {showFreq ? (
          <Field label="Frequência">
            <PillSelector options={freqOptions} selected={frequency} onSelect={(key) => setFrequency((key as FrequencyType) || 'daily')} />
          </Field>
        ) : null}

        {showGoal ? (
          <Field label="Meta vinculada">
            <PillSelector
              options={[{ key: '__none__', label: 'Nenhuma' }, ...goals.map((goal) => ({ key: goal.id, label: goal.title }))]}
              selected={goalId || '__none__'}
              onSelect={(key) => setGoalId(key === '__none__' ? null : key)}
            />
          </Field>
        ) : null}

        {showSubs ? (
          <Field label={type === 'lista' ? 'Itens da lista' : type === 'rotina' ? 'Exercícios' : 'Sub-itens'}>
            <div className="space-y-2">
              {subItemTexts.map((text, index) => (
                <CardRow key={`${text}-${index}`} isLast={index === subItemTexts.length - 1}>
                  <span className="flex-1 text-sm">{text}</span>
                  <button type="button" onClick={() => removeSub(index)} className="text-sm text-[var(--text-tertiary)]">X</button>
                </CardRow>
              ))}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input value={newSubItem} onChange={(event) => setNewSubItem(event.target.value)} placeholder="Adicionar..." />
                </div>
                <Button size="icon" onClick={addSub}>+</Button>
              </div>
            </div>
          </Field>
        ) : null}

        <Field label="Imagem">
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageSelection}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelection}
              />
              <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-3" onClick={() => cameraInputRef.current?.click()}>
                <Camera className="h-4 w-4" />
                Foto
              </button>
              <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-3" onClick={() => galleryInputRef.current?.click()}>
                <ImagePlus className="h-4 w-4" />
                Galeria
              </button>
            </div>
            {/* DECISÃO: adaptação web para captura de imagem substitui APIs nativas do expo-image-picker */}
            {imageUri ? (
              <Card>
                <div className="flex items-center gap-3">
                  <img src={imageUri} alt="Pré-visualização" className="h-12 w-12 rounded-xl object-cover" />
                  <button type="button" className="text-sm text-[var(--red)]" onClick={() => setImageUri(null)}>Remover</button>
                </div>
              </Card>
            ) : null}
          </div>
        </Field>

        <Button className="w-full" loading={saving} onClick={handleSave}>Salvar</Button>
      </div>
    </BottomSheet>
  );
}

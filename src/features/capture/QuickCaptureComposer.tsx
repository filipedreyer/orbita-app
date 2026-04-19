import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Paperclip } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { useDataStore } from '../../store';

export function QuickCaptureComposer({
  active,
  onSaved,
}: {
  active: boolean;
  onSaved: () => void;
}) {
  const addToInbox = useDataStore((state) => state.addToInbox);
  const uploadImage = useDataStore((state) => state.uploadImage);
  const [text, setText] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentFileName, setAttachmentFileName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!active) {
      setText('');
      setAttachmentPreview(null);
      setAttachmentFileName(null);
    }
  }, [active]);

  const canSave = useMemo(() => text.trim().length > 0 || !!attachmentPreview, [attachmentPreview, text]);

  function handleAttachmentSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAttachmentPreview(URL.createObjectURL(file));
    setAttachmentFileName(file.name);
    event.target.value = '';
  }

  async function handleSave() {
    if (!canSave || saving) return;

    setSaving(true);
    try {
      let attachmentUrl: string | null = null;
      if (attachmentPreview) {
        // TODO: conectar com backend de upload
        // Enquanto o inbox nao expuser attachment_url dedicado no schema, a URL
        // do arquivo continua sendo persistida no campo legado image_url.
        attachmentUrl = await uploadImage(attachmentPreview, attachmentFileName ?? `capture_${Date.now()}`);
      }

      await addToInbox(text.trim(), attachmentUrl);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4 rounded-[var(--radius-4xl)] border border-[var(--accent-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Captura rápida</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Texto livre ou anexo direto para a inbox, sem estruturar agora.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <Input
            autoFocus
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="captura rápida"
            className="border-none bg-[var(--surface-alt)] text-base shadow-none focus:border-none focus:bg-[var(--surface)]"
          />
        </div>
        <input ref={attachmentInputRef} type="file" accept="*/*" className="hidden" onChange={handleAttachmentSelection} />
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface)]"
          onClick={() => attachmentInputRef.current?.click()}
          aria-label="Adicionar anexo"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--accent)] text-white shadow-[var(--shadow-emphasis)] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void handleSave()}
          aria-label="Salvar captura rápida"
          disabled={!canSave || saving}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>

      {attachmentFileName ? (
        <div className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          Anexo selecionado: <span className="font-medium text-[var(--text)]">{attachmentFileName}</span>
        </div>
      ) : null}
    </section>
  );
}

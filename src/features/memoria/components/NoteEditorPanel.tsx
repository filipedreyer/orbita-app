import { useEffect, useState } from 'react';
import { useActionFeedback } from '../../../components/feedback/ActionFeedbackContext';
import { BottomSheet, Button, Input } from '../../../components/ui';
import { RichTextEditor } from '../../../components/editor/RichTextEditor';
import { IATextAnalyzer } from '../../ia/IATextAnalyzer';

export function NoteEditorPanel({
  visible,
  title: initialTitle,
  content: initialContent,
  eyebrow,
  onClose,
  onSave,
}: {
  visible: boolean;
  title: string;
  content: string;
  eyebrow: string;
  onClose: () => void;
  onSave: (payload: { title: string; content: string }) => Promise<void> | void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const { showFeedback } = useActionFeedback();

  useEffect(() => {
    if (!visible) return;
    setTitle(initialTitle);
    setContent(initialContent);
  }, [visible, initialTitle, initialContent]);

  async function handleSave() {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onSave({ title: title.trim(), content });
      showFeedback('Nota salva com sucesso.');
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={eyebrow}>
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--text)]">Título</span>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título da nota" />
        </label>

        <RichTextEditor value={content} onChange={setContent} />
        <IATextAnalyzer sourceId={`note-editor:${title || 'nova-nota'}`} sourceLabel={title || 'nova nota'} text={content} />

        <div className="flex gap-3">
          <Button className="flex-1" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSave} loading={saving}>
            Salvar
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}

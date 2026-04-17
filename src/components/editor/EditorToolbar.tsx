import type { Editor } from '@tiptap/react';
import { Button } from '../ui/Button';

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <Button type="button" variant={active ? 'primary' : 'ghost'} disabled={disabled} onClick={onClick}>
      {label}
    </Button>
  );
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border)] bg-white p-3">
      <ToolbarButton active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()} label="Normal" />
      <ToolbarButton active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} label="H1" />
      <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" />
      <div className="mx-1 h-11 w-px bg-[var(--border)]" />
      <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} label="Negrito" />
      <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} label="Itálico" />
      <div className="mx-1 h-11 w-px bg-[var(--border)]" />
      <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Lista bullet" />
      <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Lista numerada" />
    </div>
  );
}

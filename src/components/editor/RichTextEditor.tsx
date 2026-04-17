import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import { EditorToolbar } from './EditorToolbar';

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Comece a escrever...',
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '<p></p>',
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[240px] rounded-2xl border border-[var(--border)] bg-white px-4 py-4 outline-none [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-[var(--text-tertiary)] [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '<p></p>';
    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className="space-y-3">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

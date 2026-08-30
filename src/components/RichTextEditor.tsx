import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useRef } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  readOnly?: boolean
}

export function RichTextEditor({
  content,
  onChange,
  readOnly = false,
}: RichTextEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content,
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => {
      if (readOnly) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onChange(ed.getHTML())
      }, 500)
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly)
    }
  }, [editor, readOnly])

  if (!editor) {
    return (
      <div className="rounded-2xl bg-violet-50 p-4 text-sm text-violet-500">
        Loading editor…
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-violet-200 bg-white shadow-inner shadow-violet-100">
      {!readOnly && (
        <div className="flex flex-wrap gap-1 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-2">
          <ToolbarButton
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            label="B"
            className="font-bold"
          />
          <ToolbarButton
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            label="I"
            className="italic"
          />
          <ToolbarButton
            active={editor.isActive('heading', { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            label="H1"
          />
          <ToolbarButton
            active={editor.isActive('heading', { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            label="H2"
          />
          <ToolbarButton
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            label="• List"
          />
          <ToolbarButton
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            label="1. List"
          />
        </div>
      )}
      <EditorContent editor={editor} className="tiptap p-4" />
    </div>
  )
}

function ToolbarButton({
  active,
  onClick,
  label,
  className = '',
}: {
  active: boolean
  onClick: () => void
  label: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-9 min-w-9 rounded-xl px-2 py-1 text-sm font-semibold transition active:scale-95 ${
        active
          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm'
          : 'text-violet-600 hover:bg-violet-100'
      } ${className}`}
    >
      {label}
    </button>
  )
}

export function RichTextDisplay({ content }: { content: string }) {
  if (!content || content === '<p></p>') {
    return <p className="italic text-violet-500/70">No contents listed.</p>
  }
  return (
    <div
      className="tiptap prose max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

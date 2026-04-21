'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

interface EditorProps {
  content: string
  onChange: (content: string) => void
}

export default function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Napiš obsah článku...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const btn = (action: () => void, label: string, active?: boolean) => (
    <button
      onClick={action}
      type="button"
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
        active
          ? 'bg-orange-500 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-2 p-3 border-b border-gray-700">
        {btn(() => editor.chain().focus().toggleBold().run(), 'B', editor.isActive('bold'))}
        {btn(() => editor.chain().focus().toggleItalic().run(), 'I', editor.isActive('italic'))}
        {btn(() => editor.chain().focus().toggleStrike().run(), 'S', editor.isActive('strike'))}
        {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2', editor.isActive('heading', { level: 2 }))}
        {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3', editor.isActive('heading', { level: 3 }))}
        {btn(() => editor.chain().focus().toggleBulletList().run(), 'Seznam', editor.isActive('bulletList'))}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), '1. Seznam', editor.isActive('orderedList'))}
        {btn(() => editor.chain().focus().toggleBlockquote().run(), 'Citace', editor.isActive('blockquote'))}
        {btn(() => editor.chain().focus().setHorizontalRule().run(), '---')}
        {btn(() => {
          const url = window.prompt('URL obrázku:')
          if (url) editor.chain().focus().setImage({ src: url }).run()
        }, 'Obrázek')}
        {btn(() => {
          const url = window.prompt('URL odkazu:')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }, 'Odkaz')}
        {btn(() => editor.chain().focus().undo().run(), 'Zpět')}
        {btn(() => editor.chain().focus().redo().run(), 'Vpřed')}
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none p-4 min-h-64 text-white focus:outline-none"
      />
    </div>
  )
}

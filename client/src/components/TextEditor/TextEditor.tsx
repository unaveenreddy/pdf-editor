import { useState, useRef, useEffect } from 'react'
import { useStore } from '../../store'

interface EditableText {
  id: string
  text: string
  left: number
  top: number
  width: number
  height: number
  pageIndex: number
}

export default function TextEditor() {
  const [editableTexts, setEditableTexts] = useState<EditableText[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const currentPage = useStore((s) => s.currentPage)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingId])

  function handleDoubleClick(e: React.MouseEvent, text: EditableText) {
    e.stopPropagation()
    setEditingId(text.id)
  }

  function handleSave(id: string, newText: string) {
    setEditableTexts((prev) => prev.map((t) => (t.id === id ? { ...t, text: newText } : t)))
    setEditingId(null)
  }

  function handleKeyDown(e: React.KeyboardEvent, id: string) {
    if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  return (
    <div style={{ display: 'none' }}>
      {editableTexts
        .filter((t) => t.pageIndex === currentPage - 1)
        .map((text) => (
          <div
            key={text.id}
            style={{
              position: 'absolute',
              left: text.left,
              top: text.top,
              width: text.width,
              minHeight: text.height,
            }}
          >
            {editingId === text.id ? (
              <textarea
                ref={inputRef}
                defaultValue={text.text}
                onBlur={(e) => handleSave(text.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, text.id)}
                style={{
                  width: '100%',
                  minHeight: text.height,
                  border: '1px solid #1976d2',
                  background: '#fff',
                  padding: 2,
                  fontSize: 12,
                  resize: 'both',
                  outline: 'none',
                }}
              />
            ) : (
              <span
                onDoubleClick={(e) => handleDoubleClick(e, text)}
                style={{ cursor: 'pointer', fontSize: 12, lineHeight: 1.4 }}
              >
                {text.text}
              </span>
            )}
          </div>
        ))}
    </div>
  )
}

export function extractEditableTexts(pageElement: HTMLElement, pageIndex: number): EditableText[] {
  const texts: EditableText[] = []
  const textLayer = pageElement.querySelector('.textLayer')
  if (!textLayer) return texts

  const spans = textLayer.querySelectorAll('span')
  spans.forEach((span, i) => {
    const rect = span.getBoundingClientRect()
    const parentRect = pageElement.getBoundingClientRect()
    texts.push({
      id: `text-${pageIndex}-${i}`,
      text: span.textContent || '',
      left: rect.left - parentRect.left,
      top: rect.top - parentRect.top,
      width: rect.width,
      height: rect.height,
      pageIndex,
    })
  })

  return texts
}

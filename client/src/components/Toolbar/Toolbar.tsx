import { useStore } from '../../store'
import type { ToolType } from '../../types'

const tools: { type: ToolType; label: string; icon: string }[] = [
  { type: 'select', label: 'Select', icon: '↖' },
  { type: 'pen', label: 'Pen', icon: '✏' },
  { type: 'text', label: 'Text', icon: 'T' },
  { type: 'highlight', label: 'Highlight', icon: '🖍' },
  { type: 'image', label: 'Image', icon: '🖼' },
  { type: 'sticky-note', label: 'Note', icon: '📌' },
]

export default function Toolbar() {
  const activeTool = useStore((s) => s.activeTool)
  const setActiveTool = useStore((s) => s.setActiveTool)
  const zoom = useStore((s) => s.zoom)
  const setZoom = useStore((s) => s.setZoom)
  const currentPage = useStore((s) => s.currentPage)
  const pageCount = useStore((s) => s.pageCount)
  const setCurrentPage = useStore((s) => s.setCurrentPage)
  const reset = useStore((s) => s.reset)
  const file = useStore((s) => s.file)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#fff', borderBottom: '1px solid #ddd', userSelect: 'none' }}>
      <span style={{ fontWeight: 600, marginRight: 8 }}>PDF Editor</span>

      <div style={{ display: 'flex', gap: 2, background: '#f0f0f0', borderRadius: 6, padding: 2 }}>
        {tools.map((t) => (
          <button
            key={t.type}
            onClick={() => setActiveTool(t.type)}
            title={t.label}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: 4,
              background: activeTool === t.type ? '#fff' : 'transparent',
              cursor: 'pointer',
              fontWeight: activeTool === t.type ? 600 : 400,
              boxShadow: activeTool === t.type ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} style={navBtnStyle}>
          ◀
        </button>
        <span style={{ fontSize: 13, minWidth: 60, textAlign: 'center' }}>
          {pageCount > 0 ? `${currentPage} / ${pageCount}` : '-'}
        </span>
        <button onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage >= pageCount} style={navBtnStyle}>
          ▶
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={() => setZoom(zoom - 0.1)} style={navBtnStyle}>−</button>
        <span style={{ fontSize: 13, minWidth: 45, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(zoom + 0.1)} style={navBtnStyle}>+</button>
      </div>

      {file && (
        <button onClick={reset} style={{ ...navBtnStyle, color: '#c00', marginLeft: 8 }}>
          ✕ Close
        </button>
      )}
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: '1px solid #ddd',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 12,
  lineHeight: 1,
}

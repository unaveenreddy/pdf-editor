import { useStore } from '../../store'

export default function Sidebar() {
  const pageCount = useStore((s) => s.pageCount)
  const currentPage = useStore((s) => s.currentPage)
  const setCurrentPage = useStore((s) => s.setCurrentPage)
  const annotations = useStore((s) => s.annotations)
  const selectedAnnotationId = useStore((s) => s.selectedAnnotationId)
  const setSelectedAnnotationId = useStore((s) => s.setSelectedAnnotationId)
  const removeAnnotation = useStore((s) => s.removeAnnotation)

  const pageAnnotations = annotations.filter((a) => a.pageIndex === currentPage - 1)

  return (
    <div style={{ width: 220, background: '#fff', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Pages</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                width: 36,
                height: 44,
                border: i + 1 === currentPage ? '2px solid #1976d2' : '1px solid #ddd',
                borderRadius: 4,
                background: i + 1 === currentPage ? '#e3f2fd' : '#fff',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: i + 1 === currentPage ? 600 : 400,
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>
          Annotations ({pageAnnotations.length})
        </h3>
        {pageAnnotations.length === 0 && (
          <p style={{ color: '#999', fontSize: 12 }}>No annotations on this page</p>
        )}
        {pageAnnotations.map((a) => (
          <div
            key={a.id}
            onClick={() => setSelectedAnnotationId(a.id)}
            style={{
              padding: '6px 8px',
              marginBottom: 4,
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
              background: selectedAnnotationId === a.id ? '#e3f2fd' : '#fafafa',
              border: selectedAnnotationId === a.id ? '1px solid #1976d2' : '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>
              {a.type === 'pen' && '✏ Draw'}
              {a.type === 'text' && 'T Text'}
              {a.type === 'highlight' && '🖍 Highlight'}
              {a.type === 'image' && '🖼 Image'}
              {a.type === 'sticky-note' && '📌 Note'}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); removeAnnotation(a.id) }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#c00', fontSize: 14, padding: 0 }}
              title="Delete"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

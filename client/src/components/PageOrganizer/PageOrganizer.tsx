import { useState } from 'react'
import { useStore } from '../../store'

export default function PageOrganizer() {
  const [open, setOpen] = useState(false)
  const pageCount = useStore((s) => s.pageCount)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: '8px 16px',
          border: '1px solid #ddd',
          borderRadius: 6,
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        Pages ({pageCount})
      </button>
      {open && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, maxWidth: 500, width: '100%' }}>
            <h2 style={{ margin: '0 0 16px' }}>Organize Pages</h2>
            <p style={{ color: '#999', marginBottom: 16 }}>
              Reorder, rotate, or delete pages. (Merge/split coming soon)
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Array.from({ length: pageCount }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: 80,
                    height: 100,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fafafa',
                    fontSize: 13,
                    cursor: 'grab',
                  }}
                >
                  Page {i + 1}
                </div>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: 16,
                padding: '8px 20px',
                border: 'none',
                borderRadius: 6,
                background: '#1976d2',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  )
}

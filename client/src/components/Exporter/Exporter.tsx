import { useState } from 'react'
import { useStore } from '../../store'
import { exportPDF } from '../../utils/pdfExport'

export default function Exporter() {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const file = useStore((s) => s.file)
  const annotations = useStore((s) => s.annotations)
  const formFields = useStore((s) => s.formFields)
  const pageCount = useStore((s) => s.pageCount)

  const handleExport = async () => {
    if (!file) return
    setExporting(true)
    try {
      const pdfBytes = await exportPDF(file, annotations, formFields, pageCount)
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `edited-${file.name}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Export failed. Check console for details.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          padding: '12px 24px',
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 14,
          boxShadow: '0 2px 8px rgba(25,118,210,0.3)',
          zIndex: 100,
        }}
      >
        ⬇ Export PDF
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 12, padding: 32, maxWidth: 400, width: '100%' }}
          >
            <h2 style={{ margin: '0 0 16px' }}>Export PDF</h2>
            <p style={{ color: '#666', margin: '0 0 8px' }}>
              {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
            </p>
            <p style={{ color: '#666', margin: '0 0 24px' }}>
              {formFields.length} form field{formFields.length !== 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: '8px 20px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: 6,
                  background: exporting ? '#90caf9' : '#1976d2',
                  color: '#fff',
                  cursor: exporting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {exporting ? 'Exporting...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

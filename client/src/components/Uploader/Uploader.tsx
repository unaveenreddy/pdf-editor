import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useStore } from '../../store'

export default function Uploader() {
  const setFile = useStore((s) => s.setFile)

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    const url = URL.createObjectURL(file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: (() => {
          const fd = new FormData()
          fd.append('file', file)
          return fd
        })(),
      })
      const data = await res.json()
      setFile(file, url, data.pageCount)
    } catch {
      setFile(file, url, 0)
    }
  }, [setFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      style={{
        border: '2px dashed #999',
        borderRadius: 12,
        padding: '60px 40px',
        textAlign: 'center',
        cursor: 'pointer',
        background: isDragActive ? '#e3f2fd' : '#fff',
        transition: 'background 0.2s',
        maxWidth: 500,
        width: '100%',
      }}
    >
      <input {...getInputProps()} />
      <div style={{ fontSize: 48, marginBottom: 16 }}>PDF</div>
      <h2 style={{ margin: '0 0 8px' }}>
        {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
      </h2>
      <p style={{ color: '#666', margin: 0, fontSize: 14 }}>or click to browse files</p>
    </div>
  )
}

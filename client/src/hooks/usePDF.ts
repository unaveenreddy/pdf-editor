import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store'

export function usePDF() {
  const documentUrl = useStore((s) => s.documentUrl)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (documentUrl) {
      setLoading(true)
      const img = new Image()
      img.onload = () => setLoading(false)
      img.onerror = () => setLoading(false)
      img.src = documentUrl
      const timer = setTimeout(() => setLoading(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [documentUrl])

  const getPageDimensions = useCallback(async (pageIndex: number) => {
    return { width: 595, height: 842 }
  }, [])

  return { loading, getPageDimensions }
}

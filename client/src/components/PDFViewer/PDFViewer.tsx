import { useRef, useEffect, useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Canvas, Rect, IText, Polyline, FabricImage } from 'fabric'
import { useStore } from '../../store'
import { usePDF } from '../../hooks/usePDF'
import TextEditor from '../TextEditor/TextEditor'
import type { Annotation } from '../../types'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const penIdMap = new Map<number, string>()
let penIdCounter = 0

export default function PDFViewer() {
  const documentUrl = useStore((s) => s.documentUrl)
  const currentPage = useStore((s) => s.currentPage)
  const zoom = useStore((s) => s.zoom)
  const activeTool = useStore((s) => s.activeTool)
  const addAnnotation = useStore((s) => s.addAnnotation)
  const annotations = useStore((s) => s.annotations)
  const removeAnnotation = useStore((s) => s.removeAnnotation)
  const selectedAnnotationId = useStore((s) => s.selectedAnnotationId)
  const setSelectedAnnotationId = useStore((s) => s.setSelectedAnnotationId)

  const { loading } = usePDF()

  const [numPages, setNumPages] = useState(0)
  const [pageWidth, setPageWidth] = useState(0)
  const [pageHeight, setPageHeight] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<Canvas | null>(null)
  const isDrawingRef = useRef(false)
  const currentPathRef = useRef<{ x: number; y: number }[]>([])

  useEffect(() => {
    if (numPages > 0) {
      useStore.getState().setFile(useStore.getState().file, documentUrl, numPages)
    }
  }, [numPages, documentUrl])

  const loadAnnotations = useCallback((canvas: Canvas, pageIndex: number) => {
    const pageAnns = useStore.getState().annotations.filter((a) => a.pageIndex === pageIndex)
    for (const ann of pageAnns) {
      if (ann.type === 'pen') {
        for (const path of ann.paths) {
          const polyline = new Polyline(path, {
            stroke: ann.strokeColor,
            strokeWidth: ann.strokeWidth,
            fill: undefined,
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            left: 0,
            top: 0,
          })
          ;(polyline as any).data = { annotationId: ann.id, type: ann.type }
          polyline.selectable = true
          canvas.add(polyline)
        }
      } else if (ann.type === 'text') {
        const textbox = new IText(ann.content, {
          left: ann.left,
          top: ann.top,
          fontSize: ann.fontSize,
          fill: ann.fontColor,
          editable: false,
        })
        ;(textbox as any).data = { annotationId: ann.id, type: ann.type }
        textbox.selectable = true
        canvas.add(textbox)
      } else if (ann.type === 'highlight') {
        const rect = new Rect({
          left: ann.left,
          top: ann.top,
          width: ann.width,
          height: ann.height,
          fill: ann.color,
          opacity: ann.opacity,
        })
        ;(rect as any).data = { annotationId: ann.id, type: ann.type }
        rect.selectable = true
        canvas.add(rect)
      } else if (ann.type === 'sticky-note') {
        const rect = new Rect({
          left: ann.left,
          top: ann.top,
          width: ann.isExpanded ? 200 : 24,
          height: ann.isExpanded ? 200 : 24,
          fill: ann.color,
          rx: 4,
          ry: 4,
        })
        ;(rect as any).data = { annotationId: ann.id, type: ann.type }
        rect.selectable = true
        canvas.add(rect)
      }
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !pageWidth || !pageHeight) return

    const canvas = new Canvas(canvasRef.current, {
      width: pageWidth,
      height: pageHeight,
      selection: activeTool === 'select',
      isDrawingMode: false,
    })
    fabricCanvasRef.current = canvas

    canvas.on('mouse:down', (opt: any) => {
      if (activeTool === 'select') return
      const pointer = canvas.getPointer(opt.e)

      if (activeTool === 'pen') {
        isDrawingRef.current = true
        penIdCounter++
        const id = crypto.randomUUID()
        penIdMap.set(penIdCounter, id)
        currentPathRef.current = [{ x: pointer.x, y: pointer.y }]
      } else if (activeTool === 'text') {
        const textbox = new IText('Type here', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 16,
          fill: '#000',
        })
        canvas.add(textbox)
        canvas.setActiveObject(textbox)
        textbox.enterEditing()
        const id = crypto.randomUUID()
        ;(textbox as any).data = { annotationId: id, type: 'text' }
        addAnnotation({
          id,
          type: 'text',
          pageIndex: currentPage - 1,
          left: pointer.x,
          top: pointer.y,
          width: 200,
          height: 24,
          content: 'Type here',
          fontSize: 16,
          fontColor: '#000000',
        })
      } else if (activeTool === 'highlight') {
        isDrawingRef.current = true
        currentPathRef.current = []
      } else if (activeTool === 'image') {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = async (e: any) => {
          const file = e.target.files?.[0]
          if (!file) return
          const url = URL.createObjectURL(file)
          try {
            const img = await FabricImage.fromURL(url)
            const scale = 0.3
            img.set({ left: pointer.x, top: pointer.y, scaleX: scale, scaleY: scale })
            const id = crypto.randomUUID()
            ;(img as any).data = { annotationId: id, type: 'image' }
            canvas.add(img)
            canvas.setActiveObject(img)
            addAnnotation({
              id,
              type: 'image',
              pageIndex: currentPage - 1,
              left: pointer.x,
              top: pointer.y,
              width: img.width! * scale,
              height: img.height! * scale,
              src: url,
            })
          } catch (err) {
            console.error('Failed to load image:', err)
          }
        }
        input.click()
      } else if (activeTool === 'sticky-note') {
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 24,
          height: 24,
          fill: '#FFD54F',
          rx: 4,
          ry: 4,
        })
        const id = crypto.randomUUID()
        ;(rect as any).data = { annotationId: id, type: 'sticky-note' }
        canvas.add(rect)
        addAnnotation({
          id,
          type: 'sticky-note',
          pageIndex: currentPage - 1,
          left: pointer.x,
          top: pointer.y,
          width: 24,
          height: 24,
          content: '',
          color: '#FFD54F',
          isExpanded: false,
        })
      }
    })

    canvas.on('mouse:move', (opt: any) => {
      if (activeTool === 'pen' && isDrawingRef.current) {
        const pointer = canvas.getPointer(opt.e)
        currentPathRef.current.push({ x: pointer.x, y: pointer.y })
        canvas.clear()
        loadAnnotations(canvas, currentPage - 1)
        const path = new Polyline(currentPathRef.current, {
          stroke: '#000',
          strokeWidth: 2,
          fill: undefined,
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
        })
        const id = penIdMap.get(penIdCounter) || crypto.randomUUID()
        ;(path as any).data = { annotationId: id, type: 'pen' }
        canvas.add(path)
      } else if (activeTool === 'highlight' && isDrawingRef.current) {
        const pointer = canvas.getPointer(opt.e)
        currentPathRef.current.push({ x: pointer.x, y: pointer.y })
      }
    })

    canvas.on('mouse:up', () => {
      if ((activeTool === 'pen' || activeTool === 'highlight') && isDrawingRef.current) {
        isDrawingRef.current = false
        if (activeTool === 'pen' && currentPathRef.current.length > 1) {
          addAnnotation({
            id: penIdMap.get(penIdCounter) || crypto.randomUUID(),
            type: 'pen',
            pageIndex: currentPage - 1,
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            paths: [[...currentPathRef.current]],
            strokeColor: '#000000',
            strokeWidth: 2,
          })
        }
        currentPathRef.current = []
      }
    })

    canvas.on('selection:created', (e: any) => {
      const obj = e.selected?.[0]
      if (obj?.data?.annotationId) {
        setSelectedAnnotationId(obj.data.annotationId)
      }
    })

    canvas.on('selection:cleared', () => {
      setSelectedAnnotationId(null)
    })

    canvas.on('object:modified', (e: any) => {
      const obj = e.target
      if (obj?.data?.annotationId) {
        useStore.getState().updateAnnotation(obj.data.annotationId, {
          left: obj.left,
          top: obj.top,
          width: obj.width! * (obj.scaleX || 1),
          height: obj.height! * (obj.scaleY || 1),
        })
      }
    })

    return () => {
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [pageWidth, pageHeight, activeTool, currentPage, addAnnotation, loadAnnotations, setSelectedAnnotationId])

  useEffect(() => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    canvas.clear()
    loadAnnotations(canvas, currentPage - 1)
    canvas.renderAll()
  }, [annotations, currentPage, loadAnnotations])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnotationId) {
        removeAnnotation(selectedAnnotationId)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedAnnotationId, removeAnnotation])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  function onPageLoadSuccess(page: any) {
    const viewport = page.getViewport({ scale: 1 })
    setPageWidth(viewport.width * zoom)
    setPageHeight(viewport.height * zoom)
  }

  return (
    <div ref={containerRef} style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'relative', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', zIndex: 10 }}>
            Loading...
          </div>
        )}
        {documentUrl && (
          <Document
            file={documentUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div style={{ padding: 40 }}>Loading PDF...</div>}
          >
            <Page
              key={`${currentPage}-${zoom}`}
              pageNumber={currentPage}
              scale={zoom}
              onLoadSuccess={onPageLoadSuccess}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        )}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </div>
      <TextEditor />
    </div>
  )
}

export interface PDFDocument {
  id: string
  name: string
  url: string
  pageCount: number
}

export interface Position {
  x: number
  y: number
}

export interface AnnotationBase {
  id: string
  type: 'pen' | 'text' | 'highlight' | 'image' | 'sticky-note'
  pageIndex: number
  left: number
  top: number
  width: number
  height: number
  rotation?: number
}

export interface PenAnnotation extends AnnotationBase {
  type: 'pen'
  paths: { x: number; y: number }[][]
  strokeColor: string
  strokeWidth: number
}

export interface TextAnnotation extends AnnotationBase {
  type: 'text'
  content: string
  fontSize: number
  fontColor: string
  fontFamily?: string
}

export interface HighlightAnnotation extends AnnotationBase {
  type: 'highlight'
  color: string
  opacity: number
}

export interface ImageAnnotation extends AnnotationBase {
  type: 'image'
  src: string
  originalFile?: File
}

export interface StickyNoteAnnotation extends AnnotationBase {
  type: 'sticky-note'
  content: string
  color: string
  isExpanded: boolean
}

export type Annotation = PenAnnotation | TextAnnotation | HighlightAnnotation | ImageAnnotation | StickyNoteAnnotation

export type ToolType = 'select' | 'pen' | 'text' | 'highlight' | 'image' | 'sticky-note'

export interface FormField {
  id: string
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'signature'
  pageIndex: number
  left: number
  top: number
  width: number
  height: number
  name: string
  value?: string | boolean
  options?: string[]
}

export interface ToolSettings {
  strokeColor: string
  strokeWidth: number
  fontSize: number
  fontColor: string
  highlightColor: string
  highlightOpacity: number
}

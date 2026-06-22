import { create } from 'zustand'
import type { Annotation, ToolType, ToolSettings, FormField } from '../types'

interface PDFEditorState {
  file: File | null
  documentUrl: string | null
  pageCount: number
  currentPage: number
  zoom: number

  activeTool: ToolType
  toolSettings: ToolSettings

  annotations: Annotation[]
  formFields: FormField[]

  selectedAnnotationId: string | null

  setFile: (file: File | null, documentUrl: string | null, pageCount: number) => void
  setCurrentPage: (page: number) => void
  setZoom: (zoom: number) => void
  setActiveTool: (tool: ToolType) => void
  setToolSettings: (settings: Partial<ToolSettings>) => void
  addAnnotation: (annotation: Annotation) => void
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void
  removeAnnotation: (id: string) => void
  setSelectedAnnotationId: (id: string | null) => void
  setFormFields: (fields: FormField[]) => void
  updateFormField: (id: string, value: string | boolean) => void
  reset: () => void
}

const defaultToolSettings: ToolSettings = {
  strokeColor: '#000000',
  strokeWidth: 2,
  fontSize: 16,
  fontColor: '#000000',
  highlightColor: '#FFEB3B',
  highlightOpacity: 0.4,
}

export const useStore = create<PDFEditorState>((set) => ({
  file: null,
  documentUrl: null,
  pageCount: 0,
  currentPage: 1,
  zoom: 1,

  activeTool: 'select',
  toolSettings: defaultToolSettings,

  annotations: [],
  formFields: [],

  selectedAnnotationId: null,

  setFile: (file, documentUrl, pageCount) => set({ file, documentUrl, pageCount, currentPage: 1, annotations: [], formFields: [] }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(5, zoom)) }),

  setActiveTool: (tool) => set({ activeTool: tool, selectedAnnotationId: null }),

  setToolSettings: (settings) => set((s) => ({ toolSettings: { ...s.toolSettings, ...settings } })),

  addAnnotation: (annotation) => set((s) => ({ annotations: [...s.annotations, annotation] })),

  updateAnnotation: (id, updates) => set((s) => ({
    annotations: s.annotations.map((a) => (a.id === id ? { ...a, ...updates } as Annotation : a)),
  })),

  removeAnnotation: (id) => set((s) => ({
    annotations: s.annotations.filter((a) => a.id !== id),
    selectedAnnotationId: s.selectedAnnotationId === id ? null : s.selectedAnnotationId,
  })),

  setSelectedAnnotationId: (id) => set({ selectedAnnotationId: id }),

  setFormFields: (fields) => set({ formFields: fields }),

  updateFormField: (id, value) => set((s) => ({
    formFields: s.formFields.map((f) => (f.id === id ? { ...f, value } : f)),
  })),

  reset: () => set({
    file: null,
    documentUrl: null,
    pageCount: 0,
    currentPage: 1,
    zoom: 1,
    activeTool: 'select',
    toolSettings: defaultToolSettings,
    annotations: [],
    formFields: [],
    selectedAnnotationId: null,
  }),
}))

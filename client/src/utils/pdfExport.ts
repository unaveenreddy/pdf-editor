import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { Annotation, FormField } from '../types'

export async function exportPDF(
  file: File,
  annotations: Annotation[],
  formFields: FormField[],
  pageCount: number,
): Promise<Uint8Array> {
  const arrayBuf = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuf)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const pages = pdfDoc.getPages()

  for (const ann of annotations) {
    const page = pages[ann.pageIndex]
    if (!page) continue
    const { width, height } = page.getSize()

    switch (ann.type) {
      case 'pen': {
        for (const path of ann.paths) {
          if (path.length < 2) continue
          const ops = path.map((p, i) => (i === 0 ? `${p.x} ${height - p.y} m` : `${p.x} ${height - p.y} l`)).join('\n')
          page.drawSvgPath(ops, {
            borderColor: rgb(0, 0, 0),
            borderWidth: ann.strokeWidth,
          })
        }
        break
      }
      case 'text': {
        page.drawText(ann.content, {
          x: ann.left,
          y: height - ann.top - ann.fontSize,
          size: ann.fontSize,
          font: helvetica,
          color: rgb(0, 0, 0),
        })
        break
      }
      case 'highlight': {
        page.drawRectangle({
          x: ann.left,
          y: height - ann.top - ann.height,
          width: ann.width,
          height: ann.height,
          color: rgb(1, 0.92, 0.23),
          opacity: ann.opacity,
        })
        break
      }
    }
  }

  for (const field of formFields) {
    const page = pages[field.pageIndex]
    if (!page || field.type !== 'text' || typeof field.value !== 'string') continue
    const { height } = page.getSize()
    page.drawText(field.value, {
      x: field.left,
      y: height - field.top - 12,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0),
    })
  }

  return await pdfDoc.save()
}

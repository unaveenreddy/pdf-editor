import { Router } from 'express'

export const exportRouter = Router()

exportRouter.post('/export', async (req, res) => {
  try {
    const { filePath, annotations, formFields } = req.body

    const fs = await import('fs/promises')
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')

    const uploadsDir = new URL('..', import.meta.url).pathname
    const fullPath = new URL(`../uploads/${filePath}`, import.meta.url).pathname

    const pdfBytes = await fs.readFile(fullPath)
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const pages = pdfDoc.getPages()

    for (const ann of (annotations || [])) {
      const page = pages[ann.pageIndex]
      if (!page) continue
      const { height } = page.getSize()

      if (ann.type === 'text') {
        page.drawText(ann.content || '', {
          x: ann.left,
          y: height - ann.top - (ann.fontSize || 16),
          size: ann.fontSize || 16,
          font: helvetica,
          color: rgb(0, 0, 0),
        })
      } else if (ann.type === 'highlight') {
        page.drawRectangle({
          x: ann.left,
          y: height - ann.top - (ann.height || 20),
          width: ann.width || 100,
          height: ann.height || 20,
          color: rgb(1, 0.92, 0.23),
          opacity: ann.opacity || 0.4,
        })
      }
    }

    for (const field of (formFields || [])) {
      const page = pages[field.pageIndex]
      if (!page || field.type !== 'text') continue
      const { height } = page.getSize()
      page.drawText(String(field.value || ''), {
        x: field.left,
        y: height - field.top - 12,
        size: 12,
        font: helvetica,
        color: rgb(0, 0, 0),
      })
    }

    const outBytes = await pdfDoc.save()
    res.set('Content-Type', 'application/pdf')
    res.set('Content-Disposition', 'attachment; filename="exported.pdf"')
    res.send(Buffer.from(outBytes))
  } catch (err) {
    console.error('Export error:', err)
    res.status(500).json({ error: 'Export failed' })
  }
})

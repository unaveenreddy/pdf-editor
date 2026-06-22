import { Router } from 'express'

export const mergeRouter = Router()

mergeRouter.post('/merge', async (req, res) => {
  try {
    const { files } = req.body

    const fs = await import('fs/promises')
    const { PDFDocument } = await import('pdf-lib')

    const mergedPdf = await PDFDocument.create()

    for (const fileName of (files || [])) {
      const filePath = new URL(`../uploads/${fileName}`, import.meta.url).pathname
      const pdfBytes = await fs.readFile(filePath)
      const pdf = await PDFDocument.load(pdfBytes)
      const indices = pdf.getPageIndices()
      const copiedPages = await mergedPdf.copyPages(pdf, indices)
      for (const page of copiedPages) {
        mergedPdf.addPage(page)
      }
    }

    const outBytes = await mergedPdf.save()
    res.set('Content-Type', 'application/pdf')
    res.set('Content-Disposition', 'attachment; filename="merged.pdf"')
    res.send(Buffer.from(outBytes))
  } catch (err) {
    console.error('Merge error:', err)
    res.status(500).json({ error: 'Merge failed' })
  }
})

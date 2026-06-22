import { Router } from 'express'

export const splitRouter = Router()

splitRouter.post('/split', async (req, res) => {
  try {
    const { file, ranges } = req.body

    const fs = await import('fs/promises')
    const { PDFDocument } = await import('pdf-lib')

    const filePath = new URL(`../uploads/${file}`, import.meta.url).pathname
    const pdfBytes = await fs.readFile(filePath)
    const pdfDoc = await PDFDocument.load(pdfBytes)

    const outPdf = await PDFDocument.create()
    const indices = (ranges || [0]).map((i: number) => i)
    const copiedPages = await outPdf.copyPages(pdfDoc, indices)
    for (const page of copiedPages) {
      outPdf.addPage(page)
    }

    const outBytes = await outPdf.save()
    res.set('Content-Type', 'application/pdf')
    res.set('Content-Disposition', 'attachment; filename="split.pdf"')
    res.send(Buffer.from(outBytes))
  } catch (err) {
    console.error('Split error:', err)
    res.status(500).json({ error: 'Split failed' })
  }
})

import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`
    cb(null, unique)
  },
})

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files allowed'))
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
})

export const uploadRouter = Router()

uploadRouter.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' })
      return
    }

    const { PDFDocument } = await import('pdf-lib')
    const fs = await import('fs/promises')
    const filePath = req.file.path
    const pdfBytes = await fs.readFile(filePath)
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pageCount = pdfDoc.getPageCount()

    res.json({
      id: req.file.filename,
      name: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      pageCount,
      size: req.file.size,
    })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: 'Failed to process PDF' })
  }
})

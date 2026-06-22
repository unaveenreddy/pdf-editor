import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { uploadRouter } from './routes/upload.js'
import { exportRouter } from './routes/export.js'
import { mergeRouter } from './routes/merge.js'
import { splitRouter } from './routes/split.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use('/api', uploadRouter)
app.use('/api', exportRouter)
app.use('/api', mergeRouter)
app.use('/api', splitRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist')
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

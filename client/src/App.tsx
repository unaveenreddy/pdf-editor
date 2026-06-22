import { useStore } from './store'
import Uploader from './components/Uploader/Uploader'
import PDFViewer from './components/PDFViewer/PDFViewer'
import Toolbar from './components/Toolbar/Toolbar'
import Sidebar from './components/Sidebar/Sidebar'
import Exporter from './components/Exporter/Exporter'

export default function App() {
  const file = useStore((s) => s.file)

  if (!file) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <Uploader />
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      <Toolbar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <PDFViewer />
        <Exporter />
      </div>
    </div>
  )
}

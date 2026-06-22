export interface TextItem {
  text: string
  left: number
  top: number
  width: number
  height: number
  fontName?: string
  fontSize?: number
}

export interface TextLayerData {
  items: TextItem[]
  pageWidth: number
  pageHeight: number
}

export function extractTextLayer(pdfPage: any): TextLayerData {
  const items: TextItem[] = []
  try {
    const textContent = pdfPage.getTextContent()
    for (const item of textContent.items) {
      items.push({
        text: item.str,
        left: item.transform[4],
        top: item.transform[5],
        width: item.width,
        height: item.height,
        fontName: item.fontName,
        fontSize: item.fontSize,
      })
    }
  } catch {
  }
  return {
    items,
    pageWidth: pdfPage.viewport?.width || 595,
    pageHeight: pdfPage.viewport?.height || 842,
  }
}

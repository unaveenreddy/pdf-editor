import type { FormField } from '../types'

export function extractFormFields(pdfDoc: any): FormField[] {
  const fields: FormField[] = []
  try {
    const form = pdfDoc.getForm()
    if (!form) return fields
    const formFields: any[] = form.getFields() || []
    for (const f of formFields) {
      fields.push({
        id: f.getName(),
        type: mapFieldType(f.constructor.name),
        pageIndex: 0,
        left: 0,
        top: 0,
        width: 100,
        height: 20,
        name: f.getName(),
        value: f.getText(),
      })
    }
  } catch {
  }
  return fields
}

function mapFieldType(type: string): FormField['type'] {
  if (type.includes('CheckBox')) return 'checkbox'
  if (type.includes('Radio')) return 'radio'
  if (type.includes('Dropdown') || type.includes('List')) return 'dropdown'
  return 'text'
}

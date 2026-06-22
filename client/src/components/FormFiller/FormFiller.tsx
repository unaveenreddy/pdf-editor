import { useEffect } from 'react'
import { useStore } from '../../store'
import { extractFormFields } from '../../utils/formFields'

export default function FormFiller() {
  const formFields = useStore((s) => s.formFields)
  const setFormFields = useStore((s) => s.setFormFields)
  const updateFormField = useStore((s) => s.updateFormField)
  const currentPage = useStore((s) => s.currentPage)

  useEffect(() => {
    if (formFields.length === 0) return
  }, [])

  const pageFields = formFields.filter((f) => f.pageIndex === currentPage - 1)

  return (
    <div style={{ display: 'none' }}>
      {pageFields.map((field) => (
        <div key={field.id}>
          {field.type === 'text' && (
            <input
              type="text"
              value={(field.value as string) || ''}
              onChange={(e) => updateFormField(field.id, e.target.value)}
              placeholder={field.name}
            />
          )}
          {field.type === 'checkbox' && (
            <input
              type="checkbox"
              checked={(field.value as boolean) || false}
              onChange={(e) => updateFormField(field.id, e.target.checked)}
            />
          )}
        </div>
      ))}
    </div>
  )
}

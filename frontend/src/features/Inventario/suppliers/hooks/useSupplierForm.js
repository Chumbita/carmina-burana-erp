import { useEffect, useState } from 'react'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\d+$/

export function useSupplierForm({ supplier, emptySupplier, open, onSubmit }) {
  const [form, setForm] = useState(emptySupplier)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(supplier || emptySupplier)
    setError('')
  }, [emptySupplier, supplier, open])

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validate() {
    if (!form.name.trim()) return 'El nombre es obligatorio'
    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) return 'El email no es válido'
    if (form.phone.trim() && !PHONE_PATTERN.test(form.phone.trim())) {
      return 'El teléfono solo puede contener números'
    }
    return ''
  }

  function submit(event) {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    onSubmit(form)
  }

  return { error, form, setField, submit }
}

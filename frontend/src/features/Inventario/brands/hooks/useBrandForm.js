import { useEffect, useState } from 'react'

export function useBrandForm({ brand, emptyBrand, open, onSubmit }) {
  const [form, setForm] = useState(emptyBrand)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(brand || emptyBrand)
    setError('')
  }, [brand, emptyBrand, open])

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    event.stopPropagation()
    if (!form.name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    onSubmit(form)
  }

  return { error, form, setField, submit }
}

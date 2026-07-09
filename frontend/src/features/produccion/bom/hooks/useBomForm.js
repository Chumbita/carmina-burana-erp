import { useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createBomSchema } from '../schemas/bom.schema'
import { useItems } from '@/features/Inventario/items/hooks/useItems'

function getDefaultValidFrom() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

const DEFAULT_VALUES = {
  parent_item_id: 0,
  quantity: 1,
  uom_id: 0,
  valid_from: getDefaultValidFrom(),
  lines: [
    { component_item_id: 0, quantity: 1, uom: null },
  ],
}

function extractErrorMessage(err) {
  if (err?.response?.data?.detail) return err.response.data.detail
  if (err?.message) return err.message
  return 'Error al crear la fórmula'
}

export function useBomForm(onSubmit) {
  const [error, setError] = useState(null)

  const { items, loading: itemsLoading } = useItems()

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { isDirty, isValid },
  } = useForm({
    resolver: zodResolver(createBomSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  })

  const handleAddLine = useCallback(() => {
    append({ component_item_id: 0, quantity: 1, uom: null })
  }, [append])

  const handleRemoveLine = useCallback((index) => {
    if (fields.length > 1) {
      remove(index)
    }
  }, [fields.length, remove])

  const handleFormSubmit = useCallback(async (data) => {
    setError(null)

    try {
      await onSubmit({
        parent_item_id: data.parent_item_id,
        quantity: data.quantity,
        uom_id: data.uom_id,
        valid_from: data.valid_from || null,
        lines: data.lines.map(line => ({
          component_item_id: line.component_item_id,
          quantity: line.quantity,
          uom: line.uom || null,
        })),
      })
      reset()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }, [onSubmit, reset])

  return {
    control,
    fields,
    isDirty,
    isValid,
    error,
    items,
    itemsLoading,
    handleAddLine,
    handleRemoveLine,
    handleFormSubmit,
    handleSubmit,
    setValue,
  }
}

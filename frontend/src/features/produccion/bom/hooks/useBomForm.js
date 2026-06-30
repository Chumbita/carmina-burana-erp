import { useState, useCallback, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createBomSchema } from '../schemas/bom.schema'
import { useSupplies } from '@/features/Inventario/gestion_insumos/hooks/useSupplies'
import { useInputs } from '@/features/Inventario/gestion_insumos/hooks/useInputs'
import { useUoms } from '@/features/Inventario/gestion_insumos/hooks/useUoms'

function getDefaultValidFrom() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

const DEFAULT_VALUES = {
  parent_item_id: 0,
  valid_from: getDefaultValidFrom(),
  lines: [
    { component_item_id: 0, quantity: 1, uom: null },
  ],
}

export function useBomForm(onSubmit) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { supplies, loading: suppliesLoading } = useSupplies()
  const { inputs, loading: inputsLoading } = useInputs()
  const { uoms, loading: uomsLoading } = useUoms()

  const items = useMemo(() => {
    const supplyItems = supplies.map(s => ({ id: s.id, name: s.name, type: 'Supply' }))
    const inputItems = inputs.map(i => ({ id: i.id, name: i.name, type: 'Input' }))
    return [...supplyItems, ...inputItems]
  }, [supplies, inputs])

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty, isValid, errors },
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
    setLoading(true)
    setError(null)

    try {
      const submissionData = {
        parent_item_id: data.parent_item_id,
        valid_from: data.valid_from || null,
        lines: data.lines.map(line => ({
          component_item_id: line.component_item_id,
          quantity: line.quantity,
          uom: line.uom || null,
        })),
      }

      await onSubmit(submissionData)
      reset()
    } catch (err) {
      let errorMessage = 'Error al crear la fórmula'
      if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err?.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [onSubmit, reset])

  return {
    control,
    fields,
    errors,
    isDirty,
    isValid,
    loading,
    error,
    items,
    itemsLoading: suppliesLoading || inputsLoading,
    uoms,
    uomsLoading,
    handleAddLine,
    handleRemoveLine,
    handleFormSubmit,
    handleSubmit,
    reset,
  }
}

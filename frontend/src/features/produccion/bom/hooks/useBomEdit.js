import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBomSchema } from '../schemas/bom.schema'
import { useItems } from '@/hooks/useItems'
import { bomService } from '../services/bomService'

function extractErrorMessage(err) {
  if (err?.response?.data?.detail) return err.response.data.detail
  if (err?.message) return err.message
  return 'Error al guardar la fórmula'
}

export function useBomEdit(bom) {
  const [error, setError] = useState(null)
  const newLinesRef = useRef(new Set())
  const [newLineVersion, setNewLineVersion] = useState(0)
  const { items, loading: itemsLoading } = useItems()

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { isDirty, isValid },
  } = useForm({
    resolver: zodResolver(createBomSchema),
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  })

  useEffect(() => {
    if (bom) {
      newLinesRef.current = new Set()
      const defaultValues = {
        parent_item_id: bom.parent_item_id,
        quantity: Number(bom.quantity) || 0,
        uom_id: bom.bom_uom_id,
        valid_from: bom.valid_from
          ? new Date(bom.valid_from).toISOString().slice(0, 16)
          : '',
        lines: bom.lines.map((line) => ({
          component_item_id: line.component_item_id,
          quantity: Number(line.quantity) || 0,
          uom: line.uom_id ?? null,
        })),
      }
      reset(defaultValues)
    }
  }, [bom, reset])

  const handleAddLine = useCallback(() => {
    append({ component_item_id: 0, quantity: 1, uom: null })
    newLinesRef.current.add(fields.length)
    setNewLineVersion((v) => v + 1)
  }, [append, fields.length])

  const handleRemoveLine = useCallback(
    (index) => {
      if (fields.length > 1) {
        remove(index)
        const next = new Set()
        for (const i of newLinesRef.current) {
          if (i < index) next.add(i)
          else if (i > index) next.add(i - 1)
        }
        newLinesRef.current = next
        setNewLineVersion((v) => v + 1)
      }
    },
    [fields.length, remove],
  )

  const isLineNew = useCallback(
    (index) => newLinesRef.current.has(index),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newLineVersion],
  )

  const handleSave = useCallback(
    async (data) => {
      setError(null)
      try {
        const response = await bomService.create({
          parent_item_id: data.parent_item_id,
          quantity: data.quantity,
          uom_id: data.uom_id,
          lines: data.lines.map((line) => ({
            component_item_id: line.component_item_id,
            quantity: line.quantity,
            uom: line.uom || null,
          })),
        })
        return { success: true, newId: response.id }
      } catch (err) {
        setError(extractErrorMessage(err))
        return { success: false }
      }
    },
    [],
  )

  return {
    control,
    fields,
    isDirty,
    isValid,
    error,
    items,
    itemsLoading,
    isLineNew,
    handleAddLine,
    handleRemoveLine,
    handleSubmit,
    handleSave,
    setValue,
    reset,
  }
}

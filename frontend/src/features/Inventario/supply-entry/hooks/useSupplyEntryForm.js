import { useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { FORM_DEFAULT_VALUES } from '../constants/supplyEntry.constants'

// Schema validation
const supplyItemSchema = z.object({
  inputId: z.number().min(1, 'Seleccione un insumo'),
  quantity: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
  unitCost: z.number().min(0, 'El costo unitario debe ser mayor o igual a 0'),
  expirationDate: z.string().optional(),
  batchNumber: z.string().optional(),
  comment: z.string().optional(),
})

const supplyEntrySchema = z.object({
  supplier: z.string().min(1, 'El proveedor es requerido'),
  entryDate: z.string().min(1, 'La fecha de ingreso es requerida'),
  invoiceNumber: z.string().optional(),
  description: z.string().optional(),
  items: z.array(supplyItemSchema).min(1, 'Debe agregar al menos un artículo'),
})

/**
 * Custom hook for managing supply entry form logic
 * @param {Array} availableInputs - List of available inputs
 * @param {Function} onSubmit - Submit callback function
 */
export function useSupplyEntryForm(availableInputs = [], onSubmit) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [receptionId, setReceptionId] = useState(null)

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { isDirty, isValid, errors },
  } = useForm({
    resolver: zodResolver(supplyEntrySchema),
    defaultValues: FORM_DEFAULT_VALUES,
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  const watchedItems = watch('items')

  // Calculate total cost
  const totalCost = watchedItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unitCost)
  }, 0)

  // Generate unique reception ID
  const generateReceptionId = useCallback(() => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `REC-${date}-${random}`
  }, [])

  // Add new item
  const handleAddItem = useCallback(() => {
    append({
      inputId: 0,
      quantity: 1,
      unitCost: 0,
      expirationDate: '',
      batchNumber: '',
      comment: '',
    })
  }, [append])

  // Remove item
  const handleRemoveItem = useCallback((index) => {
    if (fields.length > 1) {
      remove(index)
    }
  }, [fields.length, remove])

  // Handle form submission
  const handleFormSubmit = useCallback(async (data) => {
    setLoading(true)
    setError(null)

    try {
      const newReceptionId = generateReceptionId()
      
      const submissionData = {
        ...data,
        receptionId: newReceptionId,
        totalCost,
        items: data.items.map(item => ({
          ...item,
          inputName: availableInputs.find(input => input.id === item.inputId)?.name,
          inputUnit: availableInputs.find(input => input.id === item.inputId)?.unit,
          itemTotal: item.quantity * item.unitCost,
        }))
      }

      await onSubmit(submissionData)
      
      setReceptionId(newReceptionId)
      setSuccess(true)
      
      // Reset after success
      setTimeout(() => {
        reset()
        setSuccess(false)
        setReceptionId(null)
      }, 3000)
      
    } catch (err) {
      console.error('Error creating supply entry:', err)
      
      // Extraer mensaje de error de diferentes formatos
      let errorMessage = 'Error al registrar el abastecimiento'
      if (err.message) {
        errorMessage = err.message
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [generateReceptionId, totalCost, availableInputs, onSubmit, reset])

  // Reset form
  const handleReset = useCallback(() => {
    reset()
    setError(null)
    setSuccess(false)
    setReceptionId(null)
  }, [reset])

  return {
    // Form state
    control,
    fields,
    watchedItems,
    totalCost,
    isDirty,
    isValid,
    setValue,
    errors,
    
    // Loading states
    loading,
    error,
    success,
    receptionId,
    
    // Actions
    handleAddItem,
    handleRemoveItem,
    handleFormSubmit,
    handleReset,
    handleSubmit,
  }
}
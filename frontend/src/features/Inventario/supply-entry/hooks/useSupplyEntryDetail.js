import { useState, useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { ANNULMENT_RESTRICTIONS } from '../constants/supplyEntry.constants'
import { inputEntryService } from '../services/inputEntryService'

// Schema for annulment confirmation
const annulmentSchema = z.object({
  reason: z.string().min(1, 'Debe especificar un motivo para anular'),
})

/**
 * Custom hook for managing supply entry detail logic
 * @param {string} entryId - ID of the entry to load
 * @param {Function} onAnnul - Callback for annulment
 */
export function useSupplyEntryDetail(entryId, onAnnul) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [entry, setEntry] = useState(null)
  const [showAnnulDialog, setShowAnnulDialog] = useState(false)
  const [annulling, setAnnulling] = useState(false)

  // Annulment form
  const {
    register: registerAnnulment,
    handleSubmit: handleAnnulmentSubmit,
    reset: resetAnnulment,
    formState: { isValid: isAnnulmentValid },
  } = useForm({
    resolver: zodResolver(annulmentSchema),
    defaultValues: {
      reason: '',
    },
  })

  // Load entry details
  const loadEntryDetail = useCallback(async () => {
    if (!entryId) return

    try {
      setLoading(true)
      setError(null)
      
      // Llamada real a la API
      const entryData = await inputEntryService.getById(entryId)
      
      setEntry(entryData)
    } catch (err) {
      console.error('Error loading entry detail:', err)
      setError(err.response?.data?.detail || err.message || 'Error al cargar el abastecimiento')
    } finally {
      setLoading(false)
    }
  }, [entryId])

  // Check if annulment is allowed
  const canAnnul = useMemo(() => {
    if (!entry) return false
    
    const entryDate = new Date(entry.created_at || entry.entry_date)
    const now = new Date()
    const hoursDiff = (now - entryDate) / (1000 * 60 * 60)
    
    const withinTimeLimit = hoursDiff <= ANNULMENT_RESTRICTIONS.HOURS_LIMIT
    // Por ahora asumimos que no hay consumo hasta que implementemos esa lógica
    const batchesConsumed = false 
    
    return withinTimeLimit && !batchesConsumed
  }, [entry])

  // Handle annulment
  const handleAnnul = useCallback(async (data) => {
    if (!entryId) return

    try {
      setAnnulling(true)
      setError(null)
      
      await inputEntryService.cancel(entryId, data.reason)
      
      // Reload data from backend to get updated state
      const updatedEntry = await inputEntryService.getById(entryId)
      setEntry(updatedEntry)
      
      setShowAnnulDialog(false)
      resetAnnulment()
      
    } catch (err) {
      console.error('Error annulling entry:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Error al anular el abastecimiento'
      setError(errorMessage)
    } finally {
      setAnnulling(false)
    }
  }, [entryId, resetAnnulment])

  // Export functionality
  const handleExport = useCallback(() => {
    console.log('Exporting entry:', entryId)
    // TODO: Implement export functionality
  }, [entryId])

  // Print functionality
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // Navigate to batch
  const handleNavigateToBatch = useCallback((batchId) => {
    console.log('Navigate to batch:', batchId)
    // TODO: Navigate to batch detail
  }, [])

  // Initialize
  useEffect(() => {
    loadEntryDetail()
  }, [loadEntryDetail])

  return {
    // State
    loading,
    error,
    entry,
    showAnnulDialog,
    annulling,
    
    // Computed values
    canAnnul,
    isAnnulmentValid,
    
    // Form
    registerAnnulment,
    handleAnnulmentSubmit,
    
    // Actions
    setShowAnnulDialog,
    handleAnnul,
    handleExport,
    handlePrint,
    handleNavigateToBatch,
    loadEntryDetail,
  }
}
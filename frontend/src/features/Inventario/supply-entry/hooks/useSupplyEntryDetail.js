import { useState, useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { supplyEntryService } from '../services/supplyEntryService'
import { annulmentSchema } from '../schemas/supplyEntry.schema'
import { normalizeEntry } from '../dto/supplyEntry.dto'

/**
 * Custom hook for managing supply entry detail logic
 * @param {string} entryId - ID of the entry to load
 */
export function useSupplyEntryDetail(entryId) {
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

      const entryData = await supplyEntryService.getById(entryId)

      setEntry(normalizeEntry(entryData))
    } catch (err) {
      console.error('Error loading entry detail:', err)
      setError(err.response?.data?.detail || err.message || 'Error al cargar el abastecimiento')
    } finally {
      setLoading(false)
    }
  }, [entryId])

  // Check if annulment is allowed
  // Sin límite temporal: se puede anular mientras los lotes no hayan sido consumidos
  // El backend valida el consumo real; el frontend solo bloquea si ya está anulada
  const canAnnul = useMemo(() => {
    if (!entry) return false
    return entry.status === 'active'
  }, [entry])

  // Handle annulment
  const handleAnnul = useCallback(async (data) => {
    if (!entryId) return

    try {
      setAnnulling(true)
      setError(null)

      await supplyEntryService.cancel(entryId, data.reason)

      // Reload data from backend to get updated state
      const updatedEntry = await supplyEntryService.getById(entryId)
      setEntry(normalizeEntry(updatedEntry))

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

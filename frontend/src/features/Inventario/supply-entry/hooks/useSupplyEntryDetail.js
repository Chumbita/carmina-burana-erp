import { useCallback, useEffect, useState } from 'react'

import { supplyEntryService } from '../services/supplyEntryService'

/**
 * Custom hook for loading supply entry detail from the new /supply-entries API.
 * @param {string} entryId - ID of the entry to load
 */
export function useSupplyEntryDetail(entryId) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [entry, setEntry] = useState(null)
  const [showAnnulDialog, setShowAnnulDialog] = useState(false)
  const [annulling, setAnnulling] = useState(false)

  const loadEntryDetail = useCallback(async () => {
    if (!entryId) return

    try {
      setLoading(true)
      setError(null)
      const entryData = await supplyEntryService.getById(entryId)
      setEntry(entryData)
    } catch (err) {
      console.error('Error loading supply entry detail:', err)
      setError(err.response?.data?.detail || err.message || 'Error al cargar el abastecimiento')
    } finally {
      setLoading(false)
    }
  }, [entryId])

  const handleExport = useCallback(() => {
    console.log('Exporting supply entry:', entryId)
  }, [entryId])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleNavigateToLot = useCallback((lotId) => {
    console.log('Navigate to lot:', lotId)
  }, [])

  const handleAnnul = useCallback(async () => {
    setAnnulling(true)

    try {
      console.log('Supply entry annulment is pending backend endpoint:', entryId)
      setShowAnnulDialog(false)
    } finally {
      setAnnulling(false)
    }
  }, [entryId])

  useEffect(() => {
    loadEntryDetail()
  }, [loadEntryDetail])

  return {
    loading,
    error,
    entry,
    showAnnulDialog,
    annulling,
    setShowAnnulDialog,
    handleAnnul,
    handleExport,
    handlePrint,
    handleNavigateToLot,
    loadEntryDetail,
  }
}

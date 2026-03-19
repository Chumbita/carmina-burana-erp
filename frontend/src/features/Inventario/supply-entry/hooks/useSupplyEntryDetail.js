import { useState, useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { ANNULMENT_RESTRICTIONS } from '../constants/supplyEntry.constants'

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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock detail data - replace with actual API call
      const mockEntry = {
        id: entryId,
        receptionId: 'REC-20250319-001',
        date: '2025-03-19T10:30:00',
        supplier: 'Maltería Nacional',
        invoiceNumber: 'INV-2025-001234',
        description: 'Abastecimiento mensual de maltas especiales',
        totalCost: 2500.00,
        status: 'active',
        items: [
          {
            id: '1',
            inputId: '1',
            inputName: 'Malta Pilsen',
            inputUnit: 'kg',
            quantity: 200,
            unitCost: 2.50,
            totalCost: 500.00,
            expirationDate: '2025-12-31',
            batchNumber: 'LOT-2025-001',
            comment: 'Malta especial para Lager',
            consumedQuantity: 0,
            batchId: 'BATCH-001'
          },
          {
            id: '2',
            inputId: '2',
            inputName: 'Malta Caramelo',
            inputUnit: 'kg',
            quantity: 150,
            unitCost: 3.00,
            totalCost: 450.00,
            expirationDate: '2025-12-31',
            batchNumber: 'LOT-2025-002',
            comment: 'Para aportes de color y sabor',
            consumedQuantity: 0,
            batchId: 'BATCH-002'
          }
        ],
        createdAt: '2025-03-19T10:30:00',
        updatedAt: '2025-03-19T10:30:00'
      }
      
      setEntry(mockEntry)
    } catch (err) {
      console.error('Error loading entry detail:', err)
      setError(err.message || 'Error al cargar el abastecimiento')
    } finally {
      setLoading(false)
    }
  }, [entryId])

  // Check if annulment is allowed
  const canAnnul = useMemo(() => {
    if (!entry) return false
    
    const entryDate = new Date(entry.date)
    const now = new Date()
    const hoursDiff = (now - entryDate) / (1000 * 60 * 60)
    
    const withinTimeLimit = hoursDiff <= ANNULMENT_RESTRICTIONS.HOURS_LIMIT
    const batchesConsumed = entry.items?.some(item => item.consumedQuantity > 0) || false
    
    return withinTimeLimit && !batchesConsumed && entry.status === 'active'
  }, [entry])

  // Handle annulment
  const handleAnnul = useCallback(async (data) => {
    if (!entryId) return

    try {
      setAnnulling(true)
      setError(null)
      
      await onAnnul(entryId, data.reason)
      
      // Update local state
      setEntry(prev => ({
        ...prev,
        status: 'annulled',
        annulledAt: new Date().toISOString(),
        annulmentReason: data.reason
      }))
      
      setShowAnnulDialog(false)
      resetAnnulment()
      
    } catch (err) {
      console.error('Error annulling entry:', err)
      setError(err.message || 'Error al anular el abastecimiento')
    } finally {
      setAnnulling(false)
    }
  }, [entryId, onAnnul, resetAnnulment])

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
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { supplyEntryService } from '../services/supplyEntryService'

// Schema for annulment confirmation
const annulmentSchema = z.object({
  reason: z.string().min(1, 'Debe especificar un motivo para anular'),
})

function normalizeEntry(entry) {
  if (!entry) return entry

  return {
    ...entry,
    status: entry.status === 'CANCELED' ? 'cancelled' : 'active',
    reception_number: entry.document_number,
    supplier: entry.supplier?.name ?? 'Sin proveedor',
    supplierId: entry.supplier?.id ?? null,
    invoiceNumber: entry.document_number,
    total_cost: Number(entry.total_cost ?? 0),
    annulledAt: entry.canceled_at,
    annulmentReason: entry.cancellation_reason,
    rawEntryDate: entry.entry_date,
    items: (entry.lines ?? []).map((line) => ({
      id: line.lot_id ?? line.item?.id,
      lineId: line.lot_id,
      supply_id: line.item?.id,
      supply_name: line.item?.name,
      amount: Number(line.quantity ?? 0),
      unit_cost: Number(line.unit_cost ?? 0),
      expire_date: line.expiration_date?.split('T')[0],
      lot_code: line.lot_code,
      comment: line.comment,
      batch: {
        id: line.lot_id,
        lot_code: line.lot_code,
        initial_amount: Number(line.quantity ?? 0),
        current_amount: Number(line.quantity ?? 0),
      },
    })),
  }
}

function toEditInitialData(rawEntry, normalized) {
  if (!rawEntry || !normalized) return null
  return {
    supplierId: rawEntry.supplier?.id ?? normalized.supplierId ?? 0,
    entryDate: rawEntry.entry_date ? rawEntry.entry_date.slice(0, 16) : normalized.rawEntryDate?.slice(0, 16) ?? '',
    invoiceNumber: rawEntry.document_number ?? '',
    description: rawEntry.description ?? '',
    items: (rawEntry.lines ?? []).map((line) => ({
      lineId: line.lot_id,
      supplyId: line.item?.id ?? 0,
      quantity: Number(line.quantity ?? 0),
      unitCost: Number(line.unit_cost ?? 0),
      expirationDate: line.expiration_date ? line.expiration_date.split('T')[0] : '',
      batchNumber: line.lot_code ?? '',
      comment: line.comment ?? '',
    })),
  }
}

/**
 * Custom hook for managing supply entry detail logic
 * @param {string} entryId - ID of the entry to load
 * @param {Function} onAnnul - Callback for annulment
 */
export function useSupplyEntryDetail(entryId) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [entry, setEntry] = useState(null)
  const [rawEntry, setRawEntry] = useState(null)
  const [showAnnulDialog, setShowAnnulDialog] = useState(false)
  const [annulling, setAnnulling] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editing, setEditing] = useState(false)

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
      const entryData = await supplyEntryService.getById(entryId)
      
      setRawEntry(entryData)
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

  const canEdit = useMemo(() => {
    if (!entry) return false
    return entry.status === 'active'
  }, [entry])

  const editInitialData = useMemo(() => toEditInitialData(rawEntry, entry), [rawEntry, entry])

  // Handle annulment
  const handleAnnul = useCallback(async (data) => {
    if (!entryId) return

    try {
      setAnnulling(true)
      setError(null)
      
      await supplyEntryService.cancel(entryId, data.reason)
      
      // Reload data from backend to get updated state
      const updatedEntry = await supplyEntryService.getById(entryId)
      setRawEntry(updatedEntry)
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

  const handleUpdate = useCallback(async (formData) => {
    if (!entryId) return
    if (!canEdit) {
      setError('No se puede editar un abastecimiento anulado o con lotes consumidos')
      return
    }
    try {
      setEditing(true)
      setError(null)
      const payload = {
        supplier_id: formData.supplierId,
        document_number: formData.invoiceNumber || undefined,
        entry_date: formData.entryDate ? new Date(formData.entryDate).toISOString() : undefined,
        description: formData.description || undefined,
        lines: formData.items.map((item) => ({
          line_id: item.lineId || undefined,
          item_id: item.supplyId,
          quantity: item.quantity,
          unit_cost: item.unitCost,
          expiration_date: new Date(item.expirationDate).toISOString(),
          lot_code: item.batchNumber || undefined,
          comment: item.comment || undefined,
        })),
      }
      const updated = await supplyEntryService.update(entryId, payload)
      setRawEntry(updated)
      setEntry(normalizeEntry(updated))
      setShowEditDialog(false)
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Error al actualizar el abastecimiento'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      throw err
    } finally {
      setEditing(false)
    }
  }, [entryId, canEdit])

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
    rawEntry,
    showAnnulDialog,
    annulling,
    showEditDialog,
    editing,
    editInitialData,
    
    // Computed values
    canAnnul,
    canEdit,
    isAnnulmentValid,
    
    // Form
    registerAnnulment,
    handleAnnulmentSubmit,
    
    // Actions
    setShowAnnulDialog,
    setShowEditDialog,
    handleAnnul,
    handleUpdate,
    handleExport,
    handlePrint,
    handleNavigateToBatch,
    loadEntryDetail,
  }
}
